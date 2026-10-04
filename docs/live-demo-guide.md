# Agora Decision Rooms: live demo

The web app now has real Agora RTC audio and optional participant video, scrollable RTM captions, a shared room code, microphone controls and an explicit **Enable sound** button. The host starts one Conversational AI assistant that listens to everyone in that room. Up to four people can join. A room ends after 15 minutes, or when the host ends it; abandoned hosts are cleaned up after two minutes.

Use **English / हिंदी** at the top to change the interface. When creating a live room, choose **English**, **हिंदी** or **Both / Hinglish** for the assistant's replies. All three modes recognize both Hindi and English; mixed mode follows the speaker's language. Guests inherit the host's assistant language. Changing the interface does not rewrite spoken captions or change a running assistant's language; start a new room to change the assistant mode.

The **Live Smart Stage** now captures final speech preferences, performs real venue, reservation-policy/hours, weather and driving checks, and shares actual participant votes and host confirmation across devices. See [the Stage guide](live-smart-stage.md) for the exact controls and provider limits. Exact reservation slots are unverified; calendar writes and bookings are not performed. The guided outing flow remains a separate sample workflow.

## Start the local app

From PowerShell in the repository:

```powershell
.\scripts\start-local-demo.ps1
```

Open **http://localhost:5173** in Chrome on the laptop. Both the frontend and voice backend run locally; internet is required for Agora's audio and AI services. The backend uses the existing ignored `server/.env`; certificates and vendor keys never enter the frontend bundle.

To reinstall dependencies on a fresh machine:

```powershell
cd mobile
npm ci
cd ..\server
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..
```

Configure `server/.env` using `server/.env.example` and your Agora project. Do not paste its contents into a video, screenshot, repository or chat.

## One laptop and one Android phone

1. Connect the phone with a data-capable USB cable. Enable **Developer options → USB debugging**, then unlock the phone and accept the debugging prompt. Both devices need internet access.
2. Run:

   ```powershell
   .\scripts\connect-android-demo.ps1
   ```

   Google Platform Tools are already downloaded in this checkout's ignored `output/android-tools`. On a fresh checkout, add `-DownloadTools`. No Android Studio installation is needed for this browser demo.
3. On the phone, open Chrome at **http://localhost:5173**. The helper forwards the phone's local port to the laptop with `adb reverse tcp:5173 tcp:5173`. Keep the cable connected.
4. On the laptop, choose **Try live voice with your people**, select the assistant language, enter your name and select **Start live room**. Allow microphone access. Wait for the room code and live conversation.
5. On the phone, open the same voice screen, select **Join a room**, enter another name and the laptop's eight-character code. Allow microphone access.
6. Confirm both names show **Connected**. Use headphones, preferably on both devices. Take turns speaking and mute the device you are not speaking through if the devices are close together.
7. Speak on each device and confirm the other device hears you. Then ask the assistant a question and confirm its answer is audible on both devices and appears in both sets of captions. A connection badge alone does not prove audible playback.
8. Try **Mute**, **Unmute** and **Enable sound**. Have the phone leave: the laptop session should continue. Join again, then **End room** on the laptop: the phone should return to the setup screen within a few seconds.

## Video, bilingual speech and scrolling checks

In the live room, tap **Enable camera** on each device and allow the camera. Both people should see their own preview and the other participant's video in **See your people**. Video uses the same Agora channel as voice. Cameras begin off; switching them off restores the branded avatar. Camera permission denial leaves the audio call running. End/Leave closes camera and microphone capture, including camera setup that was still pending. Participant video ships in the web/browser room flow used on the laptop and Android Chrome. The refreshed native test APK retains its separate guided outing and native voice flow; see [APK setup](../mobile/README.md).

For Hindi mode say: **“मेरा बजट सात सौ रुपये है, मुझे शाकाहारी खाना चाहिए।”** Confirm the caption captures the constraint and the assistant replies in Hindi. For mixed mode, start a new room with **Both / Hinglish**: one person says “My budget is seven hundred rupees,” and the other says **“मुझे रात नौ बजे तक घर पहुँचना है।”** Confirm both participants hear the replies. Switch the interface between English and Hindi while reading captions; the actual spoken text should stay intact.

