import { AppPressable as Pressable } from '../i18n';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../i18n';
import { colors } from './theme';

/** Follow captions until the reader scrolls back; retain their position then. */
export function CaptionScroller({ children }: { children: React.ReactNode }) {
  const scroll = useRef<ScrollView>(null);
  const follow = useRef(true);
  const [readingHistory, setReadingHistory] = useState(false);
  const latest = () => {
    follow.current = true;
    setReadingHistory(false);
    scroll.current?.scrollToEnd({ animated: false });
  };
  return (
    <View style={s.panel}>
      <ScrollView
        ref={scroll}
        testID="caption-scroll"
        accessibilityLabel="Conversation captions"
        style={s.scroll}
        contentContainerStyle={s.content}
        nestedScrollEnabled
        showsVerticalScrollIndicator
        scrollEventThrottle={32}
        onContentSizeChange={() => {
          if (follow.current) scroll.current?.scrollToEnd({ animated: false });
        }}
        onScroll={({
          nativeEvent: { contentOffset, contentSize, layoutMeasurement },
        }) => {
          const atBottom =
            contentSize.height - contentOffset.y - layoutMeasurement.height <
            48;
          follow.current = atBottom;
          setReadingHistory(!atBottom);
        }}
      >
        {children}
      </ScrollView>
      {readingHistory && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Jump to latest captions"
          onPress={latest}
          style={s.latest}
        >
          <Text style={s.latestText}>Latest ↓</Text>
        </Pressable>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  panel: { marginTop: 8 },
  scroll: { height: 300 },
  content: { paddingRight: 12, paddingBottom: 8 },
  latest: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: colors.ink,
    marginTop: 8,
  },
  latestText: { color: colors.inverse, fontSize: 12 },
});
