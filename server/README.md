# Agora Decision Rooms voice backend

FastAPI owns RTC/RTM token generation, the Agora Conversational AI assistant and the authoritative shared Smart Stage. The browser uses shared voice rooms with real planning checks and authenticated member votes; the native Android client retains its quickstart voice API. The guided outing uses separate local sample options and simulated votes.

See [the laptop + Android setup guide](../docs/live-demo-guide.md) for start commands, USB forwarding and troubleshooting.

## Run locally

Configure the ignored `server/.env` from `.env.example`. Required: `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` for an enabled Agora Conversational AI project. The app certificate and vendor keys stay server-side. `OPENAI_API_KEY` is optional when Agora-managed OpenAI is available on the project.

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt -r requirements-dev.txt
.venv\Scripts\python.exe src\server.py
```

The server binds to `127.0.0.1:8000` by default. The Vite web client proxies `/api` to it; Android Chrome accesses the web client through USB forwarding. Native emulator clients use `10.0.2.2:8000`.

## Shared browser API

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Configuration readiness; no credentials returned |
| `POST /api/voice/rooms` | Create a room and receive scoped host access |
| `POST /api/voice/rooms/{code}/join` | Join with a distinct numeric RTC UID |
| `POST /api/voice/rooms/{code}/assistant` | Host starts one idempotent assistant |
| `GET /api/voice/rooms/{code}` | Member-authenticated status and heartbeat |
| `POST /api/voice/rooms/{code}/leave` | Guest leaves; host ends room and assistant |

Create/join take `{ "name": "Your name" }`. Other room routes require `X-Room-Member` with the member secret returned for that browser. Public room snapshots omit secrets and tokens. Rooms allow four people, expire after 15 minutes and are limited to four simultaneous rooms per backend process. Host heartbeats expire after two minutes; a 20-second cleanup loop retries cloud session shutdown.

RTC+RTM tokens last 30 minutes, covering the room lifetime. The assistant uses `remote_uids=["*"]` so it listens to both laptop and phone. Its pipeline is Deepgram Nova-3 multilingual (English/Hindi code switching) → Agora-managed OpenAI gpt-4o-mini → MiniMax TTS with English/Hindi/auto language boost. Hosts choose `language: en | hi | multi` when creating a room; guests inherit that mode. RTM carries captions, state and errors. Participant camera video uses the existing RTC channel and is not configured as AI vision input. The assistant proposes plans and does not invent votes or external actions.

## Production web hosting

After `cd mobile && npm run web:build`, this server can serve `mobile/dist-web` at `/` alongside the API. `WEB_DIST_DIR` overrides the static directory. The repository `Dockerfile` builds and serves both from one origin and disables the legacy native API. The hosting provider must supply HTTPS and server environment variables.

| Environment | Default | Purpose |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Bind address; container sets `0.0.0.0` |
| `PORT` | `8000` | HTTP port |
| `ENABLE_NATIVE_API` | `true` | Set `false` for a browser-only hosted demo |
| `WEB_DIST_DIR` | `mobile/dist-web` | Optional production client directory |
| `CORS_ALLOW_ORIGINS` | Local web origins | Comma-separated allowed client origins |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model override |
| `AGENT_GREETING` | Branded built-in greeting | Opening message override |

Legacy native endpoints: `GET /get_config`, `POST /startAgent`, `POST /stopAgent`; `/health` aliases `/api/health`. Shared rooms live in memory, so a hosted demo should run one worker. Restarting it ends its active rooms.

## Verify

```powershell
.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider
```

Audible playback and remote video require a physical-device check in addition to automated tests.
