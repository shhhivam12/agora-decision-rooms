import { AppText as Text, AppPressable as Pressable } from '../i18n';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MakerFooter } from './Brand';
import { PageHeader } from './PageHeader';
import { AvatarStack } from './Portrait';
import { CharacterArt } from './CharacterArt';
import { Icon, IconName } from './Icon';
import { Button, Chip, Screen, Section } from './Ui';
import { colors } from './theme';
const recents: {
  icon: IconName;
  title: string;
  meta: string;
  result: string;
}[] = [
  {
    icon: 'play',
    title: 'Movie night',
    meta: '4 people · Decided',
    result: 'Dune: Part Two',
  },
  {
    icon: 'coffee',
    title: 'Sunday catch-up',
    meta: '3 people · Complete',
    result: 'Blue Tokai, 11 AM',
  },
  {
    icon: 'people',
    title: 'Team dinner',
    meta: '5 people · Complete',
    result: 'Brik Oven',
  },
];
export function RoomsScreen({
  onOpenRoom,
  onCreateRoom,
}: {
  onOpenRoom: () => void;
  onCreateRoom: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'live' | 'done'>('all');
  return (
    <Screen>
      <PageHeader
        title="Your rooms"
        subtitle="Conversations that go somewhere."
        action="+ New"
        onAction={onCreateRoom}
      />
      <View style={s.filters}>
        {(['all', 'live', 'done'] as const).map(item => (
          <Chip
            key={item}
            label={
              { all: 'All rooms', live: 'In progress', done: 'Decided' }[item]
            }
            active={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </View>
      {(filter === 'all' || filter === 'live') && (
        <Pressable
          testID="open-active-room"
          accessibilityRole="button"
          accessibilityLabel="Open Friday Fun Crew"
          onPress={onOpenRoom}
          style={s.card}
        >
          <View style={s.cover}>
            <View style={s.badge}>
              <View style={s.dot} />
              <Text style={s.badgeText}>GUIDED DEMO</Text>
            </View>
            <CharacterArt scene="compare" height={210} />
          </View>
          <View style={s.cardBody}>
            <Text style={s.coverTitle}>Friday Fun Crew</Text>
            <View style={s.row}>
              <AvatarStack size={32} dark />
              <Text style={s.people}>3 people · Group outing</Text>
            </View>
            <Text style={s.goal}>Find an evening everyone can say yes to.</Text>
            <View style={s.cardFoot}>
              <Text style={s.phase}>Brief → compare → vote</Text>
              <View style={s.open}>
                <Icon name="arrow" color={colors.inverse} size={20} />
              </View>
            </View>
          </View>
        </Pressable>
      )}
      {(filter === 'all' || filter === 'done') && (
        <>
          <Section title="Decided together" caption="Sample room history" />
          <CharacterArt scene="agreed" height={155} />
          {recents.map(item => (
            <View key={item.title} style={s.recent}>
              <View style={s.recentIcon}>
                <Icon name={item.icon} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.recentTitle}>{item.title}</Text>
                <Text style={s.recentMeta}>{item.meta}</Text>
                <Text style={s.result}>{item.result}</Text>
              </View>
              <Icon name="check" size={19} />
            </View>
          ))}
        </>
      )}
      <View style={s.new}>
        <Text style={s.newTitle}>Another plan in the making?</Text>
        <Text style={s.newBody}>
          A room gives everyone a voice and the conversation a finish line.
        </Text>
        <Button
          label="Start a decision room"
          onPress={onCreateRoom}
          icon="plus"
        />
      </View>
      <MakerFooter />
    </Screen>
  );
}
const s = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 7, marginTop: 6, marginBottom: 22 },
  card: { backgroundColor: colors.ink, borderRadius: 32, overflow: 'hidden' },
  cover: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    borderRadius: 99,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.inverse,
  },
  badgeText: { fontSize: 8, letterSpacing: 1.4, color: colors.inverse },
  coverTitle: {
    color: colors.inverse,
    fontSize: 28,
    letterSpacing: -1.1,
    fontWeight: '500',
  },
  cardBody: { padding: 21, gap: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  people: { fontSize: 10, color: colors.inverseMuted },
  goal: {
    fontSize: 19,
    lineHeight: 25,
    color: colors.inverse,
    letterSpacing: -0.5,
  },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phase: { fontSize: 11, color: colors.inverseMuted },
  open: {
    height: 40,
    width: 40,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.darkLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 19,
  },
  recentIcon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTitle: { fontSize: 15, color: colors.ink, fontWeight: '500' },
  recentMeta: { fontSize: 11, color: colors.muted, marginTop: 5 },
  result: { fontSize: 11, color: colors.ink, marginTop: 8 },
  new: {
    padding: 22,
    borderRadius: 28,
    backgroundColor: colors.surface,
    marginTop: 26,
  },
  newTitle: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: -0.5,
    color: colors.ink,
  },
  newBody: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    marginTop: 10,
    marginBottom: 18,
  },
});
