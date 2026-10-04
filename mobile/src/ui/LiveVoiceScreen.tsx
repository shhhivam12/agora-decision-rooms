import {
  AppText as Text,
  AppTextInput as TextInput,
  AppPressable as Pressable,
} from '../i18n';
import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useCallStore } from '../CallState';
import { AGENT_BACKEND_URL } from '../config';
import { AgoraMark } from './Brand';
import { CallScreen } from './CallScreen';
import { RoomLoader } from './RoomLoader';
import { colors } from './theme';
import { CharacterBust } from './CharacterArt';
import { useLanguage } from '../i18n';
import type { VoiceLanguage } from '../VoiceRoomApi';
import { VoiceLanguageChoice } from './VoiceLanguageChoice';

export function LiveVoiceScreen({
  onLeave,
  onOpenDemo,
}: {
  onLeave: () => void;
  onOpenDemo?: () => void;
}) {
  const [url, setUrl] = useState(AGENT_BACKEND_URL);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const { language: interfaceLanguage } = useLanguage();
  const [language, setLanguage] = useState<VoiceLanguage>(
    interfaceLanguage === 'hi' ? 'hi' : 'multi',
  );
  if (activeUrl)
    return (
      <LiveCall
        key={activeUrl}
        backendUrl={activeUrl}
        language={language}
        onLeave={() => {
          setActiveUrl(null);
        }}
      />
    );
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.screenContent}>
      <CharacterBust id="kabir" size={100} />
      <Text style={s.title}>Your live voice room</Text>
      <AgoraMark />
      <Text style={s.body}>
        Agora Conversational AI carries your voice, agent audio and live
        captions. The voice session is separate from the guided group decision
        demo.
      </Text>
      <VoiceLanguageChoice value={language} onChange={setLanguage} />
      <Text style={s.label}>BACKEND URL</Text>
      <TextInput
        accessibilityLabel="Agora backend URL"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={s.input}
      />
      <Text style={s.note}>
        Use your server's reachable HTTPS or LAN URL on a phone. 10.0.2.2 is for
        the Android emulator. Credentials stay on the backend.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Prepare voice session"
        onPress={() => {
          if (/^https?:\/\/.+/i.test(url.trim()))
            setActiveUrl(url.trim().replace(/\/+$/, ''));
        }}
        style={s.button}
      >
        <Text style={s.buttonText}>Prepare voice session</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onLeave}>
        <Text style={s.back}>Back to Decision Rooms</Text>
      </Pressable>
      {onOpenDemo && (
        <Pressable accessibilityRole="button" onPress={onOpenDemo}>
          <Text style={s.back}>Explore the guided decision demo</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function LiveCall({
  backendUrl,
  language,
  onLeave,
}: {
  backendUrl: string;
  language: VoiceLanguage;
  onLeave: () => void;
}) {
  const store = useCallStore(backendUrl, language);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const end = store.end;
  useEffect(
    () => () => {
      void end();
    },
    [end],
  );
  async function connect() {
    setRequesting(true);
    setPermissionError(null);
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionError(
            'Microphone access is required for the Agora voice session.',
          );
          return;
        }
      }
      await store.connect();
    } catch (error) {
      setPermissionError(
        error instanceof Error ? error.message : 'Unable to start voice.',
      );
    } finally {
      setRequesting(false);
    }
  }
  if (store.phase === 'inCall')
    return (
      <CallScreen
        agentState={store.agentState}
        micMuted={store.micMuted}
        turns={store.turns}
        onToggleMic={store.toggleMic}
        onEnd={() => {
          void store.end().then(onLeave);
        }}
      />
    );
  const busy = requesting || store.phase === 'connecting';
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.screenContent}>
      {busy ? (
        <RoomLoader size={68} label="Connecting to your voice room" />
      ) : (
        <CharacterBust id="kabir" size={100} />
      )}
      <Text style={s.title}>Agora voice session</Text>
      <AgoraMark />
      <Text style={s.body}>
        Your microphone joins an Agora RTC channel. RTM carries live transcripts
        and agent state back to this screen.
      </Text>
      <Text style={s.note}>{backendUrl}</Text>
      {store.error || permissionError ? (
        <Text accessibilityRole="alert" style={s.error}>
          {permissionError || store.error}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Connect Agora voice"
        disabled={busy}
        onPress={() => {
          void connect();
        }}
        style={[s.button, busy && { opacity: 0.6 }]}
      >
        <Text style={s.buttonText}>
          {busy ? 'Connecting…' : 'Connect Agora voice'}
        </Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={busy} onPress={onLeave}>
        <Text style={s.back}>Change backend URL</Text>
      </Pressable>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  screenContent: {
    flexGrow: 1,
    padding: 26,
    justifyContent: 'center',
    gap: 18,
  },
  title: { color: colors.surface, fontSize: 28, fontWeight: '500' },
  body: { color: colors.inverse, fontSize: 14, lineHeight: 23 },
  label: {
    color: colors.canvas,
    fontSize: 10,
    letterSpacing: 1.3,
    fontWeight: '800',
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.inkSoft,
    color: '#FFF',
    borderColor: colors.darkLine,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 14,
  },
  note: { color: colors.inverseMuted, fontSize: 11, lineHeight: 18 },
  button: { backgroundColor: colors.canvas, padding: 18, borderRadius: 30 },
  buttonText: {
    color: colors.ink,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  back: { color: colors.inverse, textAlign: 'center', padding: 10 },
  error: { color: '#FFC4BD', fontSize: 13, lineHeight: 20 },
});
