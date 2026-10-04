import { AppText as Text } from '../i18n';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import appIcon from '../../assets/branding/decision-rooms-icon.png';
import { colors } from './theme';
export function BrandIcon({ size = 44 }: { size?: number }) {
  return (
    <Image
      accessibilityLabel="Agora Decision Rooms icon"
      source={appIcon}
      resizeMode="contain"
      style={{ width: size, height: size, borderRadius: size * 0.254 }}
    />
  );
}
export function BrandLockup({ width = 204 }: { width?: number }) {
  const scale = width / 204;
  return (
    <View
      accessibilityLabel="Agora Decision Rooms"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10 * scale }}
    >
      <BrandIcon size={40 * scale} />
      <View>
        <Text
          style={[
            s.agoraLabel,
            { fontSize: 9 * scale, letterSpacing: 2.4 * scale },
          ]}
        >
          AGORA
        </Text>
        <Text
          style={[
            s.wordmark,
            { fontSize: 19 * scale, letterSpacing: -0.8 * scale },
          ]}
        >
          Decision Rooms
        </Text>
      </View>
    </View>
  );
}
export function AgoraMark({ compact = false }: { compact?: boolean }) {
  return (
    <View
      style={[
        s.partner,
        compact && { paddingHorizontal: 10, paddingVertical: 6 },
      ]}
    >
      <Text style={s.powered}>POWERED BY</Text>
      <Text style={s.agora}>agora</Text>
    </View>
  );
}
export function MakerFooter() {
  return (
    <View style={s.footer}>
      <BrandIcon size={28} />
      <View style={{ flex: 1 }}>
        <Text style={s.footerTitle}>Made by Shivam Mahendru</Text>
        <Text style={s.footerBody}>
          Agora Voice AI Hackathon · Independent project
        </Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  agoraLabel: { color: colors.muted, fontWeight: '600', marginBottom: 3 },
  wordmark: { color: colors.ink, fontWeight: '600' },
  partner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.inkSoft,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  powered: {
    color: colors.inverseMuted,
    fontSize: 7,
    letterSpacing: 1.3,
    fontWeight: '500',
  },
  agora: {
    color: colors.inverse,
    fontSize: 17,
    letterSpacing: -0.6,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 20,
    marginTop: 28,
  },
  footerTitle: { color: colors.ink, fontSize: 11, fontWeight: '500' },
  footerBody: { color: colors.muted, fontSize: 9, marginTop: 4 },
});
