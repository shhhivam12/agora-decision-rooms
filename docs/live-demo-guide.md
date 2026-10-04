# Run Agora Decision Rooms

The [public preview](https://shhhivam12.github.io/agora-decision-rooms/evaluator/) opens the current UI and guided outing. Shared voice rooms, public planning checks and member votes require the local FastAPI backend and an enabled Agora Conversational AI project.

## Laptop setup

Requirements: Node.js 22.11 or newer, Python and internet access. From the repository root:

```powershell
cd mobile
npm ci
cd ..\server
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt -r requirements-dev.txt
Copy-Item .env.example .env
cd ..
```

Fill `server/.env` with your server-side Agora credentials using the [backend guide](../server/README.md). Then start both services:

```powershell
.\scripts\start-local-demo.ps1
```

Open **http://localhost:5173**. Choose **Try live voice with your people**, select English, Hindi or Both/Hinglish and start a room. Another participant joins with the room code. Allow microphone access and use headphones. Cameras are optional.

For manual or non-Windows setup, run `npm run web` from `mobile` and `python src/server.py` from `server` in separate terminals.

## Android browser

Connect an Android phone by USB, enable USB debugging and accept the phone's debugging prompt. From the repository root:

```powershell
.\scripts\connect-android-demo.ps1 -DownloadTools
```

The helper uses installed ADB or downloads Google's official Platform Tools into ignored local output. Open **http://localhost:5173** in Android Chrome, choose **Join a room** and enter the laptop's code. Keep the cable connected. This forwards the phone's localhost to the laptop; microphone access needs HTTPS or localhost.

The room offers **Room + Stage**, **Captions** and **Call view**. Each member can speak, mute, enable their camera and vote. **Enable sound** recovers browser playback when an audio gesture is needed. Use **Latest** to return to incoming captions after reading earlier turns. The host's **End room** closes the shared session; a guest can leave independently.

Choose **Open shared Stage without microphone** for typed planning and votes without media capture. Choose the guided outing for an offline sample.

## Native Android APK

Download the [current ARM64 test APK](https://github.com/shhhivam12/agora-decision-rooms/releases/latest/download/agora-decision-rooms-android.apk). It runs without Metro and includes the native UI, guided outing and native Agora voice entry. To use native voice with a USB-connected phone, run `adb reverse tcp:8000 tcp:8000` and enter `http://127.0.0.1:8000` as the backend URL in the app. `10.0.2.2` is the emulator alias.

The shared Stage and group video use the browser room. See [mobile setup](../mobile/README.md) for native development and APK details.

## Hosting and troubleshooting

Serve the production client and FastAPI API from an HTTPS origin for public live rooms. The repository's `Dockerfile` prepares a single-origin deployment; server credentials must be injected through environment variables. Static GitHub Pages cannot run the backend. Use one worker because room state is in memory. The container recipe is provided without a verified production deployment.

| Issue | Action |
| --- | --- |
| Backend unavailable | Confirm the backend is running and `server/.env` is configured. The Windows helper writes local logs under ignored `output/live-voice/`. |
| No audible sound | Tap **Enable sound**, check the output device and volume, and use headphones. |
| Microphone declined | Allow microphone access for localhost in browser settings, then retry. |
| Phone cannot open localhost | Reconnect USB, accept debugging authorization and rerun the forwarding helper. |
| Invalid or ended room | Create a fresh room and share its new code. |
| Echo | Use headphones and mute one nearby microphone. |

[Architecture](architecture.md) · [Smart Stage](live-smart-stage.md) · [Features and scope](claim-evidence.md)
