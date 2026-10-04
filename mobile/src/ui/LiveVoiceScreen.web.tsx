import {
  AppText as Text,
  AppTextInput as TextInput,
  AppPressable as Pressable,
} from '../i18n';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AgentState } from 'agora-agent-client-toolkit';
import { useWebVoiceRoom } from '../useWebVoiceRoom';
import { AgoraMark, BrandIcon } from './Brand';
import { CharacterArt, CharacterBust } from './CharacterArt';
import { Icon } from './Icon';
import { RoomLoader } from './RoomLoader';
import { colors } from './theme';
import type { VoiceLanguage } from '../VoiceRoomApi';
import { useLanguage } from '../i18n';
import { VoiceLanguageChoice } from './VoiceLanguageChoice';
import { CaptionScroller } from './CaptionScroller';
import { LiveSmartStage } from './LiveSmartStage';
import { RoomParticipants } from './RoomParticipants.web';
import './LiveRoom.web.css';

const MemoLiveSmartStage = React.memo(LiveSmartStage);

export function LiveVoiceScreen({
  onLeave,
  onOpenDemo,
}: {
  onLeave: () => void;
  onOpenDemo?: () => void;
}) {
  const invite = new URLSearchParams(window.location.search).get('room') || '';
  const [mode, setMode] = useState<'create' | 'join'>(
    invite ? 'join' : 'create',
  );
  const [name, setName] = useState('');
  const [code, setCode] = useState(invite.slice(0, 8).toUpperCase());
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'stage' | 'conversation' | 'people'>(
    'stage',
  );
  const scroll = useRef<ScrollView>(null);
  const scrollTop = useCallback(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, []);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [view]);
  const { language: interfaceLanguage, t } = useLanguage();
  const [language, setLanguage] = useState<VoiceLanguage>(
    interfaceLanguage === 'hi' ? 'hi' : 'multi',
  );
  const voice = useWebVoiceRoom();
  const busy = voice.phase === 'connecting' || voice.phase === 'ending';
  const live = voice.phase === 'active';
  const room = voice.access?.room;
  const ownUid = voice.access?.config.uid;
  const host = !!room && room.hostUid === ownUid;
  const assistantJoined =
    !!voice.access && voice.peers.includes(voice.access.config.agentUid);
  const peopleOnline = live
    ? voice.stageOnly
      ? room?.members.length || 1
      : 1 +
        voice.peers.filter(uid => uid !== voice.access?.config.agentUid).length
    : 0;
  async function leave() {
    await voice.end();
    onLeave();
  }
  async function demo() {
    await voice.end();
    onOpenDemo?.();
  }
  async function copy() {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className={`voice-screen${live ? ' decision-live-room' : ''}`}>
      <View style={s.screen}>
        <View style={s.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back from live voice"
            onPress={leave}
            style={s.back}
          >
            <Icon name="back" size={20} />
          </Pressable>
          <BrandIcon size={34} />
          <View style={s.headerCopy}>
            <Text style={s.headerTitle}>Decision Rooms</Text>
            <Text style={s.headerMeta}>
              {voice.stageOnly
                ? 'Shared planning · microphone off'
                : 'Live voice with Agora'}
            </Text>
          </View>
          {live && (
            <View style={s.liveBadge}>
              <Text style={s.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        {live && (
          <View style={s.roomNavigation}>
            <View style={s.roomSummary}>
              <Text selectable translate={false} style={s.compactCode}>
                {room?.code}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Copy voice room code"
                onPress={copy}
                style={s.compactCopy}
              >
                <Text style={s.copyText}>
                  {copied ? 'Copied' : 'Copy code'}
                </Text>
              </Pressable>
              <Text translate={false} style={s.people}>
                {peopleOnline} {t(peopleOnline === 1 ? 'person' : 'people')} ·{' '}
                {t('15 min room')}
              </Text>
            </View>
            <View style={s.tabs}>
              {(['stage', 'conversation', 'people'] as const)
                .filter(item => !voice.stageOnly || item !== 'conversation')
                .map(item => (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityLabel={
                      item === 'stage'
                        ? 'Room + Stage'
                        : item === 'conversation'
                        ? 'Captions'
                        : 'Call view'
                    }
                    accessibilityState={{ selected: view === item }}
                    onPress={() => setView(item)}
                    style={[s.tab, view === item && s.tabSelected]}
                  >
                    <Text
                      style={[s.tabText, view === item && s.tabTextSelected]}
                    >
                      {item === 'stage'
                        ? 'Room + Stage'
                        : item === 'conversation'
                        ? 'Captions'
                        : 'Call view'}
                    </Text>
                  </Pressable>
                ))}
            </View>
            {!voice.stageOnly && (
              <View style={s.assistantStrip}>
                <CharacterBust id="kabir" size={28} />
                <Text style={s.assistantStripText}>
                  {assistantJoined
                    ? String(voice.agentState).replace(/_/g, ' ')
                    : 'Joining your room…'}
                </Text>
                {voice.agentState === AgentState.THINKING && (
                  <RoomLoader size={18} label="Room assistant is thinking" />
                )}
                <Icon name={voice.micMuted ? 'muted' : 'mic'} size={14} />
                <Text style={s.copyText}>
                  {voice.micMuted ? 'Muted' : 'Mic on'}
                </Text>
              </View>
            )}
            {voice.audioBlocked && (
              <Text accessibilityRole="alert" style={s.compactAlert}>
                Your browser paused audio. Tap Enable sound below.
              </Text>
            )}
            {voice.stageError && view !== 'stage' && (
              <Text accessibilityRole="alert" style={s.compactAlert}>
                {voice.stageError}
              </Text>
            )}
          </View>
        )}
        <div
          className={`room-workspace view-${view}${live ? ' is-active' : ''}`}
        >
          {live && room && ownUid && (
            <RoomParticipants
              room={room}
              ownUid={ownUid}
              feeds={voice.videoFeeds}
              peers={voice.peers}
              stageOnly={voice.stageOnly}
              state={voice.agentState}
              level={voice.assistantLevel}
              joined={assistantJoined}
              audioBlocked={voice.audioBlocked}
            />
          )}
          <div className="room-content-panel">
            <ScrollView
              ref={scroll}
              style={s.scroll}
              contentContainerStyle={[s.content, live && s.liveContent]}
            >
              {!live ? (
                <>
                  <Text style={s.kicker}>EVERY VOICE BELONGS AT THE TABLE</Text>
                  <Text style={s.title}>
                    Talk it out.{'\n'}Find common ground.
                  </Text>
                  <Text style={s.body}>
                    Start a room, invite your people and talk with the room
                    assistant. Everyone hears the conversation and sees live
                    captions.
                  </Text>
                  <CharacterArt scene="discussion" height={165} />
                  <View style={s.ready}>
                    <View
                      style={[s.dot, voice.health === 'ready' && s.readyDot]}
                    />
                    <Text style={s.readyText}>
                      {voice.health === 'ready'
                        ? 'Voice service ready'
                        : voice.health === 'checking'
                        ? 'Checking voice service…'
                        : 'Live voice service is unavailable'}
                    </Text>
                  </View>
                  <View style={s.tabs}>
                    {(['create', 'join'] as const).map(item => (
                      <Pressable
                        key={item}
                        accessibilityRole="button"
                        accessibilityLabel={
                          item === 'create' ? 'Start a room' : 'Join a room'
                        }
                        accessibilityState={{ selected: mode === item }}
                        disabled={busy}
                        onPress={() => setMode(item)}
                        style={[s.tab, mode === item && s.tabSelected]}
                      >
                        <Text
                          style={[
                            s.tabText,
                            mode === item && s.tabTextSelected,
                          ]}
                        >
                          {item === 'create' ? 'Start a room' : 'Join a room'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {mode === 'create' ? (
                    <VoiceLanguageChoice
                      value={language}
                      onChange={setLanguage}
                      disabled={busy}
                    />
                  ) : (
                    <Text style={s.note}>
                      The host chooses the assistant language. You can change
                      your interface language anytime.
                    </Text>
                  )}
                  <Text style={s.label}>YOUR NAME</Text>
                  <TextInput
                    accessibilityLabel="Your name for the voice room"
                    value={name}
                    onChangeText={setName}
                    maxLength={24}
                    placeholder={mode === 'create' ? 'You' : 'Guest'}
                    placeholderTextColor={colors.muted}
                    editable={!busy}
                    style={s.input}
                  />
                  {mode === 'join' && (
                    <>
                      <Text style={s.label}>ROOM CODE</Text>
                      <TextInput
                        accessibilityLabel="Live voice room code"
                        value={code}
                        onChangeText={value =>
                          setCode(
                            value
                              .replace(/[^a-f0-9]/gi, '')
                              .slice(0, 8)
                              .toUpperCase(),
                          )
                        }
                        autoCapitalize="characters"
                        autoCorrect={false}
                        placeholder="8-character room code"
                        placeholderTextColor={colors.muted}
                        editable={!busy}
                        style={s.input}
                      />
                    </>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      mode === 'create' ? 'Start live room' : 'Join live room'
                    }
                    accessibilityState={{
                      disabled:
                        busy ||
                        voice.health !== 'ready' ||
                        (mode === 'join' && code.length !== 8),
                    }}
                    disabled={
                      busy ||
                      voice.health !== 'ready' ||
                      (mode === 'join' && code.length !== 8)
                    }
                    onPress={() =>
                      voice.connect(
                        name,
                        mode === 'join' ? code : undefined,
                        language,
                      )
                    }
                    style={[
                      s.button,
                      (busy ||
                        voice.health !== 'ready' ||
                        (mode === 'join' && code.length !== 8)) &&
                        s.disabled,
                    ]}
                  >
                    {busy ? (
                      <View style={s.busy}>
                        <RoomLoader
                          size={28}
                          label={voice.status || 'Connecting live voice'}
                        />
                        <Text style={s.buttonText}>
                          {voice.phase === 'ending'
                            ? 'Ending the room…'
                            : voice.status}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <Text style={s.buttonText}>
                          {mode === 'create'
                            ? 'Start live room'
                            : 'Join live room'}
                        </Text>
                        <Icon
                          name="waveform"
                          size={20}
                          color={colors.inverse}
                        />
                      </>
                    )}
                  </Pressable>
                  {!busy && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open shared Stage without microphone"
                      disabled={
                        voice.health !== 'ready' ||
                        (mode === 'join' && code.length !== 8)
                      }
                      onPress={() =>
                        voice.connect(
                          name,
                          mode === 'join' ? code : undefined,
                          language,
                          true,
                        )
                      }
                      style={s.demo}
                    >
                      <Text style={s.demoText}>
                        Open shared Stage without microphone
                      </Text>
                    </Pressable>
                  )}
                  {busy && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Cancel voice connection"
                      onPress={voice.end}
                    >
                      <Text style={s.link}>Cancel connection</Text>
                    </Pressable>
                  )}
                  {voice.health === 'offline' && (
                    <>
                      <Text style={s.note}>
                        The decision demo is available below. A hosted judge
                        link needs the voice backend online to enable live
                        calls.
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Recheck voice service"
                        onPress={voice.checkHealth}
                      >
                        <Text style={s.link}>Check voice service again</Text>
                      </Pressable>
                    </>
                  )}
                  <Text style={s.note}>
                    Allow microphone access when your browser asks. For two
                    nearby devices, use headphones and take turns speaking.
                  </Text>
                </>
              ) : (
                <>
                  {room && ownUid && (
                    <View
                      style={view === 'stage' ? s.stageVisible : s.stageHidden}
                    >
                      <MemoLiveSmartStage
                        room={room}
                        ownUid={ownUid}
                        command={voice.stageCommand}
                        busy={voice.stageBusy}
                        error={voice.stageError}
                        onNavigate={view === 'stage' ? scrollTop : undefined}
                      />
                    </View>
                  )}
                  {!voice.stageOnly && (
                    <>
                      {view === 'conversation' && (
                        <>
                          <View style={s.meter}>
                            <Icon
                              name={voice.micMuted ? 'muted' : 'mic'}
                              size={16}
                            />
                            <Text style={s.meterText}>
                              {voice.micMuted
                                ? 'Your microphone is muted'
                                : 'Your microphone is on'}
                            </Text>
                            <View
                              accessibilityRole="progressbar"
                              accessibilityLabel="Microphone input level"
                              accessibilityValue={{
                                min: 0,
                                max: 100,
                                now: Math.round(voice.micLevel * 100),
                              }}
                              style={s.bars}
                            >
                              {[0, 1, 2, 3, 4].map(i => (
                                <View
                                  key={i}
                                  style={[
                                    s.bar,
                                    { height: 5 + i * 3 },
                                    !voice.micMuted &&
                                      voice.micLevel > i * 0.07 + 0.01 &&
                                      s.barActive,
                                  ]}
                                />
                              ))}
                            </View>
                          </View>
                          <View style={s.transcript}>
                            <View style={s.transcriptHead}>
                              <Icon name="captions" size={19} />
                              <Text style={s.transcriptTitle}>
                                Shared conversation
                              </Text>
                              <AgoraMark compact />
                            </View>
                            <Text style={s.note}>
                              Live captions from Agora. The assistant proposes;
                              your people decide.
                            </Text>
                            <CaptionScroller>
                              {voice.turns.length === 0 ? (
                                <View style={s.empty}>
                                  <CharacterBust id="kabir" size={64} />
                                  <Text style={s.emptyTitle}>
                                    Start with what matters to you.
                                  </Text>
                                  <Text style={s.emptyBody}>
                                    Tell the assistant your name, budget and the
                                    kind of evening you want.
                                  </Text>
                                </View>
                              ) : (
                                voice.turns.map(turn => (
                                  <View
                                    key={turn.key}
                                    style={[
                                      s.turn,
                                      turn.role === 'agent' && s.agentTurn,
                                    ]}
                                  >
                                    <Text
                                      translate={
                                        turn.role === 'agent' ||
                                        !room?.members.some(
                                          m => m.uid === turn.uid,
                                        )
                                      }
                                      style={s.turnRole}
                                    >
                                      {turn.role === 'agent'
                                        ? 'ROOM ASSISTANT'
                                        : room?.members.find(
                                            m => m.uid === turn.uid,
                                          )?.name ||
                                          (turn.uid === ownUid
                                            ? 'YOU'
                                            : 'PARTICIPANT')}
                                    </Text>
                                    <Text
                                      translate={false}
                                      selectable
                                      style={s.turnText}
                                    >
                                      {turn.text}
                                    </Text>
                                  </View>
                                ))
                              )}
                            </CaptionScroller>
                          </View>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
              {voice.error && (
                <Text accessibilityRole="alert" style={s.alert}>
                  {voice.error}
                </Text>
              )}
              {onOpenDemo && !live && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    live
                      ? 'Leave voice and explore decision demo'
                      : 'Explore the guided decision demo'
                  }
                  disabled={busy}
                  onPress={demo}
                  style={s.demo}
                >
                  <Text style={s.demoText}>
                    {live
                      ? 'Leave voice & explore the decision demo'
                      : 'Explore the guided decision demo'}{' '}
                    →
                  </Text>
                </Pressable>
              )}
              {!live && (
                <Text style={s.footnote}>
                  Live voice rooms last up to 15 minutes. The guided outing demo
                  uses sample options and local votes.
                </Text>
              )}
            </ScrollView>
          </div>
        </div>
        {live && (
          <View style={s.controls}>
            {!voice.stageOnly && (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    voice.micMuted
                      ? 'Unmute live microphone'
                      : 'Mute live microphone'
                  }
                  onPress={voice.toggleMic}
                  style={s.control}
                >
                  <Icon name={voice.micMuted ? 'muted' : 'mic'} size={20} />
                  <Text style={s.controlText}>
                    {voice.micMuted ? 'Unmute' : 'Mute'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Enable sound"
                  onPress={voice.enableAudio}
                  style={s.control}
                >
                  <Icon name="waveform" size={20} />
                  <Text style={s.controlText}>Enable sound</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    voice.cameraEnabled ? 'Turn camera off' : 'Enable camera'
                  }
                  accessibilityState={{
                    disabled: voice.cameraBusy,
                    selected: voice.cameraEnabled,
                  }}
                  disabled={voice.cameraBusy}
                  onPress={voice.toggleCamera}
                  style={[s.control, voice.cameraEnabled && s.cameraActive]}
                >
                  <View style={s.cameraIcon}>
                    <View style={s.cameraLens} />
                  </View>
                  <Text style={s.controlText}>
                    {voice.cameraBusy
                      ? 'Starting camera…'
                      : voice.cameraEnabled
                      ? 'Turn camera off'
                      : 'Enable camera'}
                  </Text>
                </Pressable>
              </>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={host ? 'End live room' : 'Leave live room'}
              onPress={voice.end}
              style={[s.control, s.end]}
            >
              <Icon name="leave" size={20} color={colors.inverse} />
              <Text style={s.endText}>{host ? 'End room' : 'Leave'}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </div>
  );
}
const s = StyleSheet.create({
  stageVisible: { display: 'flex' },
  stageHidden: { display: 'none' },
  roomNavigation: { paddingHorizontal: 18, gap: 9, paddingBottom: 8 },
  roomSummary: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  compactCode: {
    fontSize: 17,
    letterSpacing: 1.5,
    fontWeight: '600',
    color: colors.ink,
  },
  compactCopy: {
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
  },
  assistantStrip: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  assistantStripText: {
    flex: 1,
    color: colors.muted,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  compactAlert: { color: colors.danger, fontSize: 10, lineHeight: 15 },
  liveContent: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12 },
  videoSection: { marginTop: 18 },
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  videoTile: {
    width: '48%',
    height: 175,
    borderRadius: 22,
    overflow: 'hidden',
  },
  cameraOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    gap: 8,
  },
  videoName: { color: colors.ink, fontSize: 12 },
  videoMeta: { color: colors.muted, fontSize: 10 },
  cameraActive: { backgroundColor: colors.greenSoft },
  cameraIcon: {
    width: 22,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 5,
  },
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 15,
  },
  back: {
    height: 35,
    width: 35,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: '500', color: colors.ink },
  headerMeta: { fontSize: 9, color: colors.muted, marginTop: 4 },
  liveBadge: {
    backgroundColor: colors.greenSoft,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  liveText: { fontSize: 8, color: colors.green, letterSpacing: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 28 },
  kicker: { fontSize: 8, letterSpacing: 1.4, color: colors.muted },
  title: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1.2,
    fontWeight: '500',
    color: colors.ink,
    marginTop: 13,
  },
  body: { fontSize: 12, lineHeight: 19, color: colors.muted, marginTop: 12 },
  ready: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginVertical: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.mutedLight,
  },
  readyDot: { backgroundColor: colors.green },
  readyText: { fontSize: 10, color: colors.muted },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 25,
  },
  tab: { flex: 1, padding: 10, borderRadius: 22, alignItems: 'center' },
  tabSelected: { backgroundColor: colors.ink },
  tabText: { fontSize: 12, color: colors.muted },
  tabTextSelected: { color: colors.inverse },
  label: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.muted,
    marginTop: 19,
    marginBottom: 8,
  },
  input: {
    fontSize: 14,
    padding: 16,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
  },
  button: {
    minHeight: 55,
    marginTop: 17,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  buttonText: {
    fontSize: 12,
    color: colors.inverse,
    fontWeight: '500',
    flexShrink: 1,
  },
  disabled: { opacity: 0.45 },
  busy: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  note: { fontSize: 10, lineHeight: 17, color: colors.muted, marginTop: 10 },
  link: { fontSize: 11, color: colors.ink, textAlign: 'center', padding: 14 },
  roomCard: { backgroundColor: colors.surface, padding: 20, borderRadius: 28 },
  roomHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  people: { fontSize: 9, color: colors.muted },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 10,
  },
  code: {
    fontSize: 25,
    letterSpacing: 2,
    color: colors.ink,
    fontWeight: '500',
  },
  copy: {
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  copyText: { fontSize: 9, color: colors.ink },
  memberList: { marginTop: 17, gap: 12 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  memberCopy: { flex: 1 },
  memberName: { fontSize: 13, color: colors.ink, fontWeight: '500' },
  memberMeta: { fontSize: 9, color: colors.muted, marginTop: 4 },
  assistant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    padding: 14,
    marginTop: 15,
  },
  assistantTitle: { fontSize: 15, color: colors.ink, fontWeight: '500' },
  assistantMeta: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 6,
    textTransform: 'capitalize',
  },
  meter: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
  meterText: { fontSize: 10, color: colors.muted, flex: 1 },
  bars: { height: 22, flexDirection: 'row', alignItems: 'center', gap: 3 },
  bar: { width: 3, borderRadius: 2, backgroundColor: colors.line },
  barActive: { backgroundColor: colors.green },
  transcript: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 27,
  },
  transcriptHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  transcriptTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '500',
  },
  empty: { alignItems: 'center', paddingVertical: 27, gap: 10 },
  emptyTitle: { fontSize: 13, color: colors.ink, textAlign: 'center' },
  emptyBody: {
    fontSize: 10,
    lineHeight: 17,
    color: colors.muted,
    textAlign: 'center',
  },
  turn: {
    padding: 14,
    backgroundColor: colors.canvas,
    borderRadius: 18,
    marginTop: 12,
  },
  agentTurn: { backgroundColor: colors.surfaceMuted },
  turnRole: {
    fontSize: 8,
    letterSpacing: 0.8,
    color: colors.muted,
    marginBottom: 7,
  },
  turnText: { fontSize: 13, lineHeight: 20, color: colors.ink },
  alert: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: 14,
    borderRadius: 18,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 14,
  },
  demo: {
    padding: 15,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 23,
    marginTop: 18,
  },
  demoText: { color: colors.ink, fontSize: 11, textAlign: 'center' },
  footnote: {
    fontSize: 9,
    lineHeight: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 16,
  },
  controls: {
    flexDirection: 'row',
    gap: 9,
    padding: 14,
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  control: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  controlText: {
    fontSize: 9,
    color: colors.ink,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  end: { backgroundColor: colors.ink },
  endText: { fontSize: 9, color: colors.inverse },
});
