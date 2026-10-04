import { AppText as Text, AppPressable as Pressable } from '../i18n';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AgoraMark, BrandIcon, MakerFooter } from './Brand';
import { PageHeader } from './PageHeader';
import { Avatar } from './Portrait';
import { CharacterArt, CharacterBust } from './CharacterArt';
import { Icon, IconName } from './Icon';
import { Button, Screen, Section } from './Ui';
import { colors } from './theme';
export function ProfileScreen({ onOpenVoice }: { onOpenVoice?: () => void }) {
  const [demoMode, setDemoMode] = useState(true),
    [receipts, setReceipts] = useState(true);
  return (
    <Screen>
      <PageHeader
        title="Your space"
        subtitle="A little about you and your rooms."
      />
      <View style={s.profile}>
        <Avatar id="you" size={63} />
        <View style={{ flex: 1 }}>
          <Text style={s.host}>ROOM HOST</Text>
          <Text style={s.name}>Shivam</Text>
          <Text style={s.handle}>@shivam · Demo profile</Text>
        </View>
        <BrandIcon size={38} />
      </View>
      <Section
        title="Talk it out, live"
        caption="Live voice and a shared conversation"
      />
      <View style={s.voice}>
        <View style={s.voiceHead}>
          <AgoraMark />
          <CharacterBust id="kabir" size={78} />
        </View>
        <Text style={s.voiceTitle}>
          A voice in the room.{'\n'}A plan on the stage.
        </Text>
        <Text style={s.voiceBody}>
          Talk with your people and the room assistant, with real-time audio and
          live captions. The group outing is a separate guided demo.
        </Text>
        {onOpenVoice && (
          <Button
            label="Open Agora voice"
            onPress={onOpenVoice}
            light
            icon="waveform"
          />
        )}
      </View>
      <Section title="Connected experiences" />
      <View style={s.services}>
        {(
          [
            {
              name: 'Agora voice',
              body: 'Real-time audio and live captions',
              icon: 'waveform',
              state: 'Live voice',
            },
            {
              name: 'Venue discovery',
              body: 'Sample options in the guided demo',
              icon: 'search',
              state: 'Demo data',
            },
            {
              name: 'Shared calendar',
              body: 'Local receipt after host approval',
              icon: 'calendar',
              state: 'Demo action',
            },
          ] as { name: string; body: string; icon: IconName; state: string }[]
        ).map((item, i) => (
          <View key={item.name} style={[s.service, i > 0 && s.line]}>
            <Icon name={item.icon} size={22} />
            <View style={{ flex: 1 }}>
              <Text style={s.serviceName}>{item.name}</Text>
              <Text style={s.serviceBody}>{item.body}</Text>
            </View>
            <Text style={s.serviceState}>{item.state}</Text>
          </View>
        ))}
      </View>
      <Section title="Room preferences" caption="Local preview preferences" />
      <View style={s.settings}>
        <Setting
          label="Demo data fallback"
          detail="Keep the guided journey available"
          value={demoMode}
          onChange={() => setDemoMode(v => !v)}
        />
        <Setting
          label="Show execution receipts"
          detail="Keep the approved outcome visible"
          value={receipts}
          onChange={() => setReceipts(v => !v)}
          last
        />
      </View>
      <View style={s.promise}>
        <CharacterArt scene="agreed" height={145} />
        <Text style={s.promiseLabel}>THE ROOM'S PROMISE</Text>
        <Text style={s.promiseTitle}>
          Everyone can follow{'\n'}what happens next.
        </Text>
        {[
          'The assistant shows what it understood.',
          'Every person gets a vote.',
          'Actions wait for explicit approval.',
        ].map((text, i) => (
          <View style={s.promiseRow} key={text}>
            <Text style={s.number}>0{i + 1}</Text>
            <Text style={s.promiseText}>{text}</Text>
          </View>
        ))}
      </View>
      <MakerFooter />
    </Screen>
  );
}
function Setting({
  label,
  detail,
  value,
  onChange,
  last = false,
}: {
  label: string;
  detail: string;
  value: boolean;
  onChange: () => void;
  last?: boolean;
}) {
  return (
    <View style={[s.setting, !last && s.line]}>
      <View style={{ flex: 1 }}>
        <Text style={s.serviceName}>{label}</Text>
        <Text style={s.serviceBody}>{detail}</Text>
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: value }}
        onPress={onChange}
        style={[s.switch, value && { backgroundColor: colors.ink }]}
      >
        <View style={[s.knob, value && { marginLeft: 19 }]} />
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    padding: 22,
    backgroundColor: colors.surface,
    borderRadius: 30,
  },
  host: { fontSize: 8, letterSpacing: 1.4, color: colors.muted },
  name: {
    fontSize: 25,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: -0.8,
    marginTop: 5,
  },
  handle: { fontSize: 10, color: colors.muted, marginTop: 5 },
  voice: {
    backgroundColor: colors.ink,
    padding: 25,
    borderRadius: 32,
    gap: 20,
  },
  voiceHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceTitle: {
    color: colors.inverse,
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '500',
    letterSpacing: -1,
  },
  voiceBody: { color: colors.inverseMuted, fontSize: 12, lineHeight: 20 },
  services: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  service: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 20,
  },
  line: { borderBottomWidth: 1, borderBottomColor: colors.line },
  serviceName: { color: colors.ink, fontSize: 13, fontWeight: '500' },
  serviceBody: {
    fontSize: 9,
    lineHeight: 15,
    color: colors.muted,
    marginTop: 5,
  },
  serviceState: {
    color: colors.muted,
    fontSize: 8,
    maxWidth: 67,
    textAlign: 'right',
    lineHeight: 13,
  },
  settings: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  setting: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  switch: {
    width: 45,
    height: 26,
    padding: 3,
    borderRadius: 15,
    backgroundColor: colors.line,
  },
  knob: {
    height: 20,
    width: 20,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  promise: {
    padding: 25,
    borderRadius: 30,
    backgroundColor: colors.surfaceMuted,
    marginTop: 29,
  },
  promiseLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: colors.muted,
    marginTop: 16,
  },
  promiseTitle: {
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -0.8,
    color: colors.ink,
    marginTop: 16,
    marginBottom: 17,
    fontWeight: '500',
  },
  promiseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingVertical: 16,
    gap: 15,
  },
  number: { color: colors.muted, fontSize: 9 },
  promiseText: { color: colors.ink, fontSize: 11, flex: 1, lineHeight: 17 },
});
