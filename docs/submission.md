# Agora Decision Rooms

> Talk together. Decide together.

## Project description

Agora Decision Rooms gives a group one place to talk, compare and agree. Kabir, the AI facilitator, listens to the room while a shared Smart Stage keeps everyone's needs and the agent's work visible. The first journey is friends planning an outing: different budgets, food preferences and time windows become one plan everyone supports.

### The journey

1. Start a room and share the code with up to four people.
2. Speak in English, Hindi or Hinglish. Finalized member turns can update budget, diet and indoor preferences; typed editing is available too.
3. Watch the Stage discover real venues, read listed reservation policies and hours, check the weather and estimate the drive.
4. Compare source-linked options and update the meeting details when the group changes its mind.
5. Each member votes Support or Needs changes on their own device.
6. The host confirms only when all current members support the same plan. The outcome records the shared plan, votes and approval.

### The Smart Stage

Plan, Checks, Options and Decision put the workflow beside the conversation. OpenStreetMap/Overpass supplies real cafe and restaurant listings and available venue metadata. Open-Meteo checks rain probability and temperature for the selected three-hour window. OSRM estimates driving time and distance from a named town centre.

Checks show sources, timestamps, missing details and errors. Missing context triggers a follow-up; bounded retries and clearly dated cached results help recovery. Results can be sent into the active Agora session so Kabir can discuss the actual evidence. Prices, indoor seating and exact reservation slots remain unknown when the source does not provide them.

Votes belong to authenticated members. A changed venue, brief or roster resets agreement, and stale confirmations are rejected. The app confirms a plan; it does not book a table, make a payment or write a calendar event.

### Agora at the core

Agora RTC carries group voice, assistant audio and optional participant video in the browser. RTM carries captions, assistant state and errors. The Agent Client Toolkit coordinates the conversation lifecycle. Agora Conversational AI orchestrates Deepgram speech recognition, OpenAI reasoning and MiniMax speech synthesis, with voice activity detection and interruption configured.

FastAPI issues scoped tokens, starts one facilitator per room, owns the shared Stage and cleans up ephemeral rooms. Credentials stay on the server. Kabir's browser avatar uses native SVG/CSS gestures and an audio-reactive mouth. English and Hindi interfaces accompany English, Hindi and Hinglish assistant modes.

### Try it

The current GitHub Pages preview demonstrates the new UI and guided offline outing. Full shared voice rooms, real planning checks and member votes require the backend. The microphone-free entry offers the real shared Stage through typing and buttons without starting an Agora call.

The current Android test APK includes the refreshed native UI, Kabir artwork, guided outing and native Agora voice entry. Shared browser Stage and participant video use Android Chrome with the local backend. The device guide explains both paths.

### Original work and evidence

React Native, TypeScript, React Native Web/Vite and FastAPI power the product. Original work includes the room UI, recurring cast, shared lifecycle, Smart Stage, real provider adapters, bilingual experience and member-controlled consent. Agora's official React Native Conversational AI recipe supplies the reused native SDK foundation.

The new gallery contains ten designed cards with intact screenshots captured from the current app. Real provider results, three actual member votes and host confirmation were exercised against the backend. It is a microphone-free capture, not a recording of a group call. Physical Hindi audibility, speech-to-card capture and two-device video remain separate rehearsal checks. See the repository's claim evidence for details.

### Resources

- Source: https://github.com/shhhivam12/roundtable-ai-hackathon
- Current UI preview: https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/
- Android test build: https://github.com/shhhivam12/roundtable-ai-hackathon/releases/latest
- Product story: https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/decision-rooms-product-story.pdf
- Existing narrated demo: https://youtu.be/Ysq3IAfMn4Q

The existing video remains the earlier guided version; a new recording will be added later.

Built by Shivam Mahendru for the Agora Voice AI Hackathon 2026.
