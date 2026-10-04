import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { LiveSmartStage } from '../src/ui/LiveSmartStage';
import type { VoiceRoom } from '../src/VoiceRoomApi';

const room: VoiceRoom = {
  code: 'TEST1234',
  hostUid: '101',
  expiresAt: 9999999999,
  closed: false,
  assistantStarted: false,
  language: 'multi',
  members: [{ uid: '101', name: 'Host', host: true }],
  stage: {
    revision: 2,
    decisionVersion: 1,
    contextVersion: 0,
    plan: { city: '', origin: '', date: '2026-10-05', time: '18:00' },
    preferences: {},
    venues: [],
    selectedId: null,
    votes: {},
    approved: null,
    notice: 'Set the city or meeting town in the group plan first.',
    voiceDelivery: 'idle',
    checks: {
      weather: {
        tool: 'weather',
        status: 'error',
        summary: 'City needed',
        checkedAt: 1,
        requestedBy: 'Host',
        needs: ['city'],
      },
    },
    pendingChecks: { weather: { tool: 'weather', needs: ['city'] } },
  },
};

it('keeps checks, forms and choices in separate views and lets a failed check open the exact repair form', async () => {
  const command = jest.fn().mockResolvedValue(true);
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <LiveSmartStage
        room={room}
        ownUid="101"
        command={command}
        busy={false}
        error={null}
      />,
    );
  });
  const labelled = (label: string) =>
    tree.root.findByProps({ accessibilityLabel: label });
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'City for your outing' }),
  ).toHaveLength(0);
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Edit my preferences' }),
  ).toHaveLength(0);
  act(() => labelled('Fix meeting details').props.onPress());
  act(() =>
    labelled('City for your outing').props.onChangeText('Shahdara, Delhi'),
  );
  expect(
    tree.root.findAllByProps({
      accessibilityLabel: 'Ask the planning assistant',
    }),
  ).toHaveLength(0);
  await act(async () => labelled('Save meeting details').props.onPress());
  expect(command).toHaveBeenLastCalledWith({
    action: 'plan',
    plan: {
      city: 'Shahdara, Delhi',
      origin: '',
      date: '2026-10-05',
      time: '18:00',
    },
  });
  act(() => labelled('Options').props.onPress());
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Edit my preferences' }),
  ).toHaveLength(0);
  act(() => labelled('Find venues').props.onPress());
  expect(command).toHaveBeenLastCalledWith({ action: 'check', tool: 'venues' });
  expect(labelled('Checks').props.accessibilityState.selected).toBe(true);
  act(() => tree.unmount());
});
