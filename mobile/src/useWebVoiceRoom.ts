import { useCallback, useEffect, useRef, useState } from 'react';
import { AgentState } from 'agora-agent-client-toolkit';
import { AGENT_BACKEND_URL } from './config';
import {
  VoiceRoomApi,
  type VoiceRoomAccess,
  type VoiceLanguage,
  type VoiceRoom,
} from './VoiceRoomApi';
import type { StageCommand } from './liveStageTypes';
import { voiceTurns, type VoiceTurn } from './voiceTranscripts';
import type { WebVoiceSession, VideoFeed } from './agora/WebVoiceSession';

type Phase = 'idle' | 'connecting' | 'active' | 'ending';
type Connection = {
  api: VoiceRoomApi;
  session?: WebVoiceSession;
  access?: VoiceRoomAccess;
  speechSent: Set<string>;
  speechPending: Set<string>;
  speechAttempts: Map<string, number>;
};
function acceptRoom(connection: Connection, room: VoiceRoom) {
  if (!connection.access) return;
  const existing = connection.access.room.stage;
  connection.access.room =
    existing && room.stage && existing.revision > room.stage.revision
      ? { ...room, stage: existing }
      : room;
}
function errorMessage(error: unknown, access?: VoiceRoomAccess) {
  const raw =
    error instanceof Error
      ? error.message
      : 'The live connection failed. Leave and try again.';
  if (
    /PERMISSION_DENIED|NotAllowedError|denied|Permission dismissed/i.test(raw)
  )
    return 'Microphone permission was declined. Allow microphone access in your browser and try again.';
  if (/DEVICE_NOT_FOUND|NotFoundError/i.test(raw))
    return 'No microphone was found. Connect a microphone and try again.';
  return (
    access?.config.token
      ? raw.replaceAll(access.config.token, '[redacted]')
      : raw
  ).slice(0, 300);
}
export function useWebVoiceRoom() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [health, setHealth] = useState<'checking' | 'ready' | 'offline'>(
    'checking',
  );
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [stageError, setStageError] = useState<string | null>(null);
  const [stageBusy, setStageBusy] = useState(false);
  const [stageOnly, setStageOnly] = useState(false);
  const [access, setAccess] = useState<VoiceRoomAccess | null>(null);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [agentState, setAgentState] = useState(AgentState.IDLE);
  const [peers, setPeers] = useState<string[]>([]);
  const [micMuted, setMicMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [assistantLevel, setAssistantLevel] = useState(0);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [videoFeeds, setVideoFeeds] = useState<VideoFeed[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const cameraPending = useRef(false);
  const current = useRef<Connection | null>(null);
  const mounted = useRef(true);

  const checkHealth = useCallback(async () => {
    setHealth('checking');
    try {
      const result = await new VoiceRoomApi(AGENT_BACKEND_URL).health();
      if (mounted.current) setHealth(result.configured ? 'ready' : 'offline');
    } catch {
      if (mounted.current) setHealth('offline');
    }
  }, []);
  const end = useCallback(async () => {
    const connection = current.current;
    current.current = null;
    if (!connection) return;
    if (mounted.current) setPhase('ending');
    // stop() closes the microphone synchronously before waiting for SDK logout.
    await Promise.allSettled([
      connection.session?.stop(),
      connection.access && connection.api.leave(connection.access),
    ]);
    if (mounted.current) {
      setPhase('idle');
      setAccess(null);
      setStageError(null);
      setStageBusy(false);
      setStageOnly(false);
      setPeers([]);
      setVideoFeeds([]);
      setCameraEnabled(false);
      setCameraBusy(false);
      cameraPending.current = false;
      setMicLevel(0);
      setAssistantLevel(0);
      setMicMuted(false);
      setAudioBlocked(false);
      setAgentState(AgentState.IDLE);
    }
  }, []);

  const connect = useCallback(
    async (
      name: string,
      roomCode?: string,
      language: VoiceLanguage = 'multi',
      planningOnly = false,
    ) => {
      if (current.current) return;
      const connection: Connection = {
        api: new VoiceRoomApi(AGENT_BACKEND_URL),
        speechSent: new Set(),
        speechPending: new Set(),
        speechAttempts: new Map(),
      };
      current.current = connection;
      const active = () => mounted.current && current.current === connection;
      setPhase('connecting');
      setError(null);
      setStageError(null);
      setStageOnly(planningOnly);
      setAgentState(AgentState.IDLE);
      setAssistantLevel(0);
      setAudioBlocked(false);
      setTurns([]);
      setVideoFeeds([]);
      setCameraEnabled(false);
      setStatus('Preparing voice');
      try {
        // Read checks and real shared voting also work without media permissions.
        if (planningOnly) {
          connection.access = roomCode
            ? await connection.api.join(roomCode, name.trim() || 'Guest')
            : await connection.api.create(name.trim() || 'You', language);
          if (!active()) {
            await connection.api.leave(connection.access).catch(() => {});
            return;
          }
          setAccess({ ...connection.access });
          setPhase('active');
          setStatus('Shared planning connected');
          return;
        }
        // SDKs load only when a visitor chooses live voice.
        const { WebVoiceSession: Session } = await import(
          './agora/WebVoiceSession'
        );
        if (!active()) return;
        connection.session = new Session({
          transcript: items => {
            if (active()) setTurns(voiceTurns(items));
          },
          state: state => {
            if (active()) setAgentState(state);
          },
          peers: ids => {
            if (active()) setPeers(ids);
          },
          video: feeds => {
            if (active()) {
              setVideoFeeds(feeds);
              setCameraEnabled(feeds.some(feed => feed.local));
            }
          },
          micLevel: level => {
            if (active()) setMicLevel(level);
          },
          assistantLevel: level => {
            if (active()) setAssistantLevel(level);
          },
          audioBlocked: blocked => {
            if (active()) setAudioBlocked(blocked);
          },
          status: text => {
            if (active()) setStatus(text);
          },
          error: err => {
            if (active()) setError(errorMessage(err, connection.access));
          },
        });
        await connection.session.prepare();
        if (!active()) return;
        connection.access = roomCode
          ? await connection.api.join(roomCode, name.trim() || 'Guest')
          : await connection.api.create(name.trim() || 'You', language);
        if (!active()) {
          await connection.api.leave(connection.access).catch(() => {});
          return;
        }
        setAccess(connection.access);
        await connection.session.start(connection.access.config);
        if (!active()) return;
        if (connection.access.room.hostUid === connection.access.config.uid) {
          setStatus('Inviting the room assistant');
          const result = await connection.api.inviteAssistant(
            connection.access,
          );
          connection.access.room = result.room;
        }
        if (!active()) return;
        setAccess({ ...connection.access });
        setPhase('active');
        setStatus('Live voice connected');
      } catch (err) {
        if (active()) setError(errorMessage(err, connection.access));
        await Promise.allSettled([
          connection.session?.stop(),
          connection.access && connection.api.leave(connection.access),
        ]);
        if (active()) {
          current.current = null;
          setPhase('idle');
          setAccess(null);
          setPeers([]);
          setVideoFeeds([]);
        }
      }
    },
    [],
  );

  useEffect(() => {
    mounted.current = true;
    checkHealth();
    const leave = () => {
      end();
    };
    window.addEventListener('pagehide', leave);
    return () => {
      mounted.current = false;
      window.removeEventListener('pagehide', leave);
      end();
    };
  }, [checkHealth, end]);

  useEffect(() => {
    if (phase !== 'active') return;
    let polling = false;
    const refresh = async () => {
      const connection = current.current;
      if (!connection?.access || polling) return;
      polling = true;
      try {
        const result = await connection.api.status(connection.access);
        if (current.current !== connection || !mounted.current) return;
        acceptRoom(connection, result.room);
        setAccess({ ...connection.access });
        if (result.room.closed) {
          setError('This room has ended. Start or join a new room.');
          await end();
        }
      } catch (err) {
        if (mounted.current && current.current === connection)
          setError(errorMessage(err, connection.access));
      } finally {
        polling = false;
      }
    };
    const timer = setInterval(refresh, 1200);
    return () => clearInterval(timer);
  }, [phase, end]);

  const stageCommand = useCallback(async (command: StageCommand) => {
    const connection = current.current;
    if (!connection?.access || !mounted.current) return false;
    setStageError(null);
    setStageBusy(true);
    try {
      const result = await connection.api.stage(connection.access, command);
      if (mounted.current && current.current === connection) {
        acceptRoom(connection, result.room);
        setAccess({ ...connection.access });
        return true;
      }
    } catch (err) {
      if (mounted.current && current.current === connection)
        setStageError(errorMessage(err, connection.access));
    } finally {
      if (mounted.current && current.current === connection)
        setStageBusy(false);
    }
    return false;
  }, []);

  useEffect(() => {
    const connection = current.current;
    if (phase !== 'active' || !connection?.access) return;
    for (const turn of turns) {
      if (
        !turn.final ||
        turn.role !== 'user' ||
        turn.uid !== connection.access.config.uid ||
        connection.speechSent.has(turn.key) ||
        connection.speechPending.has(turn.key) ||
        (connection.speechAttempts.get(turn.key) || 0) >= 3
      )
        continue;
      connection.speechPending.add(turn.key);
      connection.speechAttempts.set(
        turn.key,
        (connection.speechAttempts.get(turn.key) || 0) + 1,
      );
      connection.api
        .stage(connection.access, {
          action: 'utterance',
          text: turn.text.slice(0, 1500),
          turnId: String(turn.turnId),
        })
        .then(result => {
          connection.speechSent.add(turn.key);
          if (mounted.current && current.current === connection) {
            acceptRoom(connection, result.room);
            setAccess({ ...connection.access! });
          }
        })
        .catch(() => {
          if (mounted.current && current.current === connection)
            setStageError(
              'Could not sync that speech turn. You can type the request on the Stage.',
            );
        })
        .finally(() => connection.speechPending.delete(turn.key));
    }
  }, [turns, phase, access]);

  const toggleMic = async () => {
    const next = !micMuted;
    try {
      await current.current?.session?.mute(next);
      setMicMuted(next);
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  const enableAudio = () => current.current?.session?.enableAudio();
  const toggleCamera = async () => {
    const connection = current.current;
    if (!connection?.session || phase !== 'active' || cameraPending.current)
      return;
    cameraPending.current = true;
    setCameraBusy(true);
    setError(null);
    try {
      const enabled = await connection.session.setCamera(!cameraEnabled);
      if (mounted.current && current.current === connection)
        setCameraEnabled(enabled);
    } catch (err) {
      if (mounted.current && current.current === connection) {
        const raw = err instanceof Error ? err.message : String(err);
        setError(
          /denied|NotAllowed|PERMISSION|dismissed/i.test(raw)
            ? 'Camera permission was declined. Voice still works. Allow camera access in your browser to try again.'
            : /NotFound|DEVICE_NOT_FOUND/i.test(raw)
            ? 'No camera was found. Voice still works.'
            : 'Could not start the camera. Voice still works. Check whether another app is using it.',
        );
      }
    } finally {
      if (mounted.current && current.current === connection) {
        cameraPending.current = false;
        setCameraBusy(false);
      }
    }
  };
  return {
    phase,
    health,
    error,
    status,
    stageError,
    stageBusy,
    stageOnly,
    stageCommand,
    access,
    turns,
    agentState,
    peers,
    micMuted,
    micLevel,
    assistantLevel,
    audioBlocked,
    videoFeeds,
    cameraEnabled,
    cameraBusy,
    toggleCamera,
    connect,
    end,
    toggleMic,
    enableAudio,
    checkHealth,
  };
}
