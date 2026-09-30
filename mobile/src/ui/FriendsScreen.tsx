import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MakerFooter } from './Brand';
import { PageHeader } from './PageHeader';
import { colors, radii } from './theme';

const people = [
  { id: 'priya', name: 'Priya Sharma', handle: '@priya', initial: 'P', color: colors.coral, status: 'Online', rooms: 6 },
  { id: 'ayaan', name: 'Ayaan Khan', handle: '@ayaan', initial: 'A', color: colors.green, status: 'In a room', rooms: 5 },
  { id: 'maya', name: 'Maya Rao', handle: '@maya', initial: 'M', color: colors.brand, status: 'Online', rooms: 3 },
  { id: 'kabir', name: 'Kabir Mehta', handle: '@kabir', initial: 'K', color: '#E89031', status: 'Away', rooms: 2 },
];

export function FriendsScreen() {
  const [invited, setInvited] = useState<string[]>([]);
  const [showOnline, setShowOnline] = useState(false);
  const visible = useMemo(() => showOnline ? people.filter(person => person.status !== 'Away') : people, [showOnline]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <PageHeader title="Your circle" subtitle="People you decide things with" action="Invite +" />

      <View style={s.hero}>
        <View style={s.heroGlow} />
        <Text style={s.heroKicker}>SOCIAL, WITH A PURPOSE</Text>
        <Text style={s.heroTitle}>Plans move faster with your people close.</Text>
        <View style={s.stack}>
          {people.slice(0, 4).map((person, index) => (
            <View key={person.id} style={[s.stackAvatar, { backgroundColor: person.color }, index > 0 && s.stackOverlap]}>
              <Text style={s.stackText}>{person.initial}</Text>
            </View>
          ))}
          <View style={[s.stackAvatar, s.stackAdd, s.stackOverlap]}><Text style={s.stackAddText}>+</Text></View>
        </View>
      </View>

      <View style={s.search}><Text style={s.searchIcon}>⌕</Text><Text style={s.searchText}>Search by name or @handle</Text><View style={s.key}><Text style={s.keyText}>⌘ K</Text></View></View>

      <View style={s.sectionTop}>
        <View><Text style={s.kicker}>YOUR PEOPLE</Text><Text style={s.sectionTitle}>{visible.length} friends</Text></View>
        <Pressable onPress={() => setShowOnline(value => !value)} style={[s.toggle, showOnline && s.toggleActive]}>
          <View style={[s.toggleDot, showOnline && s.toggleDotActive]} /><Text style={[s.toggleText, showOnline && s.toggleTextActive]}>ONLINE</Text>
        </Pressable>
      </View>

      {visible.map(person => {
        const sent = invited.includes(person.id);
        return (
          <View key={person.id} style={s.person}>
            <View style={[s.avatar, { backgroundColor: person.color }]}><Text style={s.avatarText}>{person.initial}</Text><View style={[s.statusDot, person.status === 'Away' && s.awayDot]} /></View>
            <View style={s.personCopy}><Text style={s.name}>{person.name}</Text><Text style={s.handle}>{person.handle} · {person.status}</Text><Text style={s.shared}>{person.rooms} shared rooms</Text></View>
            <Pressable onPress={() => setInvited(all => sent ? all.filter(id => id !== person.id) : [...all, person.id])} style={[s.invite, sent && s.invited]}>
              <Text style={[s.inviteText, sent && s.invitedText]}>{sent ? 'SENT ✓' : 'INVITE'}</Text>
            </Pressable>
          </View>
        );
      })}

      <View style={s.linkCard}>
        <View style={s.linkIcon}><Text style={s.linkIconText}>↗</Text></View>
        <View style={s.linkCopy}><Text style={s.linkTitle}>Share your circle link</Text><Text style={s.linkBody}>Friends can join RoundTable and land directly in your next room.</Text></View>
        <Pressable style={s.copy}><Text style={s.copyText}>COPY</Text></Pressable>
      </View>

      <MakerFooter />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 112 },
  hero: { minHeight: 220, borderRadius: radii.xlarge, backgroundColor: colors.ink, padding: 21, overflow: 'hidden' },
  heroGlow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: colors.brand, right: -75, top: -80 },
  heroKicker: { color: colors.lime, fontSize: 8, letterSpacing: 1.5, fontWeight: '900' },
  heroTitle: { color: colors.surface, fontSize: 28, lineHeight: 31, fontWeight: '900', maxWidth: 280, marginTop: 13 },
  stack: { flexDirection: 'row', marginTop: 23 },
  stackAvatar: { width: 45, height: 45, borderRadius: 16, borderWidth: 3, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  stackOverlap: { marginLeft: -9 },
  stackText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  stackAdd: { backgroundColor: colors.lime },
  stackAddText: { color: colors.ink, fontSize: 21 },
  search: { minHeight: 54, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 16 },
  searchIcon: { color: colors.ink, fontSize: 21 },
  searchText: { flex: 1, color: colors.mutedLight, fontSize: 10, marginLeft: 10 },
  key: { borderRadius: 8, backgroundColor: colors.surfaceMuted, paddingHorizontal: 8, paddingVertical: 5 },
  keyText: { color: colors.muted, fontSize: 8, fontWeight: '800' },
  sectionTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 25, marginBottom: 12 },
  kicker: { color: colors.brand, fontSize: 8, letterSpacing: 1.4, fontWeight: '900' },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 3 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radii.pill, backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 7 },
  toggleActive: { backgroundColor: colors.greenSoft },
  toggleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.mutedLight },
  toggleDotActive: { backgroundColor: colors.green },
  toggleText: { color: colors.muted, fontSize: 8, fontWeight: '900' },
  toggleTextActive: { color: colors.green },
  person: { minHeight: 91, flexDirection: 'row', alignItems: 'center', borderRadius: 23, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 12, marginBottom: 8 },
  avatar: { width: 53, height: 53, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.surface, fontSize: 16, fontWeight: '900' },
  statusDot: { position: 'absolute', right: -2, bottom: -2, width: 13, height: 13, borderRadius: 7, backgroundColor: colors.lime, borderWidth: 2, borderColor: colors.surface },
  awayDot: { backgroundColor: colors.mutedLight },
  personCopy: { flex: 1, marginLeft: 12 },
  name: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  handle: { color: colors.muted, fontSize: 8, marginTop: 3 },
  shared: { color: colors.brand, fontSize: 8, fontWeight: '800', marginTop: 6 },
  invite: { borderRadius: radii.pill, backgroundColor: colors.brandSoft, paddingHorizontal: 12, paddingVertical: 9 },
  invited: { backgroundColor: colors.greenSoft },
  inviteText: { color: colors.brand, fontSize: 8, fontWeight: '900' },
  invitedText: { color: colors.green },
  linkCard: { minHeight: 99, borderRadius: 25, backgroundColor: colors.brandSoft, flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: 8 },
  linkIcon: { width: 47, height: 47, borderRadius: 17, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  linkIconText: { color: colors.surface, fontSize: 20 },
  linkCopy: { flex: 1, marginLeft: 12 },
  linkTitle: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  linkBody: { color: colors.muted, fontSize: 8, lineHeight: 12, marginTop: 4 },
  copy: { padding: 9 },
  copyText: { color: colors.brand, fontSize: 8, fontWeight: '900' },
});
