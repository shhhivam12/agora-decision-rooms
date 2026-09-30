# Submission claim evidence

Verified on 30 September 2026. Generated media and evidence live in the ignored `artifacts/submission` directory.

| Claim | Source evidence | Status |
| --- | --- | --- |
| Mobile social shell | `mobile/App.tsx`, `src/ui/*Screen.tsx` | Working; actual browser journey captured |
| Shared Smart Stage and three scenarios | `OutingRoomScreen.tsx`, `SmartStage.test.tsx` | Working local demo; fixture venue data |
| Voting, host approval and receipt | `OutingRoomScreen.tsx`, `SmartStage.test.tsx` | Working local simulation; no remote votes or external calendar write |
| Agora RTC microphone and audio | `RtcEngineAdapter.ts`, `AgoraSession.ts`, `LiveVoiceScreen.tsx` | Native path wired; live device validation pending |
| RTM transcripts and agent state | `RtmEngineAdapter.ts`, `AgoraSession.ts`, `CallState.ts`, `CallScreen.tsx` | Native path wired; live audio/transcript validation pending |
| Token and agent session backend | `server.py`, `agent.py` | SDK/configuration tests pass; live account validation pending |
| STT → LLM → TTS | `agent.py` | Deepgram, OpenAI and MiniMax configured through Agora |
| VAD, interruption, metrics and errors | `agent.py` | Configured; no performance guarantee |
| Participant video | Camera-off tiles | UI only; video calling not implemented |
| Multi-device sync, venues, calendar | Architecture plan | Next integrations |

The reused foundation is Agora's official React Native Conversational AI recipe. Original hackathon work includes the social shell, Smart Stage, scenario handling, governance interaction, branding, facilitation prompt, native voice entry and submission media. No production readiness, user traction, awards or benchmark claims are made.
