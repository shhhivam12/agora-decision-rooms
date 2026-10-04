import AgoraRTC from 'agora-rtc-sdk-ng';
import AgoraRTM from 'agora-rtm';
import { AgoraVoiceAI } from 'agora-agent-client-toolkit';
import {
  WebVoiceSession,
  type WebVoiceCallbacks,
} from '../src/agora/WebVoiceSession';

jest.mock('agora-rtc-sdk-ng', () => ({
  __esModule: true,
  default: {
    setLogLevel: jest.fn(),
    createMicrophoneAudioTrack: jest.fn(),
    createCameraVideoTrack: jest.fn(),
    createClient: jest.fn(),
  },
}));
jest.mock('agora-rtm', () => ({
  __esModule: true,
  default: { RTM: jest.fn() },
}));
jest.mock('agora-agent-client-toolkit', () => ({
  AgoraVoiceAI: { init: jest.fn() },
  AgoraVoiceAIEvents: {
    TRANSCRIPT_UPDATED: 'transcript',
    AGENT_STATE_CHANGED: 'state',
    AGENT_ERROR: 'error',
  },
  TranscriptHelperMode: { TEXT: 'text' },
}));

const config = {
  appId: 'test-project',
  channelName: 'shared',
  uid: '101',
  agentUid: '303',
  token: 'test-token',
};
let mic: any;
let rtc: any;
let rtm: any;
let ai: any;
let cb: WebVoiceCallbacks;

beforeEach(() => {
  jest.useFakeTimers();
  Object.defineProperty(global, 'window', {
    configurable: true,
    value: { isSecureContext: true },
  });
  Object.defineProperty(global, 'navigator', {
    configurable: true,
    value: { mediaDevices: { getUserMedia: jest.fn() } },
  });
  mic = {
    stop: jest.fn(),
    close: jest.fn(),
    getVolumeLevel: () => 0.1,
    setMuted: jest.fn(),
  };
  rtc = {
    on: jest.fn(),
    join: jest.fn().mockResolvedValue(101),
    publish: jest.fn(),
    unpublish: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn(),
    leave: jest.fn(),
    remoteUsers: [],
  };
  rtm = {
    login: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn().mockResolvedValue({}),
    logout: jest.fn(),
  };
  ai = {
    on: jest.fn(),
    subscribeMessage: jest.fn(),
    unsubscribe: jest.fn(),
    destroy: jest.fn(),
  };
  (AgoraRTC.createMicrophoneAudioTrack as jest.Mock).mockResolvedValue(mic);
  (AgoraRTC.createClient as jest.Mock).mockReturnValue(rtc);
  (AgoraRTM.RTM as unknown as jest.Mock).mockImplementation(() => rtm);
  (AgoraVoiceAI.init as jest.Mock).mockResolvedValue(ai);
  cb = {
    transcript: jest.fn(),
    state: jest.fn(),
    peers: jest.fn(),
    video: jest.fn(),
    audioBlocked: jest.fn(),
    micLevel: jest.fn(),
    assistantLevel: jest.fn(),
    status: jest.fn(),
    error: jest.fn(),
  };
});
afterEach(() => jest.useRealTimers());

it('plays already published audio and allows a user gesture to resume it', async () => {
  const play = jest.fn();
  rtc.remoteUsers = [{ uid: 202, hasAudio: true, audioTrack: { play } }];
  const session = new WebVoiceSession(cb);
  await session.prepare();
  await session.start(config);
  expect(rtc.subscribe).toHaveBeenCalledWith(rtc.remoteUsers[0], 'audio');
  expect(play).toHaveBeenCalledTimes(1);
  AgoraRTC.onAutoplayFailed?.();
  expect(cb.audioBlocked).toHaveBeenCalledWith(true);
  session.enableAudio();
  expect(play).toHaveBeenCalledTimes(2);
  expect(cb.audioBlocked).toHaveBeenLastCalledWith(false);
  expect(rtm.subscribe).toHaveBeenCalledWith('shared', {
    withMessage: true,
    withPresence: true,
  });
  await session.stop();
  expect(mic.close).toHaveBeenCalledTimes(1);
  expect(rtc.leave).toHaveBeenCalledTimes(1);
  expect(rtm.logout).toHaveBeenCalledTimes(1);
});

