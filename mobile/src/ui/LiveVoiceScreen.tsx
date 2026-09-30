import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCallStore } from '../CallState';
import { AGENT_BACKEND_URL } from '../config';
import { AgoraMark, BrandIcon } from './Brand';
import { CallScreen } from './CallScreen';
import { colors } from './theme';

export function LiveVoiceScreen({ onLeave }: { onLeave: () => void }) {
  const [url, setUrl] = useState(AGENT_BACKEND_URL);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  if (activeUrl) return <LiveCall key={activeUrl} backendUrl={activeUrl} onLeave={() => { setActiveUrl(null); }} />;
  return <View style={s.screen}>
    <BrandIcon size={68} /><Text style={s.title}>Talk with RoundTable</Text><AgoraMark />
    <Text style={s.body}>Agora Conversational AI carries your voice, agent audio and live captions. The voice session is separate from the guided group decision demo.</Text>
    <Text style={s.label}>BACKEND URL</Text>
    <TextInput accessibilityLabel="Agora backend URL" value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" style={s.input} />
    <Text style={s.note}>Use your server's reachable HTTPS or LAN URL on a phone. 10.0.2.2 is for the Android emulator. Credentials stay on the backend.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Prepare voice session" onPress={() => { if (/^https?:\/\/.+/i.test(url.trim())) setActiveUrl(url.trim().replace(/\/+$/, '')); }} style={s.button}><Text style={s.buttonText}>Prepare voice session</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={onLeave}><Text style={s.back}>Back to RoundTable</Text></Pressable>
  </View>;
}

function LiveCall({ backendUrl, onLeave }: { backendUrl: string; onLeave: () => void }) {
  const store = useCallStore(backendUrl);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const end = store.end;
  useEffect(() => () => { void end(); }, [end]);
  async function connect() {
    setRequesting(true);
    setPermissionError(null);
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionError('Microphone access is required for the Agora voice session.');
          return;
        }
      }
      await store.connect();
    } catch (error) {
      setPermissionError(error instanceof Error ? error.message : 'Unable to start voice.');
    } finally {
      setRequesting(false);
    }
  }
  if (store.phase === 'inCall') return <CallScreen agentState={store.agentState} micMuted={store.micMuted} turns={store.turns} onToggleMic={store.toggleMic} onEnd={() => { void store.end().then(onLeave); }} />;
  const busy = requesting || store.phase === 'connecting';
  return <View style={s.screen}>
    <BrandIcon size={68} /><Text style={s.title}>Agora voice session</Text><AgoraMark />
    <Text style={s.body}>Your microphone joins an Agora RTC channel. RTM carries live transcripts and agent state back to this screen.</Text>
    <Text style={s.note}>{backendUrl}</Text>
    {store.error || permissionError ? <Text accessibilityRole="alert" style={s.error}>{permissionError || store.error}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityLabel="Connect Agora voice" disabled={busy} onPress={() => { void connect(); }} style={[s.button, busy && { opacity: .6 }]}><Text style={s.buttonText}>{busy ? 'Connecting…' : 'Connect Agora voice'}</Text></Pressable>
    <Pressable accessibilityRole="button" disabled={busy} onPress={onLeave}><Text style={s.back}>Change backend URL</Text></Pressable>
  </View>;
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.ink, padding: 26, justifyContent: 'center', gap: 18 }, title: { color: colors.surface, fontSize: 28, fontWeight: '900' }, body: { color: '#DDD6E9', fontSize: 14, lineHeight: 23 }, label: { color: colors.lime, fontSize: 10, letterSpacing: 1.3, fontWeight: '800', marginTop: 8 }, input: { backgroundColor: '#302A3F', color: '#FFF', borderColor: '#65557C', borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 14 }, note: { color: '#AFA8B8', fontSize: 11, lineHeight: 18 }, button: { backgroundColor: colors.lime, padding: 18, borderRadius: 18 }, buttonText: { color: colors.ink, textAlign: 'center', fontSize: 13, fontWeight: '800' }, back: { color: '#DDD6E9', textAlign: 'center', padding: 10 }, error: { color: '#FFC4BD', fontSize: 13, lineHeight: 20 } });
