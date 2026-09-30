import { RtcEngineAdapter } from '../src/agora/RtcEngineAdapter';
import { createAgoraRtcEngine } from 'react-native-agora';

jest.mock('react-native-agora', () => ({
  createAgoraRtcEngine: jest.fn(),
  ClientRoleType: { ClientRoleBroadcaster: 1 },
}));

describe('Agora RTC join lifecycle', () => {
  let handler: any;
  let engine: any;
  beforeEach(() => {
    jest.useFakeTimers();
    engine = { initialize: jest.fn(), registerEventHandler: jest.fn(h => { handler = h; }), enableAudio: jest.fn(), joinChannel: jest.fn(() => 0), leaveChannel: jest.fn(), unregisterEventHandler: jest.fn(), release: jest.fn() };
    (createAgoraRtcEngine as jest.Mock).mockReturnValue(engine);
  });
  afterEach(() => { jest.useRealTimers(); });

  it('waits for the actual RTC joined callback before starting the agent path', async () => {
    const adapter = new RtcEngineAdapter();
    let joined = false;
    const promise = adapter.join('app', 'token', 'room', 123).then(() => { joined = true; });
    await Promise.resolve();
    expect(joined).toBe(false);
    handler.onJoinChannelSuccess();
    await promise;
    expect(joined).toBe(true);
    expect(engine.joinChannel).toHaveBeenCalledWith('token', 'room', 123, expect.objectContaining({ publishMicrophoneTrack: true, autoSubscribeAudio: true }));
  });
  it('surfaces RTC errors instead of reporting a connected voice session', async () => {
    const adapter = new RtcEngineAdapter();
    const promise = adapter.join('app', 'token', 'room', 123);
    const assertion = expect(promise).rejects.toThrow('Agora RTC connection failed');
    handler.onError(110, 'Invalid token');
    await assertion;
  });
  it('times out a join that never reaches Agora', async () => {
    const adapter = new RtcEngineAdapter();
    const promise = adapter.join('app', 'token', 'room', 123);
    const assertion = expect(promise).rejects.toThrow('timed out');
    jest.advanceTimersByTime(20000);
    await assertion;
  });
});