it('releases audio after a caption connection failure', async () => {
  rtm.login.mockRejectedValue(new Error('caption login failed'));
  const session = new WebVoiceSession(cb);
  await session.prepare();
  await expect(session.start(config)).rejects.toThrow('caption login failed');
  await session.stop();
  expect(mic.close).toHaveBeenCalledTimes(1);
  expect(rtc.leave).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

it('drives the avatar only from the received assistant track and releases its level sampler on leave', async () => {
  let volume = 0.18;
  rtc.remoteUsers = [
    {
      uid: 202,
      hasAudio: true,
      audioTrack: { play: jest.fn(), getVolumeLevel: () => 0.9 },
    },
    {
      uid: 303,
      hasAudio: true,
      audioTrack: { play: jest.fn(), getVolumeLevel: () => volume },
    },
  ];
  const session = new WebVoiceSession(cb);
  await session.prepare();
  await session.start(config);
  jest.advanceTimersByTime(120);
  expect(cb.assistantLevel).toHaveBeenLastCalledWith(0.18);
  volume = 0;
  jest.advanceTimersByTime(120);
  expect(cb.assistantLevel).toHaveBeenLastCalledWith(0);
  expect(cb.assistantLevel).not.toHaveBeenCalledWith(0.9);
  const calls = (cb.assistantLevel as jest.Mock).mock.calls.length;
  jest.advanceTimersByTime(480);
  expect(cb.assistantLevel).toHaveBeenCalledTimes(calls);
  await session.stop();
  expect(jest.getTimerCount()).toBe(0);
});

it('closes a microphone that resolves after the connection was cancelled', async () => {
  let finish!: (track: any) => void;
  (AgoraRTC.createMicrophoneAudioTrack as jest.Mock).mockImplementation(
    () =>
      new Promise(resolve => {
        finish = resolve;
      }),
  );
  const session = new WebVoiceSession(cb);
  const pending = session.prepare();
  await session.stop();
  finish(mic);
  await expect(pending).rejects.toThrow('cancelled');
  expect(mic.close).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

const cameraTrack = () => ({
  play: jest.fn(),
  stop: jest.fn(),
  close: jest.fn(),
});
it('publishes a camera only on request, and turning it off keeps the microphone alive', async () => {
  const camera = cameraTrack();
  (AgoraRTC.createCameraVideoTrack as jest.Mock).mockResolvedValue(camera);
  const session = new WebVoiceSession(cb);
  await session.prepare();
  await session.start(config);
  expect(AgoraRTC.createCameraVideoTrack).not.toHaveBeenCalled();
  expect(await session.setCamera(true)).toBe(true);
  expect(rtc.publish).toHaveBeenCalledWith(camera);
  expect(cb.video).toHaveBeenLastCalledWith([
    { uid: '101', local: true, track: camera },
  ]);
  await session.setCamera(false);
  expect(rtc.unpublish).toHaveBeenCalledWith(camera);
  expect(camera.close).toHaveBeenCalledTimes(1);
  expect(mic.close).not.toHaveBeenCalled();
  await session.stop();
});
it('leaves voice working when camera permission is denied', async () => {
  (AgoraRTC.createCameraVideoTrack as jest.Mock).mockRejectedValue(
    new Error('PERMISSION_DENIED'),
  );
  const session = new WebVoiceSession(cb);
  await session.prepare();
  await session.start(config);
  await expect(session.setCamera(true)).rejects.toThrow('PERMISSION_DENIED');
  await session.mute(true);
  expect(mic.setMuted).toHaveBeenCalledWith(true);
  expect(mic.close).not.toHaveBeenCalled();
  expect(rtc.leave).not.toHaveBeenCalled();
  await session.stop();
});
it('closes a camera permission request that resolves after leaving', async () => {
  const camera = cameraTrack();
  let finish!: (track: any) => void;
  (AgoraRTC.createCameraVideoTrack as jest.Mock).mockImplementation(
    () =>
      new Promise(resolve => {
        finish = resolve;
      }),
  );
  const session = new WebVoiceSession(cb);
  await session.prepare();
  await session.start(config);
  const pending = session.setCamera(true);
  await session.stop();
  finish(camera);
  expect(await pending).toBe(false);
  expect(camera.close).toHaveBeenCalledTimes(1);
  expect(rtc.publish).not.toHaveBeenCalledWith(camera);
});
it('subscribes to both media and removes remote video without disrupting audio', async () => {
  const remote = {
    uid: 202,
    hasAudio: true,
    hasVideo: true,
    audioTrack: { play: jest.fn() },
    videoTrack: cameraTrack(),
  };
  rtc.remoteUsers = [remote];
  const session = new WebVoiceSession(cb);
  await session.prepare();
  await session.start(config);
  expect(rtc.subscribe).toHaveBeenCalledWith(remote, 'audio');
  expect(rtc.subscribe).toHaveBeenCalledWith(remote, 'video');
  expect(cb.video).toHaveBeenLastCalledWith([
    { uid: '202', local: false, track: remote.videoTrack },
  ]);
  const unpublish = rtc.on.mock.calls.find(
    (call: any[]) => call[0] === 'user-unpublished',
  )[1];
  unpublish(remote, 'video');
  expect(cb.video).toHaveBeenLastCalledWith([]);
  session.enableAudio();
  expect(remote.audioTrack.play).toHaveBeenCalledTimes(2);
  await session.stop();
});
it('closes the active camera immediately when the room ends', async () => {
  const camera = cameraTrack();
  (AgoraRTC.createCameraVideoTrack as jest.Mock).mockResolvedValue(camera);
  const session = new WebVoiceSession(cb);
  await session.prepare();
  await session.start(config);
  await session.setCamera(true);
  const leaving = session.stop();
  expect(camera.close).toHaveBeenCalledTimes(1);
  expect(cb.video).toHaveBeenLastCalledWith([]);
  await leaving;
});

it('closes camera capture immediately even while publishing is pending', async () => {
  const camera = cameraTrack();
  (AgoraRTC.createCameraVideoTrack as jest.Mock).mockResolvedValue(camera);
  const session = new WebVoiceSession(cb);
  await session.prepare();
  await session.start(config);
  let finish!: () => void;
  rtc.publish.mockImplementation(
    () =>
      new Promise<void>(resolve => {
        finish = resolve;
      }),
  );
  const pending = session.setCamera(true);
  await Promise.resolve();
  await session.stop();
  expect(camera.close).toHaveBeenCalledTimes(1);
  finish();
  expect(await pending).toBe(false);
  expect(camera.close).toHaveBeenCalledTimes(1);
});
