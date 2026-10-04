import { AppText as Text, AppPressable as Pressable } from '../i18n';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MakerFooter } from './Brand';
import { PageHeader } from './PageHeader';
import { Avatar } from './Portrait';
import { CharacterBust } from './CharacterArt';
import { characterProfiles } from './CharacterProfiles';
import { Icon } from './Icon';
import { Button, Screen, Section } from './Ui';
import { colors } from './theme';
const crew = [
  { id: 'priya', name: 'Priya' },
  { id: 'ayaan', name: 'Ayaan' },
  { id: 'maya', name: 'Maya' },
  { id: 'kabir', name: 'Kabir' },
];
export function CreateRoomScreen({
  onCreateRoom,
}: {
  onCreateRoom: () => void;
}) {
  const [goal, setGoal] = useState('outing'),
    [selected, setSelected] = useState(['priya', 'ayaan']),
    [rule, setRule] = useState<'majority' | 'everyone'>('majority');
  const toggle = (id: string) =>
    setSelected(all =>
      all.includes(id) ? all.filter(item => item !== id) : [...all, id],
    );
  return (
    <Screen>
      <PageHeader
        title="Make room for a plan"
        subtitle="A few details. Then talk it out."
      />
      <Section title="01 / What are we deciding?" />
      <View style={s.goals}>
        {[
          {
            id: 'outing',
            title: 'An evening out',
            body: 'Food, an activity and one shared plan.',
            icon: 'coffee' as const,
          },
          {
            id: 'custom',
            title: 'Start with a goal',
            body: 'A decision you want to make together.',
            icon: 'rooms' as const,
          },
        ].map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="radio"
            accessibilityLabel={item.title}
            accessibilityState={{ checked: goal === item.id }}
            onPress={() => setGoal(item.id)}
            style={[s.goal, goal === item.id && s.goalActive]}
          >
            <Icon name={item.icon} size={26} />
            <View style={{ flex: 1 }}>
              <Text style={s.goalTitle}>{item.title}</Text>
              <Text style={s.goalBody}>{item.body}</Text>
            </View>
            <View style={[s.radio, goal === item.id && s.radioActive]}>
              {goal === item.id && <View style={s.radioDot} />}
            </View>
          </Pressable>
        ))}
      </View>
      <View style={s.objective}>
        <View style={s.objectiveHead}>
          <Text style={s.objectiveLabel}>THE ROOM'S FINISH LINE</Text>
          <CharacterBust id="priya" size={66} />
        </View>
        <Text style={s.objectiveText}>
          {goal === 'outing'
            ? 'Choose where to go tonight and agree on the final plan.'
            : 'Reach one clear group decision and record the approved next step.'}
        </Text>
        <View style={s.hint}>
          <Icon name="waveform" size={18} />
          <Text style={s.hintText}>Refine the brief inside the room.</Text>
        </View>
      </View>
      <Section
        title="02 / Bring your people"
        caption="Choose the crew for this demo room"
      />
      <View style={s.crew}>
        {crew.map(person => (
          <Pressable
            key={person.id}
            accessibilityRole="checkbox"
            accessibilityLabel={'Invite ' + person.name}
            accessibilityState={{ checked: selected.includes(person.id) }}
            onPress={() => toggle(person.id)}
            style={s.person}
          >
            <View
              style={[
                s.avatarWrap,
                selected.includes(person.id) && s.avatarSelected,
              ]}
            >
              <Avatar id={person.id} size={54} />
              {selected.includes(person.id) && (
                <View style={s.check}>
                  <Icon name="check" size={12} color={colors.inverse} />
                </View>
              )}
            </View>
            <Text style={s.personName}>{person.name}</Text>
            <Text style={s.personRole}>
              {characterProfiles[person.id].shortRole}
            </Text>
          </Pressable>
        ))}
      </View>
      <Section title="03 / How will you agree?" />
      <View style={s.rules}>
        {(
          [
            {
              id: 'majority',
              title: 'Simple majority',
              body: 'The option with the most votes wins.',
            },
            {
              id: 'everyone',
              title: 'Everyone agrees',
              body: 'Wait until the whole room approves.',
            },
          ] as const
        ).map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="radio"
            accessibilityLabel={item.title}
            accessibilityState={{ checked: rule === item.id }}
            onPress={() => setRule(item.id)}
            style={[s.rule, rule === item.id && s.ruleActive]}
          >
            <View style={[s.radio, rule === item.id && s.radioActive]}>
              {rule === item.id && <View style={s.radioDot} />}
            </View>
            <Text style={s.ruleTitle}>{item.title}</Text>
            <Text style={s.ruleBody}>{item.body}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.summary}>
        <View style={s.summaryHead}>
          <Text style={s.summaryLabel}>YOUR DECISION ROOM</Text>
          <Text style={s.code}>DR–2048</Text>
        </View>
        <Text style={s.summaryTitle}>Friday Fun Crew</Text>
        <View style={s.summaryRow}>
          <Icon name="people" color={colors.inverseMuted} size={18} />
          <Text style={s.summaryText}>
            {selected.length + 1} people ·{' '}
            {rule === 'majority' ? 'Simple majority' : 'Everyone agrees'}
          </Text>
        </View>
        <Text style={s.summaryNote}>
          The guided demo opens with You, Priya and Ayaan. No invitations are
          sent.
        </Text>
        <Button
          label="Create room & invite"
          testID="launch-room"
          onPress={onCreateRoom}
          light
          icon="arrow"
        />
      </View>
      <MakerFooter />
    </Screen>
  );
}
const s = StyleSheet.create({
  goals: { gap: 10 },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  goalActive: { borderColor: colors.ink },
  goalTitle: { color: colors.ink, fontSize: 15, fontWeight: '500' },
  goalBody: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  radio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.mutedLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.ink },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.ink,
  },
  objective: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 26,
    padding: 22,
    marginTop: 14,
  },
  objectiveHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  objectiveLabel: { fontSize: 8, letterSpacing: 1.5, color: colors.muted },
  objectiveText: {
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: -0.3,
    color: colors.ink,
    marginTop: 12,
  },
  hint: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 19 },
  hintText: { fontSize: 11, color: colors.muted },
  crew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  person: { alignItems: 'center', gap: 10 },
  avatarWrap: {
    padding: 4,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  avatarSelected: { borderColor: colors.ink, opacity: 1 },
  check: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.canvas,
  },
  personName: { fontSize: 12, color: colors.ink },
  personRole: { fontSize: 8, color: colors.muted, textAlign: 'center' },
  rules: { flexDirection: 'row', gap: 10 },
  rule: {
    flex: 1,
    borderRadius: 26,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 13,
  },
  ruleActive: { borderColor: colors.ink },
  ruleTitle: { fontSize: 15, fontWeight: '500', color: colors.ink },
  ruleBody: { fontSize: 11, lineHeight: 17, color: colors.muted },
  summary: {
    backgroundColor: colors.ink,
    borderRadius: 30,
    padding: 24,
    marginTop: 30,
  },
  summaryHead: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: colors.inverseMuted, fontSize: 8, letterSpacing: 1.5 },
  code: { color: colors.inverseMuted, fontSize: 9 },
  summaryTitle: {
    color: colors.inverse,
    fontSize: 25,
    letterSpacing: -0.8,
    fontWeight: '500',
    marginTop: 17,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  summaryText: { color: colors.inverseMuted, fontSize: 11 },
  summaryNote: {
    fontSize: 10,
    lineHeight: 17,
    color: colors.inverseMuted,
    marginTop: 15,
    marginBottom: 19,
  },
});
