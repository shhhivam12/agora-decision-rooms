import { BackendApi } from '../src/BackendApi';

describe('BackendApi', () => {
  const api = new BackendApi('http://localhost:8000');
  afterEach(() => jest.restoreAllMocks());

  it('decodes get_config envelope', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ code: 0, data: { app_id: 'a', token: 't', uid: '123', channel_name: 'c', agent_uid: '999' } }),
    }) as any;
    const cfg = await api.getConfig();
    expect(cfg.appId).toBe('a'); expect(cfg.uid).toBe('123'); expect(cfg.agentUid).toBe('999');
  });
  it('startAgent returns id', async () => {
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ code: 0, data: { agent_id: 'ag-1' } }) }) as any;
    expect(await api.startAgent('c', 999, 123)).toBe('ag-1');
  });
  it('surfaces configuration failures before starting a native session', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ detail: 'Service not properly configured' }) }) as any;
    await expect(api.getConfig()).rejects.toThrow('Service not properly configured');
  });
  it('rejects incomplete configuration rather than joining with missing credentials', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 0, data: { app_id: 'a' } }) }) as any;
    await expect(api.getConfig()).rejects.toThrow('incomplete Agora connection configuration');
  });
});
