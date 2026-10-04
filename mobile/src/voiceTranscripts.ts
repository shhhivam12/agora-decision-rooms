import {
  MessageType,
  type TranscriptHelperItem,
  type UserTranscription,
  type AgentTranscription,
} from 'agora-agent-client-toolkit';
export interface VoiceTurn {
  key: string;
  uid: string;
  role: 'user' | 'agent';
  text: string;
  turnId: number;
  final: boolean;
}
export type VoiceTranscript = TranscriptHelperItem<
  Partial<UserTranscription | AgentTranscription>
>;
export function isStageControl(text: string): boolean {
  return /^\s*STAGE_READ_RESULT\b/i.test(text);
}
export function voiceTurns(items: VoiceTranscript[]): VoiceTurn[] {
  const turns = new Map<string, VoiceTurn>();
  for (const item of items) {
    if (
      !item.text?.trim() ||
      isStageControl(item.text) ||
      isStageControl(item.metadata?.text || '')
    )
      continue;
    const role =
      item.metadata?.object === MessageType.AGENT_TRANSCRIPTION
        ? 'agent'
        : 'user';
    // The toolkit uses a fixed self UID for every user transcript. The ASR
    // payload carries the actual speaker; never credit every turn to ourselves.
    const uid =
      role === 'user' && item.metadata?.user_id
        ? String(item.metadata.user_id)
        : item.uid;
    const key = uid + ':' + role + ':' + item.turn_id;
    turns.set(key, {
      key,
      uid,
      role,
      text: item.text,
      turnId: item.turn_id,
      final:
        role === 'user' &&
        item.metadata?.object === MessageType.USER_TRANSCRIPTION &&
        'final' in item.metadata &&
        item.metadata.final === true,
    });
  }
  return [...turns.values()];
}
