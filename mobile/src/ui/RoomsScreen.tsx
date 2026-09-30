import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MakerFooter } from './Brand';
import { PageHeader } from './PageHeader';
import { colors, radii } from './theme';

interface Props {
  onOpenRoom: () => void;
  onCreateRoom: () => void;
}

const recents = [
  { icon: '🎬', title: 'Movie night', meta: '4 people · Decided', result: 'Dune: Part Two', color: colors.aquaSoft },
  { icon: '☕', title: 'Sunday catch-up', meta: '3 people · Complete', result: 'Blue Tokai, 11 AM', color: colors.yellowSoft },
  { icon: '🍕', title: 'Team dinner', meta: '5 people · Complete', result: 'Brik Oven', color: colors.coralSoft },
];

export function RoomsScreen({ onOpenRoom, onCreateRoom }: Props) {
  const [filter, setFilter] = useState<'all' | 'live' | 'done'>('all');
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <PageHeader title="Rooms" subtitle="Every conversation with a finish line" action="+ New" onAction={onCreateRoom} />

      <View style={s.hero}>
        <View style={s.heroRing} />
        <Text style={s.heroKicker}>1 ROOM NEEDS YOU</Text>
        <Text style={s.heroTitle}>Come back to the conversation.</Text>
        <Text style={s.heroBody}>The crew is connected and RoundTable is ready to collect everyone’s constraints.</Text>
        <Pressable testID="open-active-room" onPress={onOpenRoom} style={({ pressed }) => [s.heroButton, pressed && s.pressed]}>
          <View style={s.play}><Text style={s.playText}>▶</Text></View>
          <View style={s.heroButtonCopy}><Text style={s.heroButtonTitle}>Friday Fun Crew</Text><Text style={s.heroButtonMeta}>LIVE · 3 people inside</Text></View>
          <Text style={s.openArrow}>→</Text>
        </Pressable>
      </View>

      <View style={s.stats}>
        <View style={[s.stat, { backgroundColor: colors.brandSoft }]}><Text style={s.statNumber}>08</Text><Text style={s.statLabel}>decisions made</Text></View>
        <View style={[s.stat, { backgroundColor: colors.greenSoft }]}><Text style={s.statNumber}>03</Text><Text style={s.statLabel}>actions verified</Text></View>
      </View>

      <View style={s.sectionTop}>
        <View><Text style={s.kicker}>ROOM HISTORY</Text><Text style={s.sectionTitle}>Your roundtables</Text></View>
        <View style={s.filters}>
          {(['all', 'live', 'done'] as const).map(item => (
            <Pressable key={item} onPress={() => setFilter(item)} style={[s.filter, filter === item && s.filterActive]}>
              <Text style={[s.filterText, filter === item && s.filterTextActive]}>{item.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {(filter === 'all' || filter === 'live') ? (
        <Pressable onPress={onOpenRoom} style={({ pressed }) => [s.liveCard, pressed && s.pressed]}>
          <View style={s.liveHead}><View style={s.liveSignal}><View style={s.liveDot} /><Text style={s.liveText}>IN PROGRESS</Text></View><Text style={s.time}>NOW</Text></View>
          <Text style={s.liveTitle}>Friday Fun Crew</Text>
          <Text style={s.liveGoal}>Choose food + an activity under ₹900 each</Text>
          <View style={s.progress}><View style={s.progressFill} /></View>
          <View style={s.liveFoot}><Text style={s.livePhase}>UNDERSTANDING · 2 OF 7</Text><Text style={s.join}>JOIN ROOM  →</Text></View>
        </Pressable>
      ) : null}

      {(filter === 'all' || filter === 'done') ? recents.map(item => (
        <View key={item.title} style={s.recent}>
          <View style={[s.recentIcon, { backgroundColor: item.color }]}><Text style={s.recentEmoji}>{item.icon}</Text></View>
          <View style={s.recentCopy}><Text style={s.recentTitle}>{item.title}</Text><Text style={s.recentMeta}>{item.meta}</Text><Text style={s.recentResult}>{item.result}</Text></View>
          <Text style={s.chevron}>›</Text>
        </View>
      )) : null}

      <Pressable onPress={onCreateRoom} style={({ pressed }) => [s.createCard, pressed && s.pressed]}>
        <View style={s.createPlus}><Text style={s.createPlusText}>+</Text></View>
        <View style={s.createCopy}><Text style={s.createTitle}>Start another roundtable</Text><Text style={s.createBody}>Set the goal, invite people and let the room do the work.</Text></View>
      </Pressable>
      <MakerFooter />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 112 },
  hero: { minHeight: 270, backgroundColor: colors.ink, borderRadius: radii.xlarge, padding: 21, overflow: 'hidden' },
  heroRing: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 38, borderColor: colors.brand, opacity: .72, right: -78, top: -70 },
  heroKicker: { color: colors.lime, fontSize: 8, letterSpacing: 1.6, fontWeight: '900' },
  heroTitle: { color: colors.surface, fontSize: 27, lineHeight: 31, fontWeight: '900', maxWidth: 260, marginTop: 12 },
  heroBody: { color: '#BDB6C6', fontSize: 11, lineHeight: 17, maxWidth: 285, marginTop: 9 },
  heroButton: { minHeight: 65, borderRadius: 21, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', padding: 8, marginTop: 20 },
  play: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  playText: { color: colors.ink, fontSize: 16 },
  heroButtonCopy: { flex: 1, marginLeft: 12 },
  heroButtonTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  heroButtonMeta: { color: colors.green, fontSize: 8, marginTop: 4, fontWeight: '900' },
  openArrow: { color: colors.brand, fontSize: 20, marginRight: 10 },
  stats: { flexDirection: 'row', gap: 10, marginVertical: 18 },
  stat: { flex: 1, minHeight: 87, borderRadius: 22, padding: 14 },
  statNumber: { color: colors.ink, fontSize: 25, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 9, marginTop: 4, fontWeight: '700' },
  sectionTop: { marginTop: 7, marginBottom: 13 },
  kicker: { color: colors.brand, fontSize: 8, letterSpacing: 1.5, fontWeight: '900' },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 3 },
  filters: { flexDirection: 'row', marginTop: 12, gap: 7 },
  filter: { borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 7 },
  filterActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { color: colors.muted, fontSize: 8, fontWeight: '900' },
  filterTextActive: { color: colors.lime },
  liveCard: { borderRadius: 27, backgroundColor: colors.brand, padding: 18, marginBottom: 10 },
  liveHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveSignal: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.coral },
  liveText: { color: colors.surface, fontSize: 8, letterSpacing: 1, fontWeight: '900' },
  time: { color: '#DCD6FF', fontSize: 8, fontWeight: '800' },
  liveTitle: { color: colors.surface, fontSize: 20, fontWeight: '900', marginTop: 17 },
  liveGoal: { color: '#E7E3FF', fontSize: 11, lineHeight: 16, marginTop: 5 },
  progress: { height: 5, backgroundColor: 'rgba(255,255,255,.2)', borderRadius: 3, marginTop: 18 },
  progressFill: { width: '29%', height: 5, borderRadius: 3, backgroundColor: colors.lime },
  liveFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 13 },
  livePhase: { color: '#D7D1FF', fontSize: 8, fontWeight: '800' },
  join: { color: colors.lime, fontSize: 8, fontWeight: '900' },
  recent: { minHeight: 91, borderRadius: 23, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', padding: 13, marginBottom: 9 },
  recentIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  recentEmoji: { fontSize: 23 },
  recentCopy: { flex: 1, marginLeft: 12 },
  recentTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  recentMeta: { color: colors.muted, fontSize: 8, marginTop: 3 },
  recentResult: { color: colors.green, fontSize: 9, marginTop: 6, fontWeight: '800' },
  chevron: { color: colors.mutedLight, fontSize: 24, marginRight: 5 },
  createCard: { minHeight: 94, borderRadius: 24, borderWidth: 1, borderColor: '#CFC8FF', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 4 },
  createPlus: { width: 47, height: 47, borderRadius: 17, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
  createPlusText: { color: colors.brand, fontSize: 26 },
  createCopy: { flex: 1, marginLeft: 13 },
  createTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  createBody: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  pressed: { opacity: .8, transform: [{ scale: .99 }] },
});
