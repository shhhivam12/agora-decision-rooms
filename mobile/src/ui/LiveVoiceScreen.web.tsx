import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AgoraMark, BrandIcon } from './Brand';
import { colors } from './theme';

export function LiveVoiceScreen({ onLeave }: { onLeave: () => void }) {
  return <View style={s.screen}>
    <BrandIcon size={76} /><Text style={s.title}>Agora voice on Android</Text>
    <AgoraMark />
    <Text style={s.body}>The Android client uses Agora RTC for microphone and agent audio, RTM for transcripts, and the Agent Client Toolkit for conversation state.</Text>
    <Text style={s.body}>Install the submission APK, open Me → Open Agora voice, enter your backend URL and connect. This browser preview demonstrates the Smart Stage and decision workflow.</Text>
    <Text style={s.note}>Live voice requires an enabled Agora Conversational AI project and server credentials. No live connection is simulated here.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onLeave} style={s.button}><Text style={s.buttonText}>Back to RoundTable</Text></Pressable>
  </View>;
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.ink, padding: 28, justifyContent: 'center', gap: 22 }, title: { fontSize: 29, fontWeight: '900', color: colors.surface }, body: { fontSize: 15, lineHeight: 24, color: '#DDD6E9' }, note: { fontSize: 12, lineHeight: 19, color: '#AFA8B8' }, button: { backgroundColor: colors.lime, padding: 18, borderRadius: 18 }, buttonText: { textAlign: 'center', fontWeight: '800', color: colors.ink } });
