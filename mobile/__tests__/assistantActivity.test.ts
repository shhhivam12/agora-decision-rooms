import { assistantActivity, mouthOpening } from '../src/assistantActivity';

it('follows real speech, thinking and listening without treating microphone-free planning as a live call', () => {
  const base = { stageOnly: false, joined: true, state: 'listening', level: 0 };
  expect(assistantActivity(base).mode).toBe('listening');
  expect(assistantActivity({ ...base, state: 'thinking' }).mode).toBe(
    'thinking',
  );
  expect(assistantActivity({ ...base, level: 0.15 }).mode).toBe('speaking');
  expect(
    assistantActivity({ ...base, state: 'speaking', audioBlocked: true }).mode,
  ).toBe('paused');
  expect(
    assistantActivity({
      ...base,
      stageOnly: true,
      state: 'speaking',
      level: 0.9,
    }).mode,
  ).toBe('offline');
  expect(
    assistantActivity({ ...base, stageOnly: true, checking: true }).mode,
  ).toBe('thinking');
  expect(assistantActivity({ ...base, joined: false, level: 0.5 }).mode).toBe(
    'joining',
  );
});

it('closes the mouth in silent and non-speaking states and clamps malformed levels', () => {
  expect(mouthOpening('speaking', 0)).toBe(0);
  expect(mouthOpening('thinking', 0.8)).toBe(0);
  expect(mouthOpening('speaking', NaN)).toBe(0);
  expect(mouthOpening('speaking', 0.1)).toBe(0.5);
  expect(mouthOpening('speaking', 0.8)).toBe(1);
});
