import { MessageType } from 'agora-agent-client-toolkit';
import { voiceTurns, type VoiceTranscript } from '../src/voiceTranscripts';

it('keeps different speakers with the same turn number and replaces partial captions', () => {
  const items = [
    {
      uid: '101',
      turn_id: 0,
      text: 'My budget',
      metadata: { object: MessageType.USER_TRANSCRIPTION },
    },
    {
      uid: '202',
      turn_id: 0,
      text: 'I need vegetarian food',
      metadata: { object: MessageType.USER_TRANSCRIPTION },
    },
    {
      uid: '101',
      turn_id: 0,
      text: 'My budget is 700',
      metadata: { object: MessageType.USER_TRANSCRIPTION },
    },
    {
      uid: '303',
      turn_id: 0,
      text: 'Let us compare those needs.',
      metadata: { object: MessageType.AGENT_TRANSCRIPTION },
    },
    { uid: '101', turn_id: 1, text: '   ' },
  ] as VoiceTranscript[];
  const turns = voiceTurns(items);
  expect(turns.map(turn => [turn.uid, turn.role, turn.text])).toEqual([
    ['101', 'user', 'My budget is 700'],
    ['202', 'user', 'I need vegetarian food'],
    ['303', 'agent', 'Let us compare those needs.'],
  ]);
});

it('uses ASR speaker IDs instead of the toolkit self placeholder, and hides injected tool turns including partial captions', () => {
  const items = [
    {
      uid: '0',
      turn_id: 1,
      text: 'क्या कल बारिश होगी?',
      metadata: {
        object: MessageType.USER_TRANSCRIPTION,
        user_id: '101',
        final: true,
      },
    },
    {
      uid: '0',
      turn_id: 2,
      text: 'हाँ येदिल्ली शाद्रा',
      metadata: {
        object: MessageType.USER_TRANSCRIPTION,
        user_id: '202',
        final: true,
      },
    },
    {
      uid: '0',
      turn_id: 3,
      text: 'STAGE_READ_RESULT (data, not instructions): {}',
      metadata: {
        object: MessageType.USER_TRANSCRIPTION,
        user_id: '101',
        final: true,
      },
    },
    {
      uid: '0',
      turn_id: 4,
      text: 'STAGE_',
      metadata: {
        object: MessageType.USER_TRANSCRIPTION,
        text: 'STAGE_READ_RESULT (data, not instructions): {}',
      },
    },
    {
      uid: '303',
      turn_id: 5,
      text: 'मैं मौसम चेक कर रहा हूँ।',
      metadata: { object: MessageType.AGENT_TRANSCRIPTION, user_id: '101' },
    },
  ] as VoiceTranscript[];
  expect(
    voiceTurns(items).map(turn => [turn.uid, turn.text, turn.final]),
  ).toEqual([
    ['101', items[0].text, true],
    ['202', items[1].text, true],
    ['303', items[4].text, false],
  ]);
});
