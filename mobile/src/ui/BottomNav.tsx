import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export type MainTab = 'home' | 'rooms' | 'create' | 'friends' | 'profile';

interface Props {
  current: MainTab;
  onChange: (tab: MainTab) => void;
}

const tabs: { id: MainTab; glyph: string; label: string }[] = [
  { id: 'home', glyph: '⌂', label: 'Home' },
  { id: 'rooms', glyph: '◉', label: 'Rooms' },
  { id: 'create', glyph: '+', label: 'Create' },
  { id: 'friends', glyph: '♡', label: 'Friends' },
  { id: 'profile', glyph: '◎', label: 'Me' },
];

export function BottomNav({ current, onChange }: Props) {
  return (
    <View style={styles.rail}>
      {tabs.map(tab => {
        const active = current === tab.id;
        const create = tab.id === 'create';
        return (
          <Pressable
            testID={`tab-${tab.id}`}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [
              styles.item,
              create && styles.create,
              active && !create && styles.activeItem,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.glyph, create && styles.createGlyph, active && !create && styles.activeGlyph]}>
              {tab.glyph}
            </Text>
            {!create ? <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    height: 72,
    borderRadius: 27,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#08060D',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    zIndex: 20,
  },
  item: {
    minWidth: 52,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  activeItem: { backgroundColor: '#2A2434' },
  glyph: { color: '#8D8695', fontSize: 20, lineHeight: 22, fontWeight: '800' },
  activeGlyph: { color: colors.lime },
  label: { color: '#8D8695', fontSize: 9, marginTop: 3, fontWeight: '800' },
  activeLabel: { color: colors.surface },
  create: {
    width: 52,
    minWidth: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.brand,
    borderWidth: 3,
    borderColor: '#8B7CF9',
    transform: [{ rotate: '5deg' }],
  },
  createGlyph: { color: colors.surface, fontSize: 31, lineHeight: 32, transform: [{ rotate: '-5deg' }] },
  pressed: { opacity: 0.78, transform: [{ scale: 0.96 }] },
});
