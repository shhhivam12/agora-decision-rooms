import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import agoraWordmark from '../../assets/branding/agora-wordmark.webp';
import appIcon from '../../assets/branding/roundtable-app-icon-v3.png';
import logoLockup from '../../assets/branding/roundtable-logo-lockup-v4.png';
import { colors, radii } from './theme';

interface SizeProps {
  size?: number;
}

export function BrandIcon({ size = 44 }: SizeProps) {
  return (
    <Image
      accessibilityLabel="RoundTable AI icon"
      source={appIcon}
      resizeMode="cover"
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    />
  );
}

export function BrandLockup({ width = 146 }: { width?: number }) {
  return (
    <Image
      accessibilityLabel="RoundTable AI"
      source={logoLockup}
      resizeMode="contain"
      style={{ width, height: width / 3 }}
    />
  );
}

export function AgoraMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.agoraWrap, compact && styles.agoraCompact]}>
      <Text style={styles.powered}>POWERED BY</Text>
      <Image
        accessibilityLabel="Agora"
        source={agoraWordmark}
        resizeMode="contain"
        style={[styles.agora, compact && styles.agoraSmall]}
      />
    </View>
  );
}

export function MakerFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerRule} />
      <BrandIcon size={30} />
      <View style={styles.footerCopy}>
        <Text style={styles.footerTitle}>Built with {'<3'} by Shivam</Text>
        <Text style={styles.footerSub}>for the Agora Voice AI Hackathon</Text>
      </View>
      <View style={styles.miniAgora}><Text style={styles.miniAgoraText}>AGORA</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  agoraWrap: {
    alignSelf: 'flex-start',
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: radii.pill,
    backgroundColor: '#08080A',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  agoraCompact: { minHeight: 28, paddingVertical: 3, paddingHorizontal: 8 },
  powered: { color: '#8F8C96', fontSize: 7, letterSpacing: 1.1, fontWeight: '900' },
  agora: { width: 62, height: 20 },
  agoraSmall: { width: 50, height: 17 },
  footer: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    paddingHorizontal: 4,
    paddingTop: 18,
  },
  footerRule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.line,
  },
  footerCopy: { flex: 1, marginLeft: 10 },
  footerTitle: { color: colors.ink, fontSize: 11, fontWeight: '900' },
  footerSub: { color: colors.muted, fontSize: 9, marginTop: 3 },
  miniAgora: {
    borderRadius: radii.pill,
    backgroundColor: '#E7F8FF',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  miniAgoraText: { color: colors.agora, fontSize: 8, letterSpacing: 1.2, fontWeight: '900' },
});
