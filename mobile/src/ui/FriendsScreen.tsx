import {
  AppText as Text,
  AppTextInput as TextInput,
  AppPressable as Pressable,
} from '../i18n';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MakerFooter } from './Brand';
import { PageHeader } from './PageHeader';
import { Avatar } from './Portrait';
import { CharacterArt, CharacterBust } from './CharacterArt';
import { characterProfiles } from './CharacterProfiles';
import { Icon } from './Icon';
import { Screen, Section } from './Ui';
import { colors } from './theme';
const people = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    handle: '@priya',
    status: 'Online',
    rooms: 6,
  },
  {
    id: 'ayaan',
    name: 'Ayaan Khan',
    handle: '@ayaan',
    status: 'In a room',
    rooms: 5,
  },
  { id: 'maya', name: 'Maya Rao', handle: '@maya', status: 'Online', rooms: 3 },
  {
    id: 'kabir',
    name: 'Kabir Mehta',
    handle: '@kabir',
    status: 'Away',
    rooms: 2,
  },
];
export function FriendsScreen() {
  const [invited, setInvited] = useState<string[]>([]),
    [showOnline, setShowOnline] = useState(false),
    [query, setQuery] = useState('');
  const visible = useMemo(
    () =>
      people.filter(
        person =>
          (!showOnline || person.status !== 'Away') &&
          ('' + person.name + person.handle)
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [showOnline, query],
  );
  return (
    <Screen>
      <PageHeader
        title="Your circle"
        subtitle="Good plans come with good company."
      />
      <View style={s.hero}>
        <Text style={s.heroLabel}>BETTER, TOGETHER</Text>
        <Text style={s.heroTitle}>Every good plan{'\n'}needs a good crew.</Text>
        <CharacterArt scene="discussion" height={195} />
        <Text style={s.heroNote}>
          Sample circle · 4 personalities · One table
        </Text>
      </View>
      <View style={s.search}>
        <Icon name="search" size={21} />
        <TextInput
          accessibilityLabel="Search your circle"
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or @handle"
          placeholderTextColor={colors.mutedLight}
          style={s.input}
        />
      </View>
      <View style={s.section}>
        <Section
          title={`${visible.length} ${
            visible.length === 1 ? 'friend' : 'friends'
          }`}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter online friends"
          accessibilityState={{ selected: showOnline }}
          onPress={() => setShowOnline(v => !v)}
          style={[s.online, showOnline && { backgroundColor: colors.ink }]}
        >
          <View
            style={[s.dot, showOnline && { backgroundColor: colors.inverse }]}
          />
          <Text style={[s.onlineText, showOnline && { color: colors.inverse }]}>
            Online
          </Text>
        </Pressable>
      </View>
      {visible.map(person => {
        const sent = invited.includes(person.id);
        return (
          <View key={person.id} style={s.person}>
            <Avatar id={person.id} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{person.name}</Text>
              <Text style={s.meta}>
                <Text translate={false}>{person.handle} · </Text>
                <Text>{person.status}</Text>
              </Text>
              <Text style={s.role}>{characterProfiles[person.id].role}</Text>
              <Text style={s.rooms}>{characterProfiles[person.id].line}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                (sent ? 'Undo demo invite for ' : 'Demo invite ') + person.name
              }
              onPress={() =>
                setInvited(all =>
                  sent
                    ? all.filter(id => id !== person.id)
                    : [...all, person.id],
                )
              }
              style={[s.invite, sent && s.invited]}
            >
              {sent ? (
                <Icon name="check" size={19} color={colors.inverse} />
              ) : (
                <Icon name="plus" size={19} />
              )}
            </Pressable>
          </View>
        );
      })}
      {visible.length === 0 && (
        <View style={s.empty}>
          <CharacterBust id="kabir" size={85} />
          <Text style={s.emptyText}>No friends match this search.</Text>
        </View>
      )}
      <Text style={s.demoNote}>
        Demo contacts and invitations. No messages are sent.
      </Text>
      <View style={s.noteCard}>
        <CharacterBust id="kabir" size={75} />
        <Text style={s.noteTitle}>A place for every opinion.</Text>
        <Text style={s.noteBody}>
          Bring different budgets, tastes and schedules. The room helps you find
          common ground.
        </Text>
      </View>
      <MakerFooter />
    </Screen>
  );
}
const s = StyleSheet.create({
  hero: { padding: 22, borderRadius: 32, backgroundColor: colors.surfaceMuted },
  heroLabel: { fontSize: 8, letterSpacing: 1.7, color: colors.muted },
  heroTitle: {
    fontSize: 31,
    lineHeight: 35,
    letterSpacing: -1.2,
    color: colors.ink,
    marginTop: 14,
    fontWeight: '500',
  },
  heroNote: {
    fontSize: 9,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 10,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 19,
    paddingVertical: 17,
    backgroundColor: colors.surface,
    borderRadius: 28,
    marginTop: 18,
  },
  input: { flex: 1, color: colors.ink, fontSize: 12, padding: 0 },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  online: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.muted },
  onlineText: { fontSize: 10, color: colors.muted },
  person: {
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    paddingVertical: 19,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  name: { fontSize: 15, fontWeight: '500', color: colors.ink },
  meta: { fontSize: 10, color: colors.muted, marginTop: 5 },
  role: { fontSize: 10, color: colors.ink, marginTop: 7 },
  rooms: { fontSize: 9, lineHeight: 14, color: colors.muted, marginTop: 4 },
  invite: {
    width: 39,
    height: 39,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invited: { backgroundColor: colors.ink, borderColor: colors.ink },
  empty: { alignItems: 'center', paddingVertical: 25, gap: 14 },
  emptyText: { fontSize: 12, color: colors.muted },
  demoNote: { fontSize: 9, lineHeight: 15, color: colors.muted, marginTop: 15 },
  noteCard: {
    backgroundColor: colors.surface,
    padding: 25,
    borderRadius: 28,
    marginTop: 28,
    gap: 14,
  },
  noteTitle: {
    fontSize: 21,
    color: colors.ink,
    fontWeight: '500',
    letterSpacing: -0.7,
  },
  noteBody: { fontSize: 12, lineHeight: 20, color: colors.muted },
});
