# Current submission claim evidence

Updated 4 October 2026. Code and automated checks were inspected locally; the user previously confirmed that live voice is working after the web RTM constructor fix. New Hindi/English modes and participant video have separate checks below. Historical native and media checks are separate from that confirmation.

| Claim | Source evidence | Status |
| --- | --- | --- |
| Mobile-friendly product shell and recurring character branding | `mobile/App.tsx`, `src/ui/*Screen.tsx`, character assets | Working browser UI; creation/social/preferences include local preview controls |
| Shared live Agora voice on laptop and Android browser | `WebVoiceSession.ts`, `useWebVoiceRoom.ts`, `voice_rooms.py` | User reported working after two-device setup and constructor correction |
| Shared live captions and assistant state | Web RTM and Agent Client Toolkit integration | Implemented; user reported the live experience working, without a separate per-control audit |
| Scrollable conversation captions with Latest recovery | `CaptionScroller.tsx`, `CaptionScroller.test.tsx` | Implemented; auto-follow and preserving history reading tested |
| English/Hindi interface and assistant modes | `i18n.tsx`, `translations/hi.ts`, `agent.py`, room language tests | Hindi layouts checked in browser; real Agora start/end succeeded for en, hi, multi. Physical Hindi audibility pending |
| Scoped tokens and agent lifecycle | `server.py`, `agent.py`, `scripts/check-live-voice.py` | Real backend token generation and Conversational AI start/stop checked |
| Up to four room members, host/guest access and cleanup | `voice_rooms.py`, `test_voice_rooms.py` | Implemented and tested with fakes; manual device test used two devices |
| Guided Smart Stage and three scenarios | `OutingRoomScreen.tsx`, `SmartStage.test.tsx` | Working local workflow with fixture venue data |
| Guided votes, host approval and on-screen receipt | `OutingRoomScreen.tsx`, `SmartStage.test.tsx` | Three simulated votes, approval gate and local receipt; no external write |
| STT → LLM → TTS | `agent.py` | Deepgram, Agora-managed OpenAI and MiniMax configured through Agora |
| VAD and interruption | `agent.py` | Configured; no benchmark or separate interruption validation claimed |
| Offline guided judge fallback | Production/static browser checks | Voice-offline screen opens the guided decision workflow |
| Native Android audio and packaging | Native adapters and Android workflow | Refreshed version 1.1.0 test build; its build result is recorded with the GitHub release. Physical phone playback remains a separate check. Shared browser Stage/video are separate from the native flow. |
| Participant video in laptop/Android browser rooms | `WebVoiceSession.ts`, `VideoTile.web.tsx`, media/hook tests | Implemented; optional camera publishing/subscription and cleanup tested with SDK mocks. Physical two-device video pending; browser feature, separate from the native flow |
| Final speech → shared preference cards | `voiceTranscripts.ts`, `useWebVoiceRoom.ts`, `live_stage.py` | Implemented; own finalized user turns only, bilingual parser and dedup tested. Physical speech-to-card rehearsal pending |
| Real shared member votes and host confirmation | `live_stage.py`, `LiveSmartStage.tsx`, `test_live_stage.py` | Implemented; authentication, unanimous support, stale revision rejection and context/roster resets tested |
| Four live read checks: discovery, reservation policy/hours, weather, driving | `planning_tools.py`, `scripts/check-live-stage.py` | Real public providers; missing prices/slots stay unknown. Source checks recorded separately from mocked tests |
| Agora spoken read-result grounding | `agent.py:deliver_stage`, `live_stage.py` | Actual SDK think with state-specific actions; construction tested. Cloud acceptance and device audibility tracked separately |
| Microphone-free planning entry for judges | `useWebVoiceRoom.ts`, `LiveVoiceScreen.web.tsx` | Skips RTC capture/assistant start, retains actual backend Stage and member votes |
| Exact reservation slots, calendar writes, payments | Separate provider integrations | Not implemented; no booking or payment made by the new Stage |

The reused foundation is Agora's official React Native Conversational AI recipe. Original work includes the product shell, shared web voice-room lifecycle, Smart Stage, scenario handling, approval interaction, facilitation prompt and branding. The recurring cast represents personalities in the product design; it is not a multi-agent AI implementation.

The [real Stage verification](verification/live-smart-stage-2026-10-04.json) passed all four provider reads, matching two-member views, rejection of early host approval, actual-member consensus and accepted Agora result-delivery requests. This does not prove physical microphone captions or audible result playback on Android. Current UI/media checks are also recorded in [the bilingual/video check](verification/bilingual-video-2026-10-04.json). The container recipe is prepared but Docker was unavailable on this laptop. No public deployment, production-readiness, traction, award or performance claims are made by these checks.

See [the video journey](video-demo-journey.md) and [live setup guide](live-demo-guide.md).

