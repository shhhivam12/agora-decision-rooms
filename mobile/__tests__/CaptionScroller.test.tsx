import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ScrollView } from 'react-native';
import { CaptionScroller } from '../src/ui/CaptionScroller';

it('follows new captions, preserves history reading and resumes from Latest', () => {
  const scrollToEnd = jest
    .spyOn(ScrollView.prototype, 'scrollToEnd')
    .mockImplementation(() => {});
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<CaptionScroller>First caption</CaptionScroller>);
  });
  const panel = () => tree.root.findByProps({ testID: 'caption-scroll' });
  act(() => panel().props.onContentSizeChange(300, 600));
  expect(scrollToEnd).toHaveBeenCalledTimes(1);
  act(() =>
    panel().props.onScroll({
      nativeEvent: {
        contentOffset: { y: 0 },
        contentSize: { height: 900 },
        layoutMeasurement: { height: 300 },
      },
    }),
  );
  scrollToEnd.mockClear();
  act(() => {
    tree.update(<CaptionScroller>First and second caption</CaptionScroller>);
    panel().props.onContentSizeChange(300, 900);
  });
  expect(scrollToEnd).not.toHaveBeenCalled();
  act(() =>
    tree.root
      .findByProps({ accessibilityLabel: 'Jump to latest captions' })
      .props.onPress(),
  );
  expect(scrollToEnd).toHaveBeenCalledTimes(1);
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Jump to latest captions' }),
  ).toHaveLength(0);
  act(() => panel().props.onContentSizeChange(300, 1000));
  expect(scrollToEnd).toHaveBeenCalledTimes(2);
  act(() => tree.unmount());
  scrollToEnd.mockRestore();
});
