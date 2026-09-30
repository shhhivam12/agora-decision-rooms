import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AgoraMark, BrandIcon, BrandLockup, MakerFooter } from './Brand';
import { colors, radii } from './theme';

const integrations = [
  { id: 'agora', icon: '≋', name: 'Agora Voice AI', detail: 'RTC · RTM · Agent toolkit', state: 'Setup', color: colors.agora },
  { id: 'venues', icon: '⌕', name: 'Venue search', detail: 'Add provider API key', state: 'Setup', color: colors.coral },
  { id: 'calendar', icon: '□', name: 'Calendar', detail: 'Add Google credentials', state: 'Setup', color: colors.green },
];

export function ProfileScreen({ onOpenVoice }: { onOpenVoice?: () => void }) {
  const [demoMode, setDemoMode] = useState(true);
  const [receipts, setReceipts] = useState(true);
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.brandHead}><BrandLockup width={152} /><View style={s.version}><Text style={s.versionText}>BUILD 0.1</Text></View></View>

      <View style={s.profile}>
        <View style={s.profileOrbit} />
        <BrandIcon size={76} />
        <View style={s.profileCopy}><Text style={s.profileKicker}>ROOM HOST</Text><Text style={s.profileName}>Shivam</Text><Text style={s.profileHandle}>@shivam · Bengaluru</Text></View>
        <Pressable style={s.edit}><Text style={s.editText}>EDIT</Text></Pressable>
      </View>

      <View style={s.impact}>
        <View style={s.impactItem}><Text style={s.impactNumber}>08</Text><Text style={s.impactLabel}>DECISIONS</Text></View>
        <View style={s.divider} />
        <View style={s.impactItem}><Text style={s.impactNumber}>03</Text><Text style={s.impactLabel}>VERIFIED</Text></View>
        <View style={s.divider} />
        <View style={s.impactItem}><Text style={s.impactNumber}>06</Text><Text style={s.impactLabel}>PEOPLE</Text></View>
      </View>

      <View style={s.sectionHead}><Text style={s.kicker}>INTEGRATION DESK</Text><Text style={s.sectionTitle}>Ready for your API keys</Text><Text style={s.sectionBody}>The interface and demo flow work now. Connect live services here when your credentials are ready.</Text></View>
      <View style={s.integrationCard}>
        {integrations.map((item, index) => (
          <View key={item.id} style={[s.integration, index > 0 && s.topLine]}>
            <View style={[s.integrationIcon, { backgroundColor: item.color }]}><Text style={s.integrationIconText}>{item.icon}</Text></View>
            <View style={s.integrationCopy}><Text style={s.integrationName}>{item.name}</Text><Text style={s.integrationDetail}>{item.detail}</Text></View>
            <View style={[s.state, item.state === 'Ready' ? s.ready : s.setup]}><Text style={[s.stateText, item.state === 'Ready' ? s.readyText : s.setupText]}>{item.state.toUpperCase()}</Text></View>
          </View>
        ))}
      </View>

      <View style={s.agoraPanel}>
        <View style={s.agoraTop}><AgoraMark /><Text style={s.core}>CORE EXPERIENCE</Text></View>
        <Text style={s.agoraTitle}>Voice is part of the decision, not a microphone on a chatbot.</Text>
        <Text style={s.agoraBody}>Connect the Android app to Agora Conversational AI for real-time voice, RTM transcripts and visible agent state. The group outing remains a guided demo.</Text>
        {onOpenVoice ? <Pressable accessibilityRole="button" accessibilityLabel="Open Agora voice" onPress={onOpenVoice} style={{ backgroundColor: colors.lime, padding: 15, borderRadius: 18, marginTop: 15 }}><Text style={{ color: colors.ink, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>Open Agora voice →</Text></Pressable> : null}
      </View>

      <View style={s.sectionHead}><Text style={s.kicker}>ROOM PREFERENCES</Text><Text style={s.sectionTitle}>How RoundTable behaves</Text></View>
      <View style={s.settings}>
        <Setting label="Demo data fallback" detail="Keep the golden path available without venue APIs" value={demoMode} onChange={() => setDemoMode(value => !value)} />
        <Setting label="Show execution receipts" detail="Keep proof visible after every approved action" value={receipts} onChange={() => setReceipts(value => !value)} last />
      </View>

      <View style={s.principles}>
        <Text style={s.principlesKicker}>THE ROUNDTABLE PROMISE</Text>
        <Text style={s.principlesTitle}>Nothing important happens invisibly.</Text>
        <View style={s.principleRow}><Text style={s.principleNumber}>01</Text><Text style={s.principleText}>The agent shows what it understood.</Text></View>
        <View style={s.principleRow}><Text style={s.principleNumber}>02</Text><Text style={s.principleText}>People vote before the room decides.</Text></View>
        <View style={s.principleRow}><Text style={s.principleNumber}>03</Text><Text style={s.principleText}>Actions wait for explicit approval.</Text></View>
      </View>

      <MakerFooter />
    </ScrollView>
  );
}

