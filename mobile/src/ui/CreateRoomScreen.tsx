import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AgoraMark, MakerFooter } from './Brand';
import { PageHeader } from './PageHeader';
import { colors, radii } from './theme';

interface Props { onCreateRoom: () => void }

const goals = [
  { id: 'outing', emoji: '🍜', title: 'Plan an outing', body: 'Food, activity and a shared calendar', accent: colors.yellow },
  { id: 'custom', emoji: '✦', title: 'Start from a goal', body: 'Describe a decision in your own words', accent: colors.brandSoft },
];

const crew = [
  { id: 'priya', name: 'Priya', initial: 'P', color: colors.coral },
  { id: 'ayaan', name: 'Ayaan', initial: 'A', color: colors.green },
  { id: 'maya', name: 'Maya', initial: 'M', color: colors.brand },
  { id: 'kabir', name: 'Kabir', initial: 'K', color: '#E89031' },
];

export function CreateRoomScreen({ onCreateRoom }: Props) {
  const [goal, setGoal] = useState('outing');
  const [selected, setSelected] = useState(['priya', 'ayaan']);
  const [rule, setRule] = useState<'majority' | 'everyone'>('majority');
  const togglePerson = (id: string) => setSelected(all => all.includes(id) ? all.filter(item => item !== id) : [...all, id]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <PageHeader title="Create a room" subtitle="Give the conversation a finish line" />

      <View style={s.intro}>
        <View style={s.introRing} />
        <Text style={s.step}>NEW ROUNDTABLE</Text>
        <Text style={s.introTitle}>What are we deciding together?</Text>
        <Text style={s.introBody}>You set the goal and the rule. The agent keeps the process visible to everyone.</Text>
        <View style={s.agora}><AgoraMark compact /></View>
      </View>

      <View style={s.sectionHead}><Text style={s.number}>01</Text><View><Text style={s.kicker}>ROOM RECIPE</Text><Text style={s.sectionTitle}>Choose a starting point</Text></View></View>
      {goals.map(item => {
        const active = goal === item.id;
        return (
          <Pressable key={item.id} onPress={() => setGoal(item.id)} style={({ pressed }) => [s.goal, active && s.goalActive, pressed && s.pressed]}>
            <View style={[s.goalIcon, { backgroundColor: item.accent }]}><Text style={s.goalEmoji}>{item.emoji}</Text></View>
            <View style={s.goalCopy}><Text style={s.goalTitle}>{item.title}</Text><Text style={s.goalBody}>{item.body}</Text></View>
            <View style={[s.radio, active && s.radioActive]}>{active ? <View style={s.radioDot} /> : null}</View>
          </Pressable>
        );
      })}

      <View style={s.objective}>
        <Text style={s.fieldLabel}>ROOM OBJECTIVE</Text>
        <Text style={s.objectiveText}>{goal === 'outing' ? 'Choose where to go tonight and put the final plan on our calendars.' : 'Reach one clear group decision and record the approved next step.'}</Text>
        <View style={s.voiceHint}><Text style={s.voiceIcon}>≋</Text><Text style={s.voiceText}>You can refine this by voice inside the room</Text></View>
      </View>

      <View style={s.sectionHead}><Text style={s.number}>02</Text><View><Text style={s.kicker}>THE CREW</Text><Text style={s.sectionTitle}>Invite people to the table</Text></View></View>
      <View style={s.crew}>
        {crew.map(person => {
          const active = selected.includes(person.id);
          return (
            <Pressable key={person.id} onPress={() => togglePerson(person.id)} style={s.person}>
              <View style={[s.avatar, { backgroundColor: person.color }, !active && s.avatarOff]}>
                <Text style={s.avatarText}>{person.initial}</Text>
                {active ? <View style={s.check}><Text style={s.checkText}>✓</Text></View> : null}
              </View>
              <Text style={[s.personName, active && s.personNameActive]}>{person.name}</Text>
            </Pressable>
          );
        })}
        <Pressable style={s.person}><View style={[s.avatar, s.add]}><Text style={s.addText}>+</Text></View><Text style={s.personName}>Invite</Text></Pressable>
      </View>

      <View style={s.sectionHead}><Text style={s.number}>03</Text><View><Text style={s.kicker}>DECISION RULE</Text><Text style={s.sectionTitle}>How does the room agree?</Text></View></View>
      <View style={s.ruleGrid}>
        <Pressable onPress={() => setRule('majority')} style={[s.rule, rule === 'majority' && s.ruleActive]}>
          <Text style={s.ruleIcon}>⅔</Text><Text style={s.ruleTitle}>Simple majority</Text><Text style={s.ruleBody}>The option with the most votes wins.</Text>
        </Pressable>
        <Pressable onPress={() => setRule('everyone')} style={[s.rule, rule === 'everyone' && s.ruleActive]}>
          <Text style={s.ruleIcon}>◎</Text><Text style={s.ruleTitle}>Everyone agrees</Text><Text style={s.ruleBody}>No action until every person approves.</Text>
        </Pressable>
      </View>

      <View style={s.summary}>
        <View style={s.summaryTop}><Text style={s.summaryLabel}>ROOM READY</Text><Text style={s.summaryCode}>RT-2048</Text></View>
        <Text style={s.summaryTitle}>Friday Fun Crew</Text>
        <View style={s.summaryRow}><Text style={s.summaryKey}>People</Text><Text style={s.summaryValue}>{selected.length + 1} invited</Text></View>
        <View style={s.summaryRow}><Text style={s.summaryKey}>Rule</Text><Text style={s.summaryValue}>{rule === 'majority' ? 'Simple majority' : 'Everyone agrees'}</Text></View>
        <View style={s.summaryRow}><Text style={s.summaryKey}>Agent mode</Text><Text style={s.summaryValue}>Visible work + approval</Text></View>
        <Pressable testID="launch-room" onPress={onCreateRoom} style={({ pressed }) => [s.launch, pressed && s.pressed]}>
          <View><Text style={s.launchTitle}>Create room & invite</Text><Text style={s.launchSub}>Opens the shared Central Stage</Text></View>
          <View style={s.launchArrow}><Text style={s.launchArrowText}>→</Text></View>
        </Pressable>
      </View>

      <MakerFooter />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 112 },
  intro: { minHeight: 220, borderRadius: radii.xlarge, backgroundColor: colors.brand, padding: 21, overflow: 'hidden', marginBottom: 25 },
  introRing: { position: 'absolute', right: -50, bottom: -85, width: 190, height: 190, borderRadius: 95, borderWidth: 30, borderColor: colors.coral, opacity: .9 },
  step: { color: colors.lime, fontSize: 8, letterSpacing: 1.7, fontWeight: '900' },
  introTitle: { color: colors.surface, fontSize: 28, lineHeight: 31, fontWeight: '900', maxWidth: 290, marginTop: 12 },
  introBody: { color: '#E6E1FF', fontSize: 11, lineHeight: 17, maxWidth: 280, marginTop: 9 },
  agora: { marginTop: 15 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 9, marginBottom: 12 },
  number: { width: 35, height: 35, borderRadius: 13, color: colors.surface, backgroundColor: colors.ink, textAlign: 'center', textAlignVertical: 'center', fontSize: 9, fontWeight: '900' },
  kicker: { color: colors.brand, fontSize: 8, letterSpacing: 1.4, fontWeight: '900' },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 2 },
  goal: { minHeight: 82, borderRadius: 23, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 },
  goalActive: { borderWidth: 2, borderColor: colors.brand },
  goalIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  goalEmoji: { fontSize: 23 },
  goalCopy: { flex: 1, marginLeft: 12 },
  goalTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  goalBody: { color: colors.muted, fontSize: 9, marginTop: 4 },
  radio: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.brand },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.brand },
  objective: { backgroundColor: colors.ink, borderRadius: 24, padding: 17, marginTop: 4, marginBottom: 23 },
  fieldLabel: { color: colors.lime, fontSize: 8, letterSpacing: 1.3, fontWeight: '900' },
  objectiveText: { color: colors.surface, fontSize: 14, lineHeight: 20, fontWeight: '800', marginTop: 9 },
  voiceHint: { flexDirection: 'row', alignItems: 'center', marginTop: 13, gap: 7 },
  voiceIcon: { color: colors.lime, fontSize: 17, fontWeight: '900' },
  voiceText: { color: '#ADA6B6', fontSize: 8 },
  crew: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  person: { width: 61, alignItems: 'center' },
  avatar: { width: 51, height: 51, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarOff: { opacity: .35 },
  avatarText: { color: colors.surface, fontSize: 16, fontWeight: '900' },
  check: { position: 'absolute', right: -3, bottom: -3, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.lime, borderWidth: 2, borderColor: colors.canvas, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: colors.ink, fontSize: 9, fontWeight: '900' },
  add: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed' },
  addText: { color: colors.brand, fontSize: 24 },
  personName: { color: colors.muted, fontSize: 9, fontWeight: '700', marginTop: 7 },
  personNameActive: { color: colors.ink, fontWeight: '900' },
  ruleGrid: { flexDirection: 'row', gap: 9, marginBottom: 22 },
  rule: { flex: 1, minHeight: 150, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 14 },
  ruleActive: { borderWidth: 2, borderColor: colors.brand, backgroundColor: colors.brandSoft },
  ruleIcon: { color: colors.brand, fontSize: 25, fontWeight: '900' },
  ruleTitle: { color: colors.ink, fontSize: 12, fontWeight: '900', marginTop: 12 },
  ruleBody: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 6 },
  summary: { borderRadius: 29, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 18 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: colors.green, fontSize: 8, letterSpacing: 1.3, fontWeight: '900' },
  summaryCode: { color: colors.muted, fontSize: 8, fontWeight: '800' },
  summaryTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', marginVertical: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: 10 },
  summaryKey: { color: colors.muted, fontSize: 9 },
  summaryValue: { color: colors.ink, fontSize: 9, fontWeight: '900' },
  launch: { minHeight: 66, borderRadius: 21, backgroundColor: colors.ink, marginTop: 9, paddingLeft: 16, paddingRight: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  launchTitle: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  launchSub: { color: '#AAA3B2', fontSize: 8, marginTop: 4 },
  launchArrow: { width: 49, height: 49, borderRadius: 17, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  launchArrowText: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  pressed: { opacity: .8, transform: [{ scale: .99 }] },
});
