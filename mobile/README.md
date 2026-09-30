# RoundTable AI mobile

This is the React Native client for the first RoundTable AI experience: a social Group Outing Room with a shared Central Stage.

## What works now

- complete five-tab social shell: Home, Rooms, Create, Friends, and Profile;
- working navigation from room discovery through room configuration into the live experience;
- branded UI using only the v3 app icon and v4 logo lockup;
- RoundTable launcher icons for Android and iOS plus a branded browser favicon;
- Group Outing Room with three visible participants;
- deterministic guided agent workflow;
- shared constraint cards;
- comparable outing options and voting;
- explicit calendar approval;
- visible execution state and demo receipt;
- visible “Powered by Agora” and hackathon creator attribution;
- Agora RTC, RTM, and Agent Client Toolkit foundation retained from the official recipe.

Search results, participants, voting and the calendar receipt are currently deterministic demo data. The UI labels this clearly. The app does not claim a live multi-user Agora room or calendar write yet.

## Fastest option: test directly on your laptop

You do not need Android Studio for the current UI prototype.

Open PowerShell in the `mobile` folder and run:

```powershell
npm ci
npm run web
```

Open http://127.0.0.1:5173 in Chrome or Edge. The preview is displayed inside a phone-width frame. Use every tab in the bottom rail, or choose **Create an outing room** → configure the room → **Create room & invite** → **Let RoundTable work** to play the complete guided flow.

This browser preview is for the visual experience, interactions, voting and Central Stage. It does not test native microphone permissions, Agora RTC/RTM audio, haptics, Android packaging or iOS behavior.

## Native Android testing

### No Android Studio: download the GitHub-built APK

1. Open the repository's **Actions** tab on GitHub.
2. Open the latest **Build Android APK** run.
3. Under **Artifacts**, download `roundtable-ai-android-apk`.
4. Unzip it to get `roundtable-ai-android.apk`.
5. Transfer the APK to your Android phone and open it.
6. If Android asks, allow your file manager or browser to install this trusted APK, then disable that permission again after installation.

This is a standalone ARM64 test build: it includes the JavaScript bundle, so it opens without Metro or a laptop server. It uses the standard Android debug signing key and is suitable for testing and demos, not Play Store distribution. Almost every current Android phone is ARM64; an older 32-bit phone will need a separate build.

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

The next integration step is to bind live Agora room state to the Central Stage without removing the deterministic demo path.

## Adding credentials later

- Copy ../server/.env.example to ../server/.env and fill only the server-side credentials required by the integrations you enable.
- Point src/config.ts at the machine running the FastAPI service. 10.0.2.2 is correct only for the Android emulator; a physical phone needs the laptop's reachable LAN address or a deployed HTTPS backend.
- Keep secrets out of the React Native bundle and do not commit .env.
- The Profile tab intentionally shows Venue search and Calendar as **Setup** until those provider adapters are connected.
