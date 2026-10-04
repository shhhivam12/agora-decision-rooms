# Live Smart Stage

The browser room now has one authoritative Stage on the local backend. The laptop and Android Chrome share preferences, venue results, checks, a proposed venue, each participant's own vote and host confirmation. Nothing is booked or paid for. The existing guided outing remains a separate sample workflow.

## Four useful read actions

| Ask the assistant | What appears on every device | Source and limits |
| --- | --- | --- |
| “Find restaurants for our group” / “रेस्तरां खोजो” | Up to four real cafes/restaurants near the selected city centre, source links and listed vegetarian metadata | OpenStreetMap via Overpass. Missing prices, dietary information and indoor seating stay unverified. This is discovery, not a guaranteed budget fit. |
| “Is reservation available?” / “क्या बुकिंग होती है?” | Selected venue's listed reservation policy, opening-hours schedule, website and phone when provided | Individual OpenStreetMap listing. **Policy is not live table availability.** Exact date/time/party-size slots require a reservation-provider integration. No account/key is configured for one. |
| “Will it rain?” / “बारिश होगी?” | Rain probability and temperature for a three-hour window from the plan's chosen hour, local timezone and a weather backup suggestion | Open-Meteo forecast, next seven days. Forecasts are estimates, not a guarantee. |
| “How long to get there?” / “कितना समय लगेगा?” | Driving minutes and distance from the named meeting town centre to the proposed venue | OSRM road routing; excludes live traffic, parking and walking. It does not silently use a participant's private GPS location. |

Provider results include a check time and source link. English and Hindi result text is available. The backend caches public responses for up to three minutes, bounds requests and runs one venue lookup at a time. Venue discovery can try a second documented Overpass instance when a public server fails. Transient provider errors receive one automatic retry, within the overall 60-second limit. Rate-limit responses cause a provider cooldown. Missing city, date, meeting town or venue details leave a pending request that retries when those details are supplied. If a later read fails, a successful result from the same context within 15 minutes can appear as **Previous result · not a fresh check**, with its original timestamp. Errors stay visible; no sample venues replace failed real checks.

## Compact room navigation

The room code, **Room + Stage / Captions / Call view** navigation and call controls stay available outside the scrolling content. Rooms open with participants and the animated Kabir assistant visible above the Stage in the same mobile layout on phones and laptops. **Call view** expands the people and assistant tiles. Stage has **Plan / Checks / Options / Decision** views. Checks shows one selected result; **Type a request** opens the typed fallback. Plan holds meeting details and participant preferences, Options holds the shortlist, and Decision holds each member's vote and host confirmation. Captions keeps the bounded conversation scroller. Switching views keeps the voice session, published camera and unfinished Stage forms running. See [the avatar and layout guide](assistant-avatar.md).

## Try it locally

1. Open **http://localhost:5173 → Try live voice with your people**. Start a room and join its code on Android as described in [the device guide](live-demo-guide.md).
2. Host: open **Stage → Plan → Set meeting details**, or say the city and date. “क्या कल बारिश होगी?” captures tomorrow in India time; if the city is missing, “हाँ येदिल्ली शाद्रा” resolves to **Shahdara, Delhi** and automatically retries the original weather check. Common Hindi/English city spellings are normalized; other names can be entered with an explicit city phrase or a short answer to a missing-city question. Guest meeting suggestions require the host to **Apply suggested details**. You can always edit the city, meeting town, date and 24-hour time manually. If geocoding cannot resolve a locality, a city-centre fallback is explicitly disclosed. Routes begin at the named town centre; forecasts cover the next seven days.
3. Laptop: say “My budget is seven hundred rupees.” Phone: say “मुझे शाकाहारी खाना चाहिए, अंदर बैठना पसंद है।” Final user captions update that member's preference card on both devices. Budget, vegetarian needs and indoor/outdoor preferences use a small bilingual parser; home-by constraints are retained as a note. Other requests remain in captions. **Edit my preferences** is available to correct or add details.
4. Ask “Find restaurants.” In **Checks**, select the appropriate tool and **Run selected check**, or use **Type a request**. Review the shortlist under **Options** and **Propose this venue**. Then ask about reservations, rain and travel.
5. Under **Decision**, each participant chooses **Support this plan** or **Needs changes** on their own device. The host can **Confirm group plan** only when every current member supports the proposed venue. Changed details, venue results, proposal or roster reset consensus; stale votes are rejected by the server.
6. Show the confirmed plan ID, participant votes and **No booking has been made**. Use the contact/source link to follow up with the venue yourself.

For a judge who declines media access, choose **Open shared Stage without microphone** on the voice setup screen. This creates/joins a real backend room with typed requests, live public checks and actual shared votes. It does not start RTC capture or a cloud voice assistant. A judge can test alone, or use another browser/device as a second member. Rooms remain ephemeral and expire after 15 minutes; restarting the server clears them.

## Speech and the Agora assistant

Each browser uses ASR metadata `user_id` for speaker attribution, because the Agora client toolkit assigns user transcripts a fixed self placeholder. Only that browser member's finalized captions trigger Stage updates. Partial captions, agent speech and internal `STAGE_READ_RESULT` injections never trigger tools. Internal injected data is also hidden from participant captions. Backend turn IDs deduplicate retries. Authenticated room snapshots refresh roughly every 1.2 seconds; revisions prevent older responses from replacing newer state.

After a read check completes, the backend sends its factual result, source, timestamp, meeting details and member preferences to the running Agora session through `AgentSession.think`. The facilitator prompt must preserve uncertainty and treat source text as data. A voice-delivery failure does not remove the visible result. The final words and physical audio playback still need to be verified in the laptop/Android rehearsal.

This local bridge does not need a public callback or another LLM API key. Agora's direct [custom tool API](https://docs.agora.io/en/ai/build/tools/custom-tools) requires a reachable HTTPS endpoint. The app has not been deployed or exposed through a tunnel.

## Verification

Run the unit checks with `npm run verify` in `mobile`, and `server/.venv/Scripts/python.exe -m pytest -p no:cacheprovider` from `server` with the appropriate working directory. For actual APIs, from the repository root:

```powershell
server/.venv/Scripts/python.exe scripts/check-live-stage.py --city Bengaluru
# Also tests a short real Agora session and stops it afterward:
server/.venv/Scripts/python.exe scripts/check-live-stage.py --city Bengaluru --voice
# Replays the reported Hindi missing-city conversation through the real API:
server/.venv/Scripts/python.exe scripts/check-stage-recovery.py --voice
```

The scripts print public summaries, not credentials, and record results in `docs/verification/live-smart-stage-2026-10-04.json` and `docs/verification/stage-recovery-2026-10-04.json`. The recovery replay checked the actual Shahdara forecast for October 5, preserved the curfew note, matched two authenticated member views, and delivered the result to Agora. This is a finalized-utterance API replay, not a physical microphone test. Automated tests cover ASR-shaped speaker attribution, caption filtering, the Hindi follow-up, host review, stale context, explicit cached fallback, and repair-form navigation.

Provider references: [Open-Meteo](https://open-meteo.com/en/docs), [Open-Meteo geocoding](https://open-meteo.com/en/docs/geocoding-api), [OpenStreetMap reservation tags](https://wiki.openstreetmap.org/wiki/Key:reservation), [Overpass instances and usage](https://wiki.openstreetmap.org/wiki/Overpass_API), [OSRM API](https://project-osrm.org/docs/v5.24.0/api/).
