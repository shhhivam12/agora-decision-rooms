import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AgoraMark, BrandIcon, MakerFooter } from './Brand';
import { PageHeader } from './PageHeader';
import { colors, radii } from './theme';

interface Props {
  onCreateRoom: () => void;
  onOpenRoom?: () => void;
  onSeeRooms?: () => void;
}

const friends = [
  { name: 'Priya', initial: 'P', color: colors.coral },
  { name: 'Ayaan', initial: 'A', color: colors.green },
  { name: 'Maya', initial: 'M', color: colors.brand },
  { name: 'Kabir', initial: 'K', color: '#E89031' },
];

export function HomeScreen({ onCreateRoom, onOpenRoom = onCreateRoom, onSeeRooms }: Props) {
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <PageHeader brand />

      <View style={s.welcomeRow}>
        <View><Text style={s.eyebrow}>GOOD EVENING, SHIVAM</Text><Text style={s.greeting}>Bring everyone to the table.</Text></View>
        <BrandIcon size={46} />
      </View>

      <View style={s.hero}>
        <View style={s.orbitOne} />
        <View style={s.orbitTwo} />
        <Text style={s.sparkOne}>✦</Text>
        <Text style={s.sparkTwo}>✦</Text>
        <View style={s.heroBadge}><View style={s.liveDot} /><Text style={s.heroBadgeText}>SHARED VOICE AGENT</Text></View>
        <Text style={s.heroTitle}>Talk it out.{'\n'}Leave with a plan.</Text>
        <Text style={s.heroBody}>RoundTable hears every constraint, shows its work and acts only when the room agrees.</Text>
        <Pressable
          testID="create-outing-room"
          accessibilityRole="button"
          onPress={onCreateRoom}
          style={({ pressed }) => [s.primary, pressed && s.pressed]}>
          <Text style={s.primaryText}>Create an outing room</Text>
          <View style={s.arrow}><Text style={s.arrowText}>↗</Text></View>
        </Pressable>
        <View style={s.heroAgora}><AgoraMark compact /></View>
      </View>

      <View style={s.sectionHead}>
        <View><Text style={s.kicker}>BACK AT THE TABLE</Text><Text style={s.sectionTitle}>Your live room</Text></View>
        <Pressable onPress={onSeeRooms}><Text style={s.link}>See all →</Text></Pressable>
      </View>
      <Pressable onPress={onOpenRoom} style={({ pressed }) => [s.liveRoom, pressed && s.pressed]}>
        <View style={s.liveRoomTop}>
          <View style={s.roomGlyph}><Text style={s.roomGlyphText}>FR</Text></View>
          <View style={s.roomCopy}><Text style={s.roomTitle}>Friday Fun Crew</Text><Text style={s.roomMeta}>3 people · Group outing</Text></View>
          <View style={s.livePill}><View style={s.liveTiny} /><Text style={s.livePillText}>LIVE</Text></View>
        </View>
        <View style={s.roomGoal}><Text style={s.roomGoalLabel}>ROOM GOAL</Text><Text style={s.roomGoalText}>Pick tonight’s plan and add it to everyone’s calendar.</Text></View>
        <View style={s.resume}><Text style={s.resumeText}>Resume room</Text><Text style={s.resumeArrow}>→</Text></View>
      </Pressable>

      <View style={s.sectionHead}>
        <View><Text style={s.kicker}>THE CREW</Text><Text style={s.sectionTitle}>Your circle</Text></View>
        <Text style={s.onlineText}>4 online</Text>
      </View>
      <View style={s.friends}>
        {friends.map(friend => (
          <View key={friend.name} style={s.friend}>
            <View style={[s.avatar, { backgroundColor: friend.color }]}><Text style={s.avatarText}>{friend.initial}</Text></View>
            <View style={s.friendDot} /><Text style={s.friendName}>{friend.name}</Text>
          </View>
        ))}
        <View style={s.friend}><View style={[s.avatar, s.invite]}><Text style={s.inviteText}>+</Text></View><Text style={s.friendName}>Invite</Text></View>
      </View>

      <View style={s.sectionHead}>
        <View><Text style={s.kicker}>ROOM RECIPES</Text><Text style={s.sectionTitle}>Decide anything together</Text></View>
      </View>
      <View style={s.ideas}>
        <Pressable onPress={onCreateRoom} style={({ pressed }) => [s.idea, s.ideaActive, pressed && s.pressed]}>
          <View style={[s.ideaIcon, { backgroundColor: colors.yellow }]}><Text style={s.ideaEmoji}>🍜</Text></View>
          <Text style={s.ideaTitle}>Plan an outing</Text>
          <Text style={s.ideaBody}>Search, compare, vote and schedule.</Text>
          <Text style={s.ideaAction}>START ROOM  →</Text>
        </Pressable>
        <View style={[s.idea, s.ideaSoon]}>
          <View style={[s.ideaIcon, { backgroundColor: colors.aqua }]}><Text style={s.ideaEmoji}>₹</Text></View>
          <Text style={s.ideaTitle}>Split expenses</Text>
          <Text style={s.ideaBody}>Count fairly and settle without awkward math.</Text>
          <Text style={s.soon}>NEXT RECIPE</Text>
        </View>
      </View>

      <MakerFooter />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 112 },
  welcomeRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 },
  eyebrow: { color: colors.brand, fontSize: 9, letterSpacing: 1.7, fontWeight: '900' },
  greeting: { color: colors.ink, fontSize: 23, lineHeight: 27, fontWeight: '900', marginTop: 5, maxWidth: 260 },
  hero: { minHeight: 384, borderRadius: radii.xlarge, backgroundColor: colors.brand, overflow: 'hidden', padding: 23, marginBottom: 27 },
  orbitOne: { position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)', right: -92, top: -88 },
  orbitTwo: { position: 'absolute', width: 132, height: 132, borderRadius: 66, backgroundColor: colors.coral, right: -31, top: 52, borderWidth: 4, borderColor: colors.ink },
  sparkOne: { position: 'absolute', right: 91, top: 56, color: colors.lime, fontSize: 29 },
  sparkTwo: { position: 'absolute', right: 30, top: 203, color: colors.yellow, fontSize: 20 },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 11, paddingVertical: 7, borderRadius: radii.pill },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.lime },
  heroBadgeText: { color: colors.surface, fontSize: 9, letterSpacing: 1.1, fontWeight: '900' },
  heroTitle: { color: colors.surface, fontSize: 36, lineHeight: 39, fontWeight: '900', marginTop: 29, maxWidth: 300 },
  heroBody: { color: '#EAE6FF', fontSize: 13, lineHeight: 20, marginTop: 13, maxWidth: 285 },
  primary: { marginTop: 22, minHeight: 55, borderRadius: radii.pill, backgroundColor: colors.ink, paddingLeft: 19, paddingRight: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: 280 },
  primaryText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  arrow: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  heroAgora: { marginTop: 18 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 13, marginTop: 2 },
  kicker: { color: colors.brand, fontSize: 8, letterSpacing: 1.6, fontWeight: '900' },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 3 },
  link: { color: colors.brand, fontSize: 10, fontWeight: '900', paddingVertical: 5 },
  liveRoom: { borderRadius: 27, backgroundColor: colors.ink, padding: 17, marginBottom: 27 },
  liveRoomTop: { flexDirection: 'row', alignItems: 'center' },
  roomGlyph: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
  roomGlyphText: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  roomCopy: { flex: 1, marginLeft: 12 },
  roomTitle: { color: colors.surface, fontSize: 15, fontWeight: '900' },
  roomMeta: { color: '#AFA8B8', fontSize: 9, marginTop: 4 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#302A39', paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill },
  liveTiny: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.coral },
  livePillText: { color: colors.surface, fontSize: 8, fontWeight: '900' },
  roomGoal: { backgroundColor: '#272130', borderRadius: 18, padding: 13, marginTop: 15 },
  roomGoalLabel: { color: colors.lime, fontSize: 8, letterSpacing: 1.2, fontWeight: '900' },
  roomGoalText: { color: '#DDD8E3', fontSize: 11, lineHeight: 16, marginTop: 6, fontWeight: '600' },
  resume: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  resumeText: { color: colors.surface, fontSize: 11, fontWeight: '900' },
  resumeArrow: { color: colors.lime, fontSize: 18 },
  onlineText: { color: colors.green, fontSize: 10, fontWeight: '900' },
  friends: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  friend: { width: 58, alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface },
  avatarText: { color: colors.surface, fontSize: 16, fontWeight: '900' },
  friendDot: { position: 'absolute', right: 4, top: 38, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.lime, borderWidth: 2, borderColor: colors.canvas },
  invite: { backgroundColor: colors.surface, borderColor: colors.line, borderStyle: 'dashed' },
  inviteText: { color: colors.brand, fontSize: 24 },
  friendName: { marginTop: 7, fontSize: 10, color: colors.muted, fontWeight: '700' },
  ideas: { flexDirection: 'row', gap: 11 },
  idea: { flex: 1, minHeight: 208, padding: 14, borderRadius: 26, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  ideaActive: { borderColor: '#CCC4FF' },
  ideaSoon: { backgroundColor: '#F1F0F4' },
  ideaIcon: { width: 45, height: 45, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ideaEmoji: { fontSize: 22, color: colors.ink, fontWeight: '900' },
  ideaTitle: { color: colors.ink, fontSize: 14, fontWeight: '900', marginTop: 13 },
  ideaBody: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 7 },
  ideaAction: { color: colors.brand, fontSize: 8, letterSpacing: .8, fontWeight: '900', marginTop: 'auto' },
  soon: { color: colors.muted, fontSize: 8, letterSpacing: .9, fontWeight: '900', marginTop: 'auto' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
