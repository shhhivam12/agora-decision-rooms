import { AppText as Text, AppPressable as Pressable } from '../i18n';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from './theme';
export type MainTab = 'home' | 'rooms' | 'create' | 'friends' | 'profile';
const tabs: { id: MainTab; icon: IconName; label: string }[] = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'rooms', icon: 'rooms', label: 'Rooms' },
  { id: 'create', icon: 'plus', label: 'Create' },
  { id: 'friends', icon: 'people', label: 'Friends' },
  { id: 'profile', icon: 'profile', label: 'Me' },
];
export function BottomNav({
  current,
  onChange,
}: {
  current: MainTab;
  onChange: (tab: MainTab) => void;
}) {
  return (
    <View style={s.rail}>
      {tabs.map(tab => {
        const active = current === tab.id,
          create = tab.id === 'create';
        return (
          <Pressable
            key={tab.id}
            testID={`tab-${tab.id}`}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [
              s.item,
              active && s.active,
              create && s.create,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Icon
              name={tab.icon}
              size={create ? 26 : 22}
              color={active || create ? colors.ink : colors.inverse}
            />
            {!create && (
              <Text style={[s.label, active && { color: colors.ink }]}>
                {tab.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
const s = StyleSheet.create({
  rail: {
    position: 'absolute',
    left: 26,
    right: 26,
    bottom: 15,
    height: 72,
    borderRadius: 40,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 9,
    shadowColor: '#151613',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
    zIndex: 20,
  },
  item: {
    flex: 1,
    maxWidth: 53,
    height: 54,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  active: { backgroundColor: colors.canvas },
  create: { backgroundColor: colors.surfaceMuted, maxWidth: 52, height: 52 },
  label: { color: colors.inverseMuted, fontSize: 9, fontWeight: '500' },
});
