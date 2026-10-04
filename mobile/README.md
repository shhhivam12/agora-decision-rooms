# Agora Decision Rooms mobile

This is the React Native client for the first Agora Decision Rooms experience: a social Group Outing Room with a shared Central Stage.

## What works now

- complete five-tab social shell: Home, Rooms, Create, Friends, and Profile;
- working navigation from room discovery through room configuration into the live experience;
- current charcoal/ivory/sage branding and Kabir character artwork;
- Decision Rooms launcher icons for Android and iOS plus a branded browser favicon;
- Group Outing Room with three visible participants;
- deterministic guided agent workflow;
- shared constraint cards;
- comparable outing options and voting;
- explicit calendar approval;
- visible execution state and demo receipt;
- visible “Powered by Agora” and hackathon creator attribution;
- Agora RTC, RTM, and Agent Client Toolkit foundation retained from the official recipe.

The guided outing uses sample venues, participants, votes and a local receipt. The separate browser room supports real shared Agora voice/captions, optional participant video, live public planning checks and authenticated member votes on an authoritative backend Stage. The app makes no booking, payment or external calendar write.

## Fastest option: test directly on your laptop

You do not need Android Studio for the current UI prototype.

Open PowerShell in the `mobile` folder and run:

```powershell
npm ci
npm run web
```

Open http://127.0.0.1:5173 in Chrome or Edge. The preview is displayed inside a phone-width frame. Use every tab in the bottom rail, or choose **Create an outing room** → configure the room → **Create room & invite** → **Let Decision Rooms work** to play the complete guided flow.

The browser can also use real Agora RTC audio and RTM captions with the backend running. From the repository root, run `scripts/start-local-demo.ps1` and `scripts/connect-android-demo.ps1` for the laptop + Android USB demo. See [the live demo guide](../docs/live-demo-guide.md). Native packaging, haptics and iOS behavior need their own device checks.

## Native Android testing

### No Android Studio: download the GitHub-built APK

1. Open the repository's **Actions** tab on GitHub.
2. Open the latest **Build Android APK** run.
3. Under **Artifacts**, download `agora-decision-rooms-android-apk`, or download the APK directly from the latest GitHub release.
4. Unzip it to get `agora-decision-rooms-android.apk`.
5. Transfer the APK to your Android phone and open it.
6. If Android asks, allow your file manager or browser to install this trusted APK, then disable that permission again after installation.

This is a standalone ARM64 test build: it includes the JavaScript bundle, so it opens without Metro or a laptop server. It uses the standard Android debug signing key and is suitable for testing and demos, not Play Store distribution. Almost every current Android phone is ARM64; an older 32-bit phone will need a separate build.

Version 1.1.0 (version code 2) includes the new Decision Rooms name, launcher/splash branding, Kabir artwork, bilingual UI, guided outing and native Agora voice entry. The package ID and test signing key stay stable for upgrade continuity.

For **native voice on your phone**, start the backend and connect the phone by USB with debugging enabled. Run `adb reverse tcp:8000 tcp:8000`, then open the APK's live voice entry and set its backend URL to `http://127.0.0.1:8000`. Prepare the session and connect, allowing microphone access when Android asks. Alternatively use a reachable HTTPS/LAN backend; `10.0.2.2` works only in the emulator.

The **shared live Stage, actual member votes and participant video** currently use the browser room. Open Android Chrome through [the laptop + phone guide](../docs/live-demo-guide.md) to test those features. The native APK's outing remains the guided sample; it does not provide the browser room's group-video/Stage flow.

### Android Studio emulator or connected phone

Requirements: Node 22.11 or newer and a configured React Native Android or iOS development environment.

```powershell
npm ci
npm start
```

In a second terminal:

```powershell
npm run android
```

An iOS build requires macOS, Xcode and CocoaPods.

## Verify

```bash
npm run typecheck
npm test -- --runInBand
npm run lint
npm run web:build
```

## Agora foundation

The source under `src/agora/`, `src/CallState.ts` and `src/BackendApi.ts` comes from Agora's official React Native Conversational AI recipe. The companion FastAPI service lives in `../server/`.

The browser now binds shared room state to the live Smart Stage with real planning checks and authenticated member votes. The deterministic guided outing remains a separate offline path.

## Adding credentials later

- Copy ../server/.env.example to ../server/.env and fill only the server-side credentials required by the integrations you enable.
- Point src/config.ts at the machine running the FastAPI service. 10.0.2.2 is correct only for the Android emulator; a physical phone needs the laptop's reachable LAN address or a deployed HTTPS backend.
- Keep secrets out of the React Native bundle and do not commit .env.
- The guided Profile setup badges refer to that sample flow. Real public venue checks are available on the browser room live Smart Stage; calendar writes remain unimplemented.
