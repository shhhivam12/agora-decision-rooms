import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandIcon, BrandLockup } from './Brand';
import { colors, radii } from './theme';

interface Props {
  title?: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  brand?: boolean;
}

export function PageHeader({ title, subtitle, action, onAction, brand = false }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.identity}>
        {brand ? <BrandLockup width={144} /> : <BrandIcon size={42} />}
        {!brand ? (
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>
      {action ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      ) : (
        <View style={styles.avatar}><Text style={styles.avatarText}>S</Text><View style={styles.online} /></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  identity: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  copy: { marginLeft: 11, flex: 1 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 10, marginTop: 2, fontWeight: '600' },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.surface, fontSize: 15, fontWeight: '900' },
  online: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.lime,
    borderWidth: 2,
    borderColor: colors.canvas,
  },
  action: { borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 13, paddingVertical: 9 },
  actionText: { color: colors.brand, fontSize: 10, fontWeight: '900' },
  pressed: { opacity: 0.72 },
});
