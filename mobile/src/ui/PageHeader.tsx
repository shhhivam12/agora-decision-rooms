import { AppText as Text, AppPressable as Pressable } from '../i18n';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BrandLockup } from './Brand';
import { Icon } from './Icon';
import { colors } from './theme';
interface Props {
  title?: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  brand?: boolean;
}
export function PageHeader({
  title,
  subtitle,
  action,
  onAction,
  brand = false,
}: Props) {
  return (
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        {brand ? (
          <BrandLockup width={222} />
        ) : (
          <>
            <Text style={s.title}>{title}</Text>
            {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
          </>
        )}
      </View>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={onAction}
          style={s.action}
        >
          <Text style={s.actionText}>{action}</Text>
        </Pressable>
      ) : (
        <View style={s.profile}>
          <Icon name="profile" size={21} />
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 13,
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -1,
  },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 5 },
  profile: {
    width: 44,
    height: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    borderRadius: 99,
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: { color: colors.inverse, fontSize: 12, fontWeight: '500' },
});
