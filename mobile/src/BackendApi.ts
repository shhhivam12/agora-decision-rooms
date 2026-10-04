export interface AgentConfig {
  appId: string;
  token: string;
  uid: string;
  channelName: string;
  agentUid: string;
}

export class BackendApi {
  constructor(private baseUrl: string) {}

  private async request(path: string, body?: object): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}${path}`,
      body
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        : undefined,
    );
    const data = await response.json();
    if (response.ok === false || (data.code !== undefined && data.code !== 0)) {
      throw new Error(
        typeof data.detail === 'string'
          ? data.detail
          : data.msg ||
            'Agora backend request failed. Check the server configuration.',
      );
    }
    return data;
  }

  async getConfig(): Promise<AgentConfig> {
    const j = await this.request('/get_config?uid=0');
    const d = j.data;
    if (
      !d?.app_id ||
      !d?.token ||
      !d?.channel_name ||
      !d?.uid ||
      !d?.agent_uid
    ) {
      throw new Error(
        'The backend returned an incomplete Agora connection configuration.',
      );
    }
    return {
      appId: d.app_id,
      token: d.token,
      uid: d.uid,
      channelName: d.channel_name,
      agentUid: d.agent_uid,
    };
  }

  async startAgent(
    channelName: string,
    rtcUid: number,
    userUid: number,
    language?: 'en' | 'hi' | 'multi',
  ): Promise<string> {
    const result = await this.request('/startAgent', {
      channelName,
      rtcUid,
      userUid,
      ...(language ? { language } : {}),
    });
    if (!result.data?.agent_id)
      throw new Error('Agora did not return an agent session ID.');
    return result.data.agent_id;
  }

  async stopAgent(agentId: string): Promise<void> {
    await this.request('/stopAgent', { agentId });
  }
}
