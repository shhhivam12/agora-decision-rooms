import AgoraRTC, {
  type IAgoraRTCClient,
  type IMicrophoneAudioTrack,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import AgoraRTM, { type RTMClient } from 'agora-rtm';
import {
  AgoraVoiceAI,
  AgoraVoiceAIEvents,
  TranscriptHelperMode,
  type AgentState,
} from 'agora-agent-client-toolkit';
import type { AgentConfig } from '../BackendApi';
import type { VoiceTranscript } from '../voiceTranscripts';

export interface WebVoiceCallbacks {
  transcript: (items: VoiceTranscript[]) => void;
  state: (state: AgentState) => void;
  peers: (uids: string[]) => void;
  video: (feeds: VideoFeed[]) => void;
  audioBlocked: (blocked: boolean) => void;
  micLevel: (level: number) => void;
  assistantLevel?: (level: number) => void;
  status: (status: string) => void;
  error: (error: unknown) => void;
}
export interface VideoFeed {
  uid: string;
  local: boolean;
  track: ICameraVideoTrack | IRemoteVideoTrack;
}
export class WebVoiceSession {
  private rtc?: IAgoraRTCClient;
  private rtm?: RTMClient;
  private mic?: IMicrophoneAudioTrack;
  private camera?: ICameraVideoTrack;
  private activeCameras = new Set<ICameraVideoTrack>();
  private localUid = '';
  private remoteVideo = new Map<string, IRemoteVideoTrack>();
  private cameraRevision = 0;
  private ai?: AgoraVoiceAI;
  private channel?: string;
  private stopped = false;
  private levelTimer?: ReturnType<typeof setInterval>;
  private assistantLevelTimer?: ReturnType<typeof setInterval>;
  private lastAssistantLevel = -1;
  private subscribed = new Map<string, symbol>();
  private autoplay = () => this.cb.audioBlocked(true);
  constructor(private cb: WebVoiceCallbacks) {}
  private closeCamera(camera: ICameraVideoTrack) {
    if (this.activeCameras.delete(camera)) {
      camera.stop();
      camera.close();
    }
  }
  private emitVideo() {
    this.cb.video([
      ...(this.camera
        ? [{ uid: this.localUid, local: true, track: this.camera }]
        : []),
      ...Array.from(this.remoteVideo, ([uid, track]) => ({
        uid,
        local: false,
        track,
      })),
    ]);
  }
  async prepare() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'Microphone access needs localhost or HTTPS. On Android use the USB demo setup.',
      );
    }
    this.cb.status('Allow microphone access');
    AgoraRTC.setLogLevel(3);
    this.mic = await AgoraRTC.createMicrophoneAudioTrack({
      AEC: true,
      ANS: true,
      AGC: true,
    });
    if (this.stopped) {
      this.mic.close();
      throw new Error('Connection cancelled.');
    }
    this.levelTimer = setInterval(
      () => this.cb.micLevel(this.mic?.getVolumeLevel() || 0),
      250,
    );
  }
  async start(config: AgentConfig) {
    if (this.stopped) throw new Error('Connection cancelled.');
    this.channel = config.channelName;
    this.localUid = config.uid;
    this.rtc = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    const rtc = this.rtc;
    // Sample the received assistant track, never a participant's microphone.
    // Only changed levels reach React; quiet rooms don't repeatedly re-render.
    this.assistantLevelTimer = setInterval(() => {
      const track = rtc.remoteUsers.find(
        user => String(user.uid) === config.agentUid,
      )?.audioTrack;
      let sample = 0;
      try {
        sample = track?.getVolumeLevel?.() || 0;
      } catch {
        /* Track may be leaving. */
      }
      const level = Number.isFinite(sample)
        ? Math.max(0, Math.min(1, sample))
        : 0;
      if (
        Math.abs(level - this.lastAssistantLevel) > 0.02 ||
        (level === 0 && this.lastAssistantLevel !== 0)
      ) {
        this.lastAssistantLevel = level;
        this.cb.assistantLevel?.(level);
      }
    }, 120);
    AgoraRTC.onAutoplayFailed = this.autoplay;
    const peers = () => this.cb.peers(rtc.remoteUsers.map(u => String(u.uid)));
    const subscribe = async (
      user: IAgoraRTCRemoteUser,
      media: 'audio' | 'video',
    ) => {
      const uid = String(user.uid);
      const key = `${uid}:${media}`;
      if (this.stopped || this.subscribed.has(key)) return;
      const attempt = Symbol(key);
      this.subscribed.set(key, attempt);
      try {
        await rtc.subscribe(user, media);
        if (!this.stopped && this.subscribed.get(key) === attempt) {
          if (media === 'audio') user.audioTrack?.play();
          else if (user.videoTrack) {
            this.remoteVideo.set(uid, user.videoTrack);
            this.emitVideo();
          }
          peers();
        }
      } catch (error) {
        if (this.subscribed.get(key) === attempt) {
          this.subscribed.delete(key);
          if (!this.stopped) this.cb.error(error);
        }
      }
    };
    rtc.on('user-joined', peers);
    rtc.on('user-left', user => {
      const uid = String(user.uid);
      this.subscribed.delete(`${uid}:audio`);
      this.subscribed.delete(`${uid}:video`);
      this.remoteVideo.delete(uid);
      this.emitVideo();
      peers();
    });
    rtc.on('user-unpublished', (user, media) => {
      const uid = String(user.uid);
      this.subscribed.delete(`${uid}:${media}`);
      if (media === 'video') {
        this.remoteVideo.delete(uid);
        this.emitVideo();
      }
      peers();
    });
    rtc.on('user-published', (user, type) => {
      if (type === 'audio' || type === 'video')
        subscribe(user, type).catch(this.cb.error);
    });
    rtc.on('connection-state-change', state => {
      if (state === 'RECONNECTING') this.cb.status('Reconnecting audio…');
      if (state === 'DISCONNECTED' && !this.stopped)
        this.cb.error(
          new Error('Audio disconnected. Leave and rejoin the room.'),
        );
    });
    this.cb.status('Joining Agora audio');
    await rtc.join(
      config.appId,
      config.channelName,
      config.token,
      Number(config.uid),
    );
    if (this.stopped) {
      await rtc.leave();
      throw new Error('Connection cancelled.');
    }
    if (!this.mic) throw new Error('Microphone is not ready.');
    await rtc.publish(this.mic);
    for (const user of rtc.remoteUsers) {
      if (user.hasAudio) await subscribe(user, 'audio');
      if (user.hasVideo) await subscribe(user, 'video');
    }
    peers();
    this.cb.status('Connecting live captions');
    this.rtm = new AgoraRTM.RTM(config.appId, config.uid, {
      logLevel: 'error',
    });
    await this.rtm.login({ token: config.token });
    if (this.stopped) {
      await this.rtm.logout();
      throw new Error('Connection cancelled.');
    }
    this.ai = await AgoraVoiceAI.init({
      rtcEngine: rtc,
      rtmConfig: { rtmEngine: this.rtm },
      renderMode: TranscriptHelperMode.TEXT,
    });
    this.ai.on(AgoraVoiceAIEvents.TRANSCRIPT_UPDATED, this.cb.transcript);
    this.ai.on(AgoraVoiceAIEvents.AGENT_STATE_CHANGED, (_uid, event) =>
      this.cb.state(event.state),
    );
    this.ai.on(AgoraVoiceAIEvents.AGENT_ERROR, (_uid, error) =>
      this.cb.error(error),
    );
    this.ai.subscribeMessage(config.channelName);
    await this.rtm.subscribe(config.channelName, {
      withMessage: true,
      withPresence: true,
    });
    if (this.stopped) {
      await this.stop();
      throw new Error('Connection cancelled.');
    }
    this.cb.status('Audio and captions connected');
  }
  async mute(muted: boolean) {
    await this.mic?.setMuted(muted);
  }
  async setCamera(enabled: boolean): Promise<boolean> {
    const revision = ++this.cameraRevision;
    const rtc = this.rtc;
    if (!enabled) {
      const camera = this.camera;
      this.camera = undefined;
      this.emitVideo();
      if (camera) {
        let unpublish: Promise<void> | undefined;
        try {
          unpublish = rtc?.unpublish(camera);
        } finally {
          this.closeCamera(camera);
        }
        await unpublish;
      }
      return false;
    }
    if (this.stopped || !rtc) return false;
    if (this.camera) return true;
    const camera = await AgoraRTC.createCameraVideoTrack({
      facingMode: 'user',
      encoderConfig: '360p_1',
      optimizationMode: 'motion',
    });
    this.activeCameras.add(camera);
    try {
      if (this.stopped || revision !== this.cameraRevision) return false;
      await rtc.publish(camera);
      if (this.stopped || revision !== this.cameraRevision) {
        await rtc.unpublish(camera).catch(() => {});
        return false;
      }
      this.camera = camera;
      this.emitVideo();
      return true;
    } finally {
      if (this.camera !== camera) {
        this.closeCamera(camera);
      }
    }
  }
  enableAudio() {
    for (const user of this.rtc?.remoteUsers || []) user.audioTrack?.play();
    this.cb.audioBlocked(false);
  }
  async stop() {
    this.stopped = true;
    ++this.cameraRevision;
    for (const camera of this.activeCameras) this.closeCamera(camera);
    this.camera = undefined;
    this.remoteVideo.clear();
    this.emitVideo();
    if (this.levelTimer) clearInterval(this.levelTimer);
    if (this.assistantLevelTimer) clearInterval(this.assistantLevelTimer);
    this.cb.assistantLevel?.(0);
    this.mic?.stop();
    this.mic?.close();
    this.mic = undefined;
    if (AgoraRTC.onAutoplayFailed === this.autoplay)
      AgoraRTC.onAutoplayFailed = undefined;
    this.ai?.unsubscribe();
    this.ai?.destroy();
    this.ai = undefined;
    await Promise.allSettled([
      this.rtc?.leave(),
      this.rtm &&
        (async () => {
          if (this.channel)
            await this.rtm!.unsubscribe(this.channel).catch(() => {});
          await this.rtm!.logout();
        })(),
    ]);
    this.rtm = undefined;
    this.rtc = undefined;
    this.subscribed.clear();
  }
}
