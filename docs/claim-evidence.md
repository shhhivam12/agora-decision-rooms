# Features and prototype scope

Agora Decision Rooms brings up to four people into a shared browser room with one AI facilitator, Kabir. The native Android APK and static guided preview provide separate ways to try the product.

| Experience | What is available |
| --- | --- |
| Shared browser room with the backend | Agora voice, optional participant video, captions, English/Hindi/Hinglish assistant modes, shared preferences and planning checks, member votes and host confirmation. |
| Shared Stage without microphone | Typed preferences and requests, real provider checks, shared votes and confirmation through the backend. No microphone or cloud voice assistant starts. |
| Public static preview | Current UI and guided outing with sample venues, illustrated participants, simulated votes and a local receipt. |
| Android test APK 1.1.0 | Current native UI, branding, bilingual interface, guided outing and native Agora voice entry. Shared browser Stage and participant video use Android Chrome. |

## Planning checks

- **Venues:** OpenStreetMap/Overpass cafe and restaurant listings with source links and available dietary metadata. Missing prices and seating details remain unknown.
- **Reservation policy:** listed policy, opening hours and contacts. This does not establish live table availability or reserve a slot.
- **Weather:** Open-Meteo forecasts for the selected three-hour window within the next seven days.
- **Travel:** OSRM driving estimates from a named meeting town centre. Live traffic, parking and walking are excluded.

Results show their source, check time and missing details. Context changes reset agreement. Each member controls their own vote; the host can confirm only unanimous support of the current plan. Confirmation records the plan and consent. It does not book, pay or write a calendar event.

## Verification and demonstration

The frontend suite covers media lifecycle, captions, bilingual preference capture and the guided workflow. Backend tests cover scoped access, room cleanup, provider handling, votes and rejection of stale confirmation. Run `npm run verify` in `mobile` and `python -m pytest -q -p no:cacheprovider` in `server` after installing the documented dependencies.

The six-minute [creator-recorded video](https://youtu.be/WUYoZa39Y3s) shows the current UI, a single-participant live Agora session, captions and a weather request. The product-story cards contain real app captures from a microphone-free shared Stage with backend member votes and provider results. Provider values are dated examples. The cast illustrates the group; the cards are not a recording of a group call.

Physical Hindi playback, speech-to-card capture and two-device camera playback remain separate device checks. iOS and production hosting have not been established by the Android build or browser demo. Rooms are ephemeral, last approximately 15 minutes and require one backend worker.

[Architecture](architecture.md) · [Device setup](live-demo-guide.md) · [Smart Stage guide](live-smart-stage.md)
