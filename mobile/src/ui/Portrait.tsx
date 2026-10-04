import { AppText as Text } from '../i18n';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { characterPortraits } from './CharacterSources';
import { colors } from './theme';
export function Avatar({
  id,
  size = 44,
  initial,
  border = false,
}: {
  id: string;
  size?: number;
  initial?: string;
  border?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: colors.surfaceMuted,
        borderWidth: border ? 2 : 0,
        borderColor: colors.canvas,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {characterPortraits[id] ? (
        <Image
          accessible={false}
          source={characterPortraits[id]}
          resizeMode="cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <Text
          style={{
            color: colors.ink,
            fontSize: size * 0.32,
            fontWeight: '500',
          }}
        >
          {initial || id.slice(0, 1).toUpperCase()}
        </Text>
      )}
    </View>
  );
}
export function AvatarStack({
  size = 34,
  dark = false,
  ids = ['you', 'priya', 'ayaan'],
}: {
  size?: number;
  dark?: boolean;
  ids?: string[];
}) {
  return (
    <View style={s.stack}>
      {ids.map((id, i) => (
        <View
          key={id}
          style={{
            marginLeft: i ? -size * 0.24 : 0,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: dark ? colors.ink : colors.canvas,
          }}
        >
          <Avatar id={id} size={size} />
        </View>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  stack: { flexDirection: 'row', alignItems: 'center' },
});
