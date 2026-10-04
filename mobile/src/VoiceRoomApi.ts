import type { AgentConfig } from './BackendApi';
import type { LiveStageState, StageCommand } from './liveStageTypes';
export type VoiceLanguage = 'en' | 'hi' | 'multi';
export interface VoiceMember {
  uid: string;
  name: string;
  host: boolean;
}
export interface VoiceRoom {
  code: string;
  hostUid: string;
  expiresAt: number;
  closed: boolean;
  assistantStarted: boolean;
  language: VoiceLanguage;
  members: VoiceMember[];
  stage?: LiveStageState;
}
export interface VoiceRoomAccess {
  config: AgentConfig;
  memberSecret: string;
  room: VoiceRoom;
}
export class VoiceRoomApi {
  constructor(private baseUrl = '') {}
  private async request<T>(
    path: string,
    method = 'GET',
    body?: object,
    secret?: string,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      path.endsWith('/assistant') ? 60000 : 12000,
    );
    try {
      const response = await fetch(this.baseUrl.replace(/\/$/, '') + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? { 'X-Room-Member': secret } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal,
        keepalive: method === 'POST' && path.endsWith('/leave'),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        throw new Error(
          typeof data?.detail === 'string'
            ? data.detail
            : Array.isArray(data?.detail)
            ? 'Check the meeting details or preferences and try again.'
            : 'The live voice service is unavailable. You can still explore the decision demo.',
        );
      }
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError')
        throw new Error(
          'The voice service took too long to respond. Please try again.',
        );
      if (error instanceof TypeError)
        throw new Error(
          'Cannot reach the voice service. Check that the local demo server is running.',
        );
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  health() {
    return this.request<{ configured: boolean }>('/api/health');
  }
  create(name: string, language: VoiceLanguage = 'multi') {
    return this.request<VoiceRoomAccess>('/api/voice/rooms', 'POST', {
      name,
      language,
    });
  }
  join(code: string, name: string) {
    return this.request<VoiceRoomAccess>(
      '/api/voice/rooms/' +
        encodeURIComponent(code.trim().toUpperCase()) +
        '/join',
      'POST',
      { name },
    );
  }
  status(access: VoiceRoomAccess) {
    return this.request<{ room: VoiceRoom }>(
      '/api/voice/rooms/' + access.room.code,
      'GET',
      undefined,
      access.memberSecret,
    );
  }
  inviteAssistant(access: VoiceRoomAccess) {
    return this.request<{ room: VoiceRoom }>(
      '/api/voice/rooms/' + access.room.code + '/assistant',
      'POST',
      {},
      access.memberSecret,
    );
  }
  stage(access: VoiceRoomAccess, command: StageCommand) {
    return this.request<{ room: VoiceRoom }>(
      '/api/voice/rooms/' + access.room.code + '/stage',
      'POST',
      command,
      access.memberSecret,
    );
  }
  leave(access: VoiceRoomAccess) {
    return this.request<{ room: VoiceRoom }>(
      '/api/voice/rooms/' + access.room.code + '/leave',
      'POST',
      {},
      access.memberSecret,
    );
  }
}
