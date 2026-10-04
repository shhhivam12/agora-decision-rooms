import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import people from '../../assets/branding/roundtable-loader-people.png';
import type { RoomLoaderProps } from './RoomLoader.types';
import { roomLoaderGeometry as g } from './roomLoaderGeometry';

/** One small transparent texture, one native transform; no frame-by-frame JS. */
export function RoomLoader({
  size = 64,
  label = 'Loading your room',
  badge = true,
  paused = false,
}: RoomLoaderProps) {
  const rotation = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    // Subscribe before querying so a setting change cannot be missed.
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      value => {
        if (mounted) setReduceMotion(value);
      },
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (mounted) setReduceMotion(current => current ?? value);
      })
      .catch(() => {
        if (mounted) setReduceMotion(false);
      });
    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion !== false || paused) return;
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: g.durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    rotation.setValue(0);
    loop.start();
    return () => {
      loop.stop();
      rotation.setValue(0);
    };
  }, [rotation, reduceMotion, paused]);

  const diameter = size * ((2 * g.tableRadius) / g.viewBox);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={[
        styles.badge,
        badge && styles.badgeFill,
        {
          width: size,
          height: size,
          borderRadius: size * 0.254,
        },
      ]}
    >
      <View
        style={[
          styles.table,
          {
            width: diameter,
            height: diameter,
            left: (size - diameter) / 2,
            top: (size - diameter) / 2,
            borderRadius: diameter / 2,
            backgroundColor: g.table,
          },
        ]}
      />
      <Animated.Image
        accessible={false}
        source={people}
        style={{
          width: size,
          height: size,
          transform: [
            {
              rotate: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { overflow: 'hidden', backgroundColor: 'transparent' },
  badgeFill: { backgroundColor: g.ink },
  table: { position: 'absolute' },
});
