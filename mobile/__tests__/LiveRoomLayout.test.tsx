import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { LiveVoiceScreen } from '../src/ui/LiveVoiceScreen.web';
import { useWebVoiceRoom } from '../src/useWebVoiceRoom';
import { AssistantAvatar } from '../src/ui/AssistantAvatar.web';

jest.mock('../src/useWebVoiceRoom', () => ({ useWebVoiceRoom: jest.fn() }));
jest.mock('agora-agent-client-toolkit', () => ({
  AgentState: { IDLE: 'idle', THINKING: 'thinking', SPEAKING: 'speaking' },
}));

it('retains camera playback and an unfinished plan when switching between Stage, call and captions', () => {
  Object.defineProperty(global, 'window', {
    configurable: true,
    value: { location: { search: '' } },
  });
  const track = { play: jest.fn(), stop: jest.fn() };
  const voice = {
    phase: 'active',
    health: 'ready',
    stageOnly: false,
    access: {
      config: { uid: '101', agentUid: '303' },
      room: {
        code: 'TEST1234',
        hostUid: '101',
        language: 'multi',
        members: [
          { uid: '101', name: 'Host', host: true },
          { uid: '202', name: 'Guest', host: false },
        ],
        stage: {
          revision: 1,
          decisionVersion: 1,
          contextVersion: 0,
          plan: { city: '', origin: '', date: '', time: '18:00' },
          preferences: {},
          checks: {},
          venues: [],
          votes: {},
          selectedId: null,
          approved: null,
          voiceDelivery: 'idle',
        },
      },
    },
    peers: ['202', '303'],
    agentState: 'listening',
    assistantLevel: 0,
    videoFeeds: [{ uid: '202', local: false, track }],
    micMuted: false,
    micLevel: 0,
    audioBlocked: false,
    turns: [],
    stageBusy: false,
    stageError: null,
    cameraEnabled: false,
    cameraBusy: false,
    end: jest.fn(),
    toggleCamera: jest.fn(),
    stageCommand: jest.fn(),
  };
  (useWebVoiceRoom as jest.Mock).mockReturnValue(voice);
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<LiveVoiceScreen onLeave={jest.fn()} />, {
      createNodeMock: element => (element.type === 'div' ? {} : null),
    });
  });
  const press = (label: string) =>
    act(() =>
      tree.root.findByProps({ accessibilityLabel: label }).props.onPress(),
    );
  const workspace = () =>
    tree.root
      .findAllByType('div')
      .find(item => item.props.className?.startsWith('room-workspace'))!;
  expect(workspace().props.className).toContain('view-stage');
  expect(
    tree.root.findAllByProps({ className: 'room-person-tile' }),
  ).toHaveLength(2);
  expect(
    tree.root.findAllByProps({ className: 'assistant-avatar' }),
  ).toHaveLength(1);
  expect(track.play).toHaveBeenCalledTimes(1);
  press('Plan');
  press('Set meeting details');
  act(() =>
    tree.root
      .findByProps({ accessibilityLabel: 'City for your outing' })
      .props.onChangeText('Delhi'),
  );
  press('Call view');
  expect(workspace().props.className).toContain('view-people');
  press('Captions');
  expect(workspace().props.className).toContain('view-conversation');
  press('Room + Stage');
  expect(
    tree.root.findByProps({ accessibilityLabel: 'City for your outing' }).props
      .value,
  ).toBe('Delhi');
  expect(track.play).toHaveBeenCalledTimes(1);
  expect(track.stop).not.toHaveBeenCalled();
  expect(voice.end).not.toHaveBeenCalled();
  expect(voice.toggleCamera).not.toHaveBeenCalled();
  act(() => tree.unmount());
  expect(track.stop).toHaveBeenCalledTimes(1);
});

it('changes speaking gestures across turns while silence and thinking close the mouth', () => {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<AssistantAvatar mode="speaking" level={0.12} />);
  });
  const avatar = () => tree.root.findByProps({ className: 'assistant-avatar' });
  expect(avatar().props['data-pose']).toBe('welcome');
  act(() => tree.update(<AssistantAvatar mode="speaking" level={0.08} />));
  expect(avatar().props['data-pose']).toBe('welcome');
  act(() => tree.update(<AssistantAvatar mode="thinking" level={0.12} />));
  expect(avatar().props['data-pose']).toBe('think');
  expect(
    tree.root.findAllByProps({ className: 'assistant-mouth' }),
  ).toHaveLength(0);
  act(() => tree.update(<AssistantAvatar mode="speaking" level={0.12} />));
  expect(avatar().props['data-pose']).toBe('explain');
  act(() => tree.update(<AssistantAvatar mode="listening" />));
  act(() => tree.update(<AssistantAvatar mode="speaking" level={0.12} />));
  expect(avatar().props['data-pose']).toBe('agree');
  act(() => tree.update(<AssistantAvatar mode="speaking" level={0} />));
  expect(
    tree.root.findAllByProps({ className: 'assistant-mouth' }),
  ).toHaveLength(0);
  act(() => tree.unmount());
});
