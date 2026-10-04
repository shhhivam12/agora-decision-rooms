import { AppText as Text, AppPressable as Pressable } from '../i18n';
import React, { useCallback } from 'react';
import {
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AgoraMark, BrandLockup } from './Brand';
import { colors, radii } from './theme';
import { CharacterBust } from './CharacterArt';
import { RoomLoader } from './RoomLoader';

interface Props {
  connecting: boolean;
  error: string | null;
  onConnect: () => void;
}

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Join your decision room',
      message:
        'Agora Decision Rooms needs microphone access to talk with the room assistant.',
      buttonPositive: 'Allow microphone',
    },
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function LandingScreen({ connecting, error, onConnect }: Props) {
  const handlePress = useCallback(async () => {
    if (await ensureMicPermission()) onConnect();
  }, [onConnect]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.brand}>
        <BrandLockup width={170} />
      </View>
      <View style={styles.card}>
        <View style={styles.orbit} />
        <CharacterBust id="kabir" size={110} />
        <Text style={styles.kicker}>LIVE VOICE ROOM</Text>
        <Text style={styles.title}>
          Everyone gets a voice. The room gets a result.
        </Text>
        <Text style={styles.subtitle}>
          Talk through your preferences with the room assistant. Your live
          transcript keeps the conversation visible.
        </Text>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={handlePress}
          disabled={connecting}
          style={({ pressed }) => [
            styles.button,
            connecting && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
        >
          {connecting ? (
            <RoomLoader size={32} label="Joining your voice room" />
          ) : (
            <>
              <Text style={styles.buttonText}>Join voice room</Text>
              <Text style={styles.arrow}>→</Text>
            </>
          )}
        </Pressable>
        <View style={styles.agora}>
          <AgoraMark />
        </View>
      </View>
      <Text style={styles.credit}>
        Built with {'<3'} by Shivam for the Agora Voice AI Hackathon
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  brand: { alignItems: 'center', marginBottom: 22 },
  card: {
    minHeight: 500,
    borderRadius: radii.xlarge,
    backgroundColor: colors.brand,
    alignItems: 'center',
    padding: 25,
    overflow: 'hidden',
  },
  orbit: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 35,
    borderColor: 'rgba(255,255,255,.10)',
    right: -100,
    top: -100,
  },
  kicker: {
    color: colors.lime,
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: '900',
    marginTop: 22,
  },
  title: {
    color: colors.surface,
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
    fontWeight: '900',
    marginTop: 12,
  },
  subtitle: {
    color: colors.inverseMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 300,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 14,
    padding: 10,
    marginTop: 15,
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '700',
  },
  button: {
    width: '100%',
    minHeight: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 23,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  arrow: { color: colors.ink, fontSize: 22 },
  agora: { marginTop: 20 },
  credit: {
    color: colors.muted,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '700',
  },
  pressed: { opacity: 0.8 },
});