Keep talking until captions exceed the panel height. Scroll inside the caption panel to earlier turns: incoming captions must not pull you away. Use **Latest ↓** to resume following the newest captions. This scroll behavior also applies to the guided demo's conversation panel.

Automated verification covers media lifecycle, permission failures, caption following and language routing. Real cloud start/end checks succeeded for all three assistant language modes on 2026-10-04. Hearing Hindi speech and seeing remote video on the physical laptop/phone pair still require the above device test.

Agora requires a secure browser context for microphone capture: HTTPS or localhost/127.0.0.1. Opening a plain HTTP LAN IP on a phone usually prevents microphone access. This USB route keeps the browser on localhost without changing browser security settings. See [Agora's web quickstart](https://docs.agora.io/en/realtime-media/rtc/voice-quickstart/web), [Google's ADB documentation](https://developer.android.com/tools/adb) and [official Platform Tools](https://developer.android.com/tools/releases/platform-tools).

## A useful recording sequence

- Laptop: “I'm Shivam. I have 700 rupees for the evening, and I want food and one activity.”
- Phone: “I'm Priya. I need vegetarian food, an indoor option if it rains, and I need to be home by nine.”
- Laptop: “Summarize both people's needs and suggest one fair plan. Ask before deciding.”
- Set the city and meeting details on the live Stage. Show each person's captured budget/diet/setting card, then ask for restaurants. Propose a returned venue and ask “Is reservation available?”, “Will it rain?” and “How long to get there?”. Keep the source and unknowns visible.
- Vote on the laptop first: host confirmation remains disabled. Vote on Android, then confirm as host. Show the confirmed shared plan and its explicit no-booking status. The guided sample flow is optional B-roll, labeled as a guided demo.

Avoid recording permission prompts or private browser tabs. End the live room before restarting the backend or closing the recording.

## What judges can test on the web

A single judge can start a live room and speak with the assistant, or join an existing room by code. **Open shared Stage without microphone** offers real planning checks and votes through typing/buttons when the backend is online. The guided sample decision demo remains usable when the backend is offline.

For a public judge link, serve the production web build and backend from an HTTPS origin. A static-only site supports the guided demo; live voice also needs this backend online with the project's server-side Agora environment. The local URL works only on this laptop and the USB-connected phone. No public deployment was made for this change.

The repository includes a single-origin `Dockerfile`. It builds the web client and serves it from FastAPI alongside `/api/voice`; legacy native quickstart endpoints are disabled in that container. A hosting provider must supply HTTPS and inject `AGORA_APP_ID` / `AGORA_APP_CERTIFICATE` as server environment variables. Build with `docker build -t decision-rooms .`, then run with `docker run --env-file server/.env -p 8000:8000 decision-rooms`. Docker is not installed on the current laptop, so the container build itself has not been run here. The production web build and FastAPI static/API routing are checked separately.

Browser SDKs load only when live voice is selected. For a static-only judge preview, publish `mobile/dist-web` after `npm run web:build`; when `/api/health` is unavailable, visitors can select **Explore the guided decision demo**.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Voice service unavailable | Run `start-local-demo.ps1`; inspect `output/live-voice/backend.stderr.log`. Check that the Agora project is configured. |
| Microphone declined | Allow microphone access for localhost in Chrome's site settings, then retry. |
| No sound despite captions | Tap **Enable sound**, check browser/OS volume and output device, and use headphones. |
| Phone cannot open localhost | Reconnect the USB cable, accept debugging authorization and rerun `connect-android-demo.ps1`. |
| No phone detected | Try a data cable and USB file-transfer mode. If Windows still cannot see it, install your phone manufacturer's official USB driver. |
| Room ended or invalid code | Create a new room on the laptop and use its new code. |
| Assistant is silent after prolonged inactivity | End and start a fresh room; the Agora agent has a two-minute idle timeout. |
| Echo or assistant hears its own reply | Use headphones, keep one nearby microphone muted and take turns. |

## Repeatable verification

```powershell
cd mobile
npm run verify
cd ..\server
.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider
cd ..
server\.venv\Scripts\python.exe scripts\check-live-voice.py
```

The last command creates a real short-lived Agora assistant session and closes it in `finally`. It checks real service start/stop and shared identity configuration; it does not prove audible microphone playback on physical devices.
