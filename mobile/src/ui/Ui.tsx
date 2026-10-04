import { AppText as Text, AppPressable as Pressable } from '../i18n';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from './theme';
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
export function Button({
  label,
  onPress,
  testID,
  light = false,
  icon = 'arrow',
}: {
  label: string;
  onPress: () => void;
  testID?: string;
  light?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        light && { backgroundColor: colors.canvas },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[s.buttonText, light && { color: colors.ink }]}>
        {label}
      </Text>
      <Icon name={icon} size={21} color={light ? colors.ink : colors.inverse} />
    </Pressable>
  );
}
export function Section({
  title,
  caption,
  action,
  onAction,
}: {
  title: string;
  caption?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={s.section}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        {caption && <Text style={s.caption}>{caption}</Text>}
      </View>
      {action && onAction && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={onAction}
          style={{ paddingVertical: 10 }}
        >
          <Text style={s.action}>{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}
export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[s.chip, active && s.chipActive]}
    >
      <Text style={[s.chipText, active && { color: colors.inverse }]}>
        {label}
      </Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 118 },
  button: {
    minHeight: 54,
    borderRadius: 30,
    backgroundColor: colors.ink,
    paddingHorizontal: 21,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.inverse,
    flex: 1,
  },
  section: {
    marginTop: 30,
    marginBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: colors.ink,
    fontSize: 19,
    letterSpacing: -0.6,
    fontWeight: '500',
  },
  caption: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 6 },
  action: { color: colors.muted, fontSize: 11 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 11, color: colors.muted },
});
