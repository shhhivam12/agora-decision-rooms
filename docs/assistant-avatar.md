# Kabir in the live room

Rooms open in **Room + Stage**, with a compact people and Kabir row above the shared Stage. The same mobile layout is used on laptops, inside the app's existing centred 430px container; there is no separate desktop expansion. **Call view** expands the same participant and assistant tiles into two columns. **Captions** is a separate view in voice rooms. Changing views preserves camera playback, the Agora connection and unfinished Stage forms. Cameras remain opt-in; camera-off members show their branded avatar and name.

Kabir keeps the existing headphone-and-mug identity and the neutral charcoal, ivory and sage palette. The live avatar is inline SVG with small CSS gestures, rather than a downloaded video. Agora's assistant state selects listening, thinking or speaking. A 120 ms sampler reads only the received assistant audio track; the mouth opens with that track's volume and closes during silence. Local microphone volume and other participants do not animate Kabir's mouth. This is audio-reactive motion, not phoneme-level lip synchronization.

Speaking turns rotate among a welcome wave, an explaining gesture and an agreement gesture. Thinking shows a focused face, hand near the chin and three moving dots. Blocked audio pauses the avatar and retains the app's **Enable sound** recovery button. Microphone-free planning shows **Voice off**, with the thinking pose only while a real Stage check runs. Reduced-motion preferences stop gestures and keep the face still.

## Review locally

- App: [localhost:5173](http://localhost:5173/).
- Animation preview: [localhost:5173/assistant-preview.html](http://localhost:5173/assistant-preview.html). It clearly labels its sample volume signal; it is not a live call.
- Video exports: `mobile/assets/assistant-motion/`. Each is a four-second, 360 × 338, 20 fps loop without audio. WebM keeps transparency; MP4 has a neutral background for editing compatibility. `manifest.json` records exact sizes and alpha metadata.
- Montage: `output/assistant-motion/kabir-animation-preview.mp4` contains all five poses, 20 seconds total.
- Still assets: `kabir-think.svg`, the other pose SVGs, and `kabir-poster.webp`.

Production rooms do not download the video exports. The animation preview is also included in the web build. To regenerate exports, run `node scripts/export-assistant-motion.cjs`; set `DECISION_FFMPEG_DIR` if FFmpeg is installed elsewhere. The script renders the same `AssistantFigure.tsx` used by the app.

## Rehearse with the laptop and Android

1. Start a live room on laptop Chrome and join its code on Android Chrome using the existing USB localhost setup in [the device guide](live-demo-guide.md).
2. Turn on each camera. The default view should show both people and Kabir while Stage controls remain accessible.
3. Switch to **Call view**, then back to **Room + Stage**. Cameras and sound should continue without reconnecting.
4. Speak a request and watch Kabir think, then move his mouth with the audible reply. A pause in the audio should close his mouth. Successive replies vary the hand gesture.
5. Switch to **Captions** for the Hindi/English transcription, then return to the shared Stage.

Automated tests cover assistant-track selection, timer cleanup, state transitions, silence, turn gestures, stale callbacks, uninterrupted tile mounting and retained Stage edits. Browser checks cover two real backend members, desktop/phone layouts and actual video-export playback. The physical laptop/Android camera, audible reply and avatar synchronization still require the device rehearsal; browser preview motion is not evidence of a live microphone call.
