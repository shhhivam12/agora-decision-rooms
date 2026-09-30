import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { OutingRoomScreen } from '../src/ui/OutingRoomScreen';

describe('Smart Stage decision controls', () => {
  let tree: renderer.ReactTestRenderer;
  beforeEach(() => {
    jest.useFakeTimers();
    act(() => { tree = renderer.create(<OutingRoomScreen onLeave={jest.fn()} />); });
  });
  afterEach(() => { act(() => tree.unmount()); jest.useRealTimers(); });
  const press = (label: string) => act(() => { tree.root.findByProps({ accessibilityLabel: label }).props.onPress(); });
  const tick = () => act(() => { jest.advanceTimersByTime(2200); });
  const has = (label: string) => tree.root.findAllByProps({ accessibilityLabel: label }).length > 0;

  it('pauses stage progression and waits for every vote and explicit approval', () => {
    press('Let RoundTable work');
    press('Pause agent');
    act(() => { jest.advanceTimersByTime(10000); });
    expect(has('Let RoundTable work')).toBe(true);
    press('Resume agent'); tick(); tick();
    expect(tree.root.findByProps({ accessibilityLabel: 'Select Bowling + bites' }).props.disabled).toBe(true);
    press('Ask the room to vote');
    press('Simulate You vote'); press('Simulate Priya vote');
    expect(has('Review proposed action')).toBe(false);
    press('Simulate Ayaan vote'); press('Review proposed action');
    act(() => { jest.advanceTimersByTime(10000); });
    expect(has('Approve demo calendar action')).toBe(true);
    expect(has('Try another decision')).toBe(false);
    press('Approve demo calendar action'); tick();
    expect(has('Try another decision')).toBe(true);
  });
});
