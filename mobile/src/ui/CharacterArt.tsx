import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';
import { characterBusts, storyScenes } from './CharacterSources';

export type StoryScene = keyof typeof storyScenes;
export function CharacterArt({
  scene = 'discussion',
  height = 200,
  label,
  style,
}: {
  scene?: StoryScene;
  height?: number;
  label?: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      accessible={!!label}
      accessibilityLabel={label}
      source={storyScenes[scene]}
      resizeMode="contain"
      style={[s.scene, { height }, style]}
    />
  );
}
export function CharacterBust({
  id,
  size = 80,
}: {
  id: string;
  size?: number;
}) {
  return (
    <Image
      accessible={false}
      source={characterBusts[id] || characterBusts.you}
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}
const s = StyleSheet.create({ scene: { width: '100%' } });