function Setting({ label, detail, value, onChange, last = false }: { label: string; detail: string; value: boolean; onChange: () => void; last?: boolean }) {
  return (
    <View style={[s.setting, !last && s.topLineBottom]}>
      <View style={s.settingCopy}><Text style={s.settingLabel}>{label}</Text><Text style={s.settingDetail}>{detail}</Text></View>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={onChange} style={[s.switch, value && s.switchOn]}>
        <View style={[s.knob, value && s.knobOn]} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 112 },
  brandHead: { minHeight: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  version: { borderRadius: radii.pill, backgroundColor: colors.brandSoft, paddingHorizontal: 10, paddingVertical: 7 },
  versionText: { color: colors.brand, fontSize: 8, letterSpacing: 1, fontWeight: '900' },
  profile: { minHeight: 156, borderRadius: radii.xlarge, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', padding: 20, overflow: 'hidden' },
  profileOrbit: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 25, borderColor: colors.brand, right: -70, top: -70 },
  profileCopy: { flex: 1, marginLeft: 15 },
  profileKicker: { color: colors.lime, fontSize: 8, letterSpacing: 1.4, fontWeight: '900' },
  profileName: { color: colors.surface, fontSize: 25, fontWeight: '900', marginTop: 5 },
  profileHandle: { color: '#AFA8B8', fontSize: 9, marginTop: 4 },
  edit: { position: 'absolute', right: 15, bottom: 15, borderRadius: radii.pill, backgroundColor: '#2D2736', paddingHorizontal: 11, paddingVertical: 7 },
  editText: { color: colors.surface, fontSize: 8, fontWeight: '900' },
  impact: { minHeight: 88, flexDirection: 'row', alignItems: 'center', borderRadius: 25, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, marginTop: 12 },
  impactItem: { flex: 1, alignItems: 'center' },
  impactNumber: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  impactLabel: { color: colors.muted, fontSize: 7, letterSpacing: .8, fontWeight: '900', marginTop: 3 },
  divider: { width: 1, height: 36, backgroundColor: colors.line },
  sectionHead: { marginTop: 26, marginBottom: 12 },
  kicker: { color: colors.brand, fontSize: 8, letterSpacing: 1.5, fontWeight: '900' },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 3 },
  sectionBody: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 6, maxWidth: 330 },
  integrationCard: { borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14 },
  integration: { minHeight: 77, flexDirection: 'row', alignItems: 'center' },
  topLine: { borderTopWidth: 1, borderTopColor: colors.line },
  integrationIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  integrationIconText: { color: colors.surface, fontSize: 18, fontWeight: '900' },
  integrationCopy: { flex: 1, marginLeft: 11 },
  integrationName: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  integrationDetail: { color: colors.muted, fontSize: 8, marginTop: 4 },
  state: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 7 },
  ready: { backgroundColor: colors.greenSoft },
  setup: { backgroundColor: colors.yellowSoft },
  stateText: { fontSize: 7, fontWeight: '900' },
  readyText: { color: colors.green },
  setupText: { color: '#9B6A00' },
  agoraPanel: { borderRadius: 27, backgroundColor: colors.brand, padding: 18, marginTop: 12 },
  agoraTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  core: { color: colors.lime, fontSize: 7, letterSpacing: 1.1, fontWeight: '900' },
  agoraTitle: { color: colors.surface, fontSize: 17, lineHeight: 22, fontWeight: '900', marginTop: 15 },
  agoraBody: { color: '#E1DCFF', fontSize: 9, lineHeight: 14, marginTop: 7 },
  settings: { borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 15 },
  setting: { minHeight: 80, flexDirection: 'row', alignItems: 'center' },
  topLineBottom: { borderBottomWidth: 1, borderBottomColor: colors.line },
  settingCopy: { flex: 1, paddingRight: 12 },
  settingLabel: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  settingDetail: { color: colors.muted, fontSize: 8, lineHeight: 12, marginTop: 4 },
  switch: { width: 45, height: 26, borderRadius: 13, backgroundColor: colors.surfaceMuted, padding: 3 },
  switchOn: { backgroundColor: colors.brand },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surface },
  knobOn: { marginLeft: 19 },
  principles: { borderRadius: 28, backgroundColor: colors.lime, padding: 19, marginTop: 20 },
  principlesKicker: { color: colors.brandDark, fontSize: 8, letterSpacing: 1.4, fontWeight: '900' },
  principlesTitle: { color: colors.ink, fontSize: 20, lineHeight: 23, fontWeight: '900', marginVertical: 13 },
  principleRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(24,20,32,.14)', paddingVertical: 10 },
  principleNumber: { color: colors.brandDark, fontSize: 8, fontWeight: '900', width: 30 },
  principleText: { color: colors.ink, fontSize: 10, fontWeight: '800' },
});
