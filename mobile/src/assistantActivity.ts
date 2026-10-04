export type AssistantMode =
  | 'offline'
  | 'joining'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'paused'
  | 'idle';

export function assistantActivity({
  stageOnly,
  joined,
  state,
  level = 0,
  checking = false,
  audioBlocked = false,
}: {
  stageOnly: boolean;
  joined: boolean;
  state: string;
  level?: number;
  checking?: boolean;
  audioBlocked?: boolean;
}): { mode: AssistantMode; label: string } {
  if (stageOnly)
    return checking
      ? { mode: 'thinking', label: 'Checking your plan' }
      : { mode: 'offline', label: 'Voice off' };
  if (!joined) return { mode: 'joining', label: 'Joining your room…' };
  if (audioBlocked) return { mode: 'paused', label: 'Sound paused' };
  if (state === 'speaking' || level > 0.02)
    return { mode: 'speaking', label: 'Speaking' };
  if (state === 'thinking' || checking)
    return { mode: 'thinking', label: 'Thinking' };
  if (state === 'listening') return { mode: 'listening', label: 'Listening' };
  return { mode: 'idle', label: 'Ready to help' };
}

/** Actual received audio level, with quiet samples closing the mouth. */
export function mouthOpening(mode: AssistantMode, level: number) {
  if (mode !== 'speaking' || !Number.isFinite(level) || level < 0.012) return 0;
  return Math.max(0, Math.min(1, level * 5));
}
