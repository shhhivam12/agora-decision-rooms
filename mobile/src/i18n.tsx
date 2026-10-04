import React, { createContext, useContext, useState } from 'react';
import {
  Text,
  TextInput,
  Pressable,
  View,
  StyleSheet,
  type TextProps,
  type TextInputProps,
  type PressableProps,
} from 'react-native';
import { readLanguage, saveLanguage } from './languageStorage';
import { hindi } from './translations/hi';
import { colors } from './ui/theme';

type Language = 'en' | 'hi';
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
export function translateText(text: string, language: Language): string {
  if (language === 'en') return text;
  const key = normalize(text);
  const exact = hindi[key];
  if (exact) return exact;
  if (text.includes('\n'))
    return text
      .split('\n')
      .map(line => translateText(line, language))
      .join('\n');
  // Translate only known UI templates; spoken captions and user names bypass this function.
  const templates: [RegExp, (...args: string[]) => string][] = [
    [/^(\d+) (?:person|people) connected$/, n => `${n} लोग जुड़े हैं`],
    [
      /^(\d+) people · (.+)$/,
      (n, rest) => `${n} लोग · ${translateText(rest, language)}`,
    ],
    [
      /^(\d+) min travel · Indoor · Vegetarian$/,
      n => `${n} मिनट की यात्रा · अंदर · शाकाहारी`,
    ],
    [/^(\d+) \/ 3 votes recorded$/, n => `${n} / 3 वोट दर्ज`],
    [
      /^A demo vote for (.+)\. Everyone gets a say before the room moves on\.$/,
      name =>
        `${translateText(
          name,
          language,
        )} के लिए डेमो वोट। आगे बढ़ने से पहले सबकी राय ली जाती है।`,
    ],
    [
      /^Room host · (Connected|Joining)$/,
      state => `होस्ट · ${translateText(state, language)}`,
    ],
    [
      /^Guest · (Connected|Joining)$/,
      state => `मेहमान · ${translateText(state, language)}`,
    ],
    [/^Friday · (.+)$/, time => `शुक्रवार · ${time}`],
    [/^(\d+) friends?$/, n => `${n} दोस्त`],
    [
      /^(\d+) people · (.+)$/,
      (n, rest) => `${n} लोग · ${translateText(rest, language)}`,
    ],
    [
      /^(\d+) \/ (.+)$/,
      (number, rest) => `${number} / ${translateText(rest, language)}`,
    ],
    [/^(₹[\d,]+) \/ person$/, cost => `${cost} / व्यक्ति`],
    [/^(.+) →$/, label => `${translateText(label, language)} →`],
    [
      /^Room assistant: (.+)$/,
      message => `रूम असिस्टेंट: ${translateText(message, language)}`,
    ],
    [
      /^Room brief updated • (.+)$/,
      scenario =>
        `रूम की ज़रूरतें बदलीं • ${translateText(scenario, language)}`,
    ],
    [
      /^Agent opened vote · (.+)$/,
      plan => `असिस्टेंट ने वोट शुरू किया · ${translateText(plan, language)}`,
    ],
    [
      /^Votes counted · (.+)$/,
      plan => `वोट गिने गए · ${translateText(plan, language)}`,
    ],
    [
      /^(.+) 3 simulated votes · host approval recorded Receipt: DEMO-CAL-2048$/,
      time =>
        `${time}\n3 डेमो वोट · होस्ट की मंज़ूरी दर्ज\nरसीद: DEMO-CAL-2048`,
    ],
    [
      /^(Invite|Demo invite|Undo demo invite for) (.+)$/,
      (action, name) =>
        `${
          action === 'Undo demo invite for'
            ? 'डेमो निमंत्रण वापस लें:'
            : 'बुलाएँ:'
        } ${name}`,
    ],
    [/^Select (.+)$/, plan => `${translateText(plan, language)} चुनें`],
    [
      /^Simulate (.+) vote$/,
      name => `${translateText(name, language)} का डेमो वोट दें`,
    ],
    [
      /^(.+) voted ✓$/,
      name => `${translateText(name, language)} ने वोट दिया ✓`,
    ],
    [
      /^Assistant language: (.+)$/,
      label => `असिस्टेंट की भाषा: ${translateText(label, language)}`,
    ],
  ];
  for (const [pattern, render] of templates) {
    const match = key.match(pattern);
    if (match) return render(...match.slice(1));
  }
  return text;
}
const fallback = {
  language: 'en' as Language,
  setLanguage: (_language: Language) => {},
  t: (text: string) => text,
};
const LanguageContext = createContext(fallback);
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, update] = useState<Language>(readLanguage);
  const setLanguage = (next: Language) => {
    update(next);
    saveLanguage(next);
  };
  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: text => translateText(text, language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
export function AppText({
  children,
  translate = true,
  style,
  ...props
}: TextProps & { translate?: boolean }) {
  const { language, t } = useLanguage();
  const parts = React.Children.toArray(children);
  const plain = parts.every(
    child => typeof child === 'string' || typeof child === 'number',
  );
  return (
    <Text {...props} style={[style, language === 'hi' && { letterSpacing: 0 }]}>
      {translate && plain ? t(parts.join('')) : children}
    </Text>
  );
}
export function AppTextInput({
  placeholder,
  accessibilityLabel,
  ...props
}: TextInputProps) {
  const { t } = useLanguage();
  return (
    <TextInput
      {...props}
      placeholder={placeholder ? t(placeholder) : undefined}
      accessibilityLabel={
        accessibilityLabel ? t(accessibilityLabel) : undefined
      }
    />
  );
}
export function AppPressable({ accessibilityLabel, ...props }: PressableProps) {
  const { t } = useLanguage();
  return (
    <Pressable
      {...props}
      accessibilityLabel={
        accessibilityLabel ? t(accessibilityLabel) : undefined
      }
    />
  );
}
export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  return (
    <View style={s.row}>
      {(['en', 'hi'] as const).map(item => (
        <Pressable
          key={item}
          accessibilityRole="button"
          accessibilityLabel={
            item === 'en' ? 'Use English interface' : 'हिंदी में ऐप देखें'
          }
          accessibilityState={{ selected: language === item }}
          onPress={() => setLanguage(item)}
          style={[s.option, language === item && s.selected]}
        >
          <Text style={[s.text, language === item && s.activeText]}>
            {item === 'en' ? 'English' : 'हिंदी'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 6,
    gap: 3,
    backgroundColor: colors.canvas,
  },
  option: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 18 },
  selected: { backgroundColor: colors.ink },
  text: { fontSize: 11, color: colors.muted },
  activeText: { color: colors.inverse },
});
