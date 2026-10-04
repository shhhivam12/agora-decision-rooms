import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text, AppPressable as Pressable } from '../i18n';
import type { VoiceLanguage } from '../VoiceRoomApi';
import { colors } from './theme';

export const voiceLanguageLabel = (language: VoiceLanguage) =>
  language === 'en'
    ? 'English'
    : language === 'hi'
    ? 'हिंदी'
    : 'Both / Hinglish';
export function VoiceLanguageChoice({
  value,
  onChange,
  disabled = false,
}: {
  value: VoiceLanguage;
  onChange: (language: VoiceLanguage) => void;
  disabled?: boolean;
}) {
  return (
    <View style={s.section}>
      <Text style={s.label}>Assistant language</Text>
      <View style={s.row}>
        {(['en', 'hi', 'multi'] as const).map(language => (
          <Pressable
            key={language}
            accessibilityRole="button"
            accessibilityLabel={`Assistant language: ${voiceLanguageLabel(
              language,
            )}`}
            accessibilityState={{ selected: value === language }}
            disabled={disabled}
            onPress={() => onChange(language)}
            style={[s.option, value === language && s.selected]}
          >
            <Text style={[s.text, value === language && s.active]}>
              {voiceLanguageLabel(language)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.note}>
        Speak Hindi, English or mix both. Everyone in this room shares the
        assistant language.
      </Text>
    </View>
  );
}
const s = StyleSheet.create({
  section: { marginTop: 18 },
  label: { fontSize: 11, color: colors.muted, marginBottom: 9 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  option: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  selected: { backgroundColor: colors.ink, borderColor: colors.ink },
  text: { fontSize: 11, color: colors.ink },
  active: { color: colors.inverse },
  note: { color: colors.muted, fontSize: 10, lineHeight: 17, marginTop: 9 },
});
