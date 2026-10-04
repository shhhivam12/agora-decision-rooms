import React from 'react';
import renderer, { act } from 'react-test-renderer';
import {
  AppText,
  LanguageProvider,
  LanguageSwitch,
  translateText,
} from '../src/i18n';

it('translates UI and known counts while preserving unknown names and codes', () => {
  expect(translateText('Start a room', 'hi')).toBe('रूम बनाएँ');
  expect(translateText('2 people connected', 'hi')).toBe('2 लोग जुड़े हैं');
  expect(translateText('18 min travel · Indoor · Vegetarian', 'hi')).toContain(
    '18 मिनट',
  );
  expect(translateText('Shivam', 'hi')).toBe('Shivam');
  expect(translateText('1234ABCD', 'hi')).toBe('1234ABCD');
  expect(
    translateText(
      'Friday · 7:00 PM\nAttendees: You, Priya, Ayaan\nNo payment or reservation',
      'hi',
    ),
  ).toBe(
    'शुक्रवार · 7:00 PM\nसाथी: आप, Priya, Ayaan\nकोई भुगतान या बुकिंग नहीं',
  );
});
it('switches UI without rewriting a participant’s spoken captions', () => {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <LanguageProvider>
        <LanguageSwitch />
        <AppText testID="label">Start a room</AppText>
        <AppText translate={false} testID="speech">
          Start a room
        </AppText>
      </LanguageProvider>,
    );
  });
  act(() =>
    tree.root
      .findByProps({ accessibilityLabel: 'हिंदी में ऐप देखें' })
      .props.onPress(),
  );
  const renderedText = (id: string) =>
    tree.root
      .findByProps({ testID: id })
      .findAll(
        item => typeof item.type === 'string' && String(item.type) === 'Text',
      )
      .map(item => item.props.children)
      .flat()
      .join('');
  expect(renderedText('label')).toBe('रूम बनाएँ');
  expect(renderedText('speech')).toBe('Start a room');
  act(() => tree.unmount());
});
