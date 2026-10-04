import { AppText as Text, AppPressable as Pressable } from '../i18n';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MakerFooter } from './Brand';
import { PageHeader } from './PageHeader';
import { Icon } from './Icon';
import { Avatar, AvatarStack } from './Portrait';
import { CharacterArt, CharacterBust } from './CharacterArt';
import { characterProfiles, crewIds } from './CharacterProfiles';
import { Button, Screen, Section } from './Ui';
import { colors } from './theme';

interface Props {
  onCreateRoom: () => void;
  onOpenRoom?: () => void;
  onSeeRooms?: () => void;
  onOpenVoice?: () => void;
}
export function HomeScreen({
  onCreateRoom,
  onOpenRoom = onCreateRoom,
  onSeeRooms,
  onOpenVoice,
}: Props) {
  return (
    <Screen>
      <PageHeader brand />
      <Text style={s.overline}>A LITTLE LESS BACK-AND-FORTH</Text>
      <Text style={s.heading}>One table.{'\n'}One shared plan.</Text>
      <Text style={s.description}>
        Talk through options, vote together and leave with a plan.
      </Text>
      <Button
        label="Create an outing room"
        testID="create-outing-room"
        onPress={onCreateRoom}
        icon="plus"
      />
      {onOpenVoice && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try live Agora voice"
          onPress={onOpenVoice}
          style={s.liveEntry}
        >
          <Icon name="waveform" size={20} />
          <View style={s.liveEntryCopy}>
            <Text style={s.liveEntryTitle}>
              Try live voice with your people
            </Text>
            <Text style={s.liveEntryMeta}>
              Live voice, a shared Stage and real planning checks
            </Text>
          </View>
          <Icon name="arrow" size={18} />
        </Pressable>
      )}
      <Section
        title="A room for your next plan"
        action="All rooms"
        onAction={onSeeRooms}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Resume Friday Fun Crew"
        onPress={onOpenRoom}
        style={({ pressed }) => [s.room, pressed && { opacity: 0.92 }]}
      >
        <View style={s.cover}>
          <View style={s.coverHead}>
            <Text style={s.coverLabel}>GROUP OUTING</Text>
            <Text style={s.coverNote}>A place for every opinion.</Text>
          </View>
          <CharacterArt scene="discussion" height={190} />
          <View style={s.story}>
            {['Talk', 'Compare', 'Decide'].map((word, i) => (
              <React.Fragment key={word}>
                {i > 0 && <Text style={s.storyArrow}>→</Text>}
                <Text style={s.storyStep}>{word}</Text>
              </React.Fragment>
            ))}
          </View>
        </View>
        <View style={s.coverCopy}>
          <View style={{ flex: 1 }}>
            <Text style={s.coverTitle}>
              Different ideas.{'\n'}One shared plan.
            </Text>
            <Text style={s.coverDetail}>Food & games · Under ₹700</Text>
          </View>
          <View style={s.enter}>
            <Icon name="diagonal" color={colors.inverse} size={22} />
          </View>
        </View>
        <View style={s.roomFooter}>
          <AvatarStack size={31} dark />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={s.roomName}>Friday Fun Crew</Text>
            <Text style={s.roomMeta}>3 people · Guided demo</Text>
          </View>
        </View>
      </Pressable>
      <Section
        title="Meet your circle"
        caption="Different personalities. Better plans together."
      />
      <View style={s.circle}>
        {crewIds.map(id => (
          <View style={s.friend} key={id}>
            <Avatar id={id} size={54} />
            <Text style={s.friendName}>{characterProfiles[id].name}</Text>
            <Text style={s.friendRole}>{characterProfiles[id].shortRole}</Text>
          </View>
        ))}
      </View>
      <Section
        title="What will you decide?"
        caption="Start with an outing. More room types are on the way."
      />
      <View style={s.recipes}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Plan an evening out"
          onPress={onCreateRoom}
          style={s.recipe}
        >
          <CharacterBust id="maya" size={70} />
          <Text style={s.recipeTitle}>An evening out</Text>
          <Text style={s.recipeBody}>
            Food, an activity,{'\n'}one shared plan.
          </Text>
          <Icon name="arrow" size={20} />
        </Pressable>
        <View style={[s.recipe, s.soon]}>
          <CharacterBust id="ayaan" size={70} />
          <Text style={s.recipeTitle}>Shared expenses</Text>
          <Text style={s.recipeBody}>
            Keep the maths{'\n'}out of the group chat.
          </Text>
          <Text style={s.soonLabel}>COMING LATER</Text>
        </View>
      </View>
      <View style={s.finish}>
        <CharacterArt scene="agreed" height={155} />
        <Text style={s.finishTitle}>Less “so, what’s the plan?”</Text>
        <Text style={s.finishBody}>More “see you there”.</Text>
      </View>
      <MakerFooter />
    </Screen>
  );
}
const s = StyleSheet.create({
  overline: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.6,
    marginTop: 9,
    fontWeight: '500',
  },
  heading: {
    color: colors.ink,
    fontSize: 35,
    lineHeight: 39,
    letterSpacing: -1.7,
    fontWeight: '500',
    marginTop: 13,
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 17,
  },
  liveEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 17,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 12,
    backgroundColor: colors.surface,
  },
  liveEntryCopy: { flex: 1 },
  liveEntryTitle: { fontSize: 12, color: colors.ink, fontWeight: '500' },
  liveEntryMeta: {
    fontSize: 9,
    lineHeight: 15,
    color: colors.muted,
    marginTop: 4,
  },
  room: { borderRadius: 32, backgroundColor: colors.ink, overflow: 'hidden' },
  cover: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },
  coverHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  coverLabel: {
    color: colors.ink,
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  coverNote: {
    color: colors.muted,
    fontSize: 9,
    flexShrink: 1,
    textAlign: 'right',
  },
  story: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 4,
  },
  storyStep: { fontSize: 10, fontWeight: '500', color: colors.ink },
  storyArrow: { color: colors.muted, fontSize: 12 },
  coverCopy: {
    paddingHorizontal: 22,
    paddingTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverTitle: {
    color: colors.inverse,
    fontSize: 29,
    lineHeight: 32,
    letterSpacing: -1.2,
    fontWeight: '500',
  },
  coverDetail: { color: colors.inverseMuted, fontSize: 10, marginTop: 12 },
  enter: {
    width: 43,
    height: 43,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.darkLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  roomName: { color: colors.inverse, fontSize: 13, fontWeight: '500' },
  roomMeta: { color: colors.inverseMuted, fontSize: 10, marginTop: 5 },
  circle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 28,
  },
  friend: { flex: 1, alignItems: 'center' },
  friendName: { fontSize: 12, color: colors.ink, marginTop: 9 },
  friendRole: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 5,
    textAlign: 'center',
  },
  recipes: { flexDirection: 'row', gap: 12 },
  recipe: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 18,
    gap: 13,
  },
  recipeTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  recipeBody: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  soon: { backgroundColor: colors.surfaceMuted },
  soonLabel: {
    fontSize: 8,
    letterSpacing: 1.4,
    color: colors.muted,
    paddingTop: 4,
  },
  finish: { marginTop: 28, alignItems: 'center', padding: 18 },
  finishTitle: {
    color: colors.ink,
    fontSize: 18,
    letterSpacing: -0.5,
    marginTop: 15,
    textAlign: 'center',
  },
  finishBody: { color: colors.muted, fontSize: 12, marginTop: 7 },
});
