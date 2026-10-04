# Agora Decision Rooms: live demo video journey

Updated 4 October 2026. The main demo now stays in one live room: conversation → captured preferences → public-source checks → actual member votes → host-confirmed plan. Use the fixed **Room + Stage / Captions / Call view** navigation. Rooms open with participant tiles and the animated Kabir assistant above the Stage on both phones and laptops; Call view focuses on people and the assistant. Captions shows the live conversation, and **Plan / Checks / Options / Decision** stays inside Stage. The guided sample flow is optional, clearly labeled B-roll.

## The story

**Different people. Different needs. One plan they can agree on.**

Show the laptop and Android as two real participants. One person has a ₹700 budget; the other needs vegetarian food and prefers an indoor venue. The assistant checks useful details for the group instead of merely suggesting generic ideas. Both people see the same Stage and each votes on their own device.

## Three-minute recording sequence

| Time | Show | Narration or purpose |
| --- | --- | --- |
| 0:00–0:10 | Logo and recurring character artwork | “Planning with friends means balancing different budgets, tastes and schedules.” |
| 0:10–0:35 | Home → Try live voice with your people; laptop starts, Android joins | Establish the two actual devices and one shared room code. Enable cameras if the physical video check passes; show Room + Stage and briefly switch to Call view. |
| 0:35–0:55 | Stage → Plan: host sets or says the outing city, meeting town, date and time | Explain where the checks are for. Keep location broad and public. |
| 0:55–1:20 | One English preference and one Hindi preference; their cards update | Laptop: “My budget is seven hundred rupees.” Phone: “मुझे शाकाहारी खाना चाहिए, अंदर बैठना पसंद है।” Show Kabir thinking and speaking with the actual reply, then briefly open Captions and show each preference card on both devices. |
| 1:20–1:45 | “Find restaurants” → Stage → Options → propose a venue | Keep the source link and “Price and indoor seating unverified” visible. Venue listings are real; suitability still needs confirmation. |
| 1:45–2:15 | Ask about reservations, rain and travel | Show source-backed results and preserve the actual assistant's spoken summary. Reservation policy is not a guaranteed table; the driving estimate excludes traffic. |
| 2:15–2:40 | Stage → Decision: laptop supports the plan, confirmation stays disabled; Android votes | Prove that these are the two participants' own votes. Do not simulate votes in this segment. |
| 2:40–2:55 | Host confirms; show shared plan ID and no-booking status | “Everyone has a voice, and everyone can see why this plan works.” Availability and prices still need confirmation with the venue. |
| 2:55–3:00 | Logo and closing | “Less back-and-forth. A shared decision.” |

If provider latency varies, trim the waiting time with a visible cut while preserving the real result and source. Do not substitute generated numbers, fixtures or a predetermined voiceover for the actual lookup.

## Prompts to rehearse

1. Laptop: “My budget is seven hundred rupees.”
2. Android: “मुझे शाकाहारी खाना चाहिए, अंदर बैठना पसंद है।”
3. Laptop: “Find restaurants for our group.”
4. Propose one returned venue on the Stage.
5. Android: “Is reservation available?” The result should explain the listed policy or say it is not listed, with exact table availability unverified.
6. Laptop: “Will it rain?” Show the forecast date/window and source.
7. Android: “कितना समय लगेगा?” Show the named town-centre origin and estimated drive.
8. Each person taps Support this plan; the host taps Confirm group plan.

The preference parser covers budgets, vegetarian needs, indoor/outdoor preferences and home-by/time-window notes. People can correct the cards under **Plan → Edit my preferences**. **Checks → Type a request** is available when speech isn't recognized or synced. The agent understands broader conversation, but the Stage does not claim unrestricted natural-language scheduling or autonomous reservations.

For a short recovery demonstration, start without a city and ask “क्या कल बारिश होगी?” Show the pending weather request, then say “हाँ येदिल्ली शाद्रा.” The host's city is captured and the same check retries for tomorrow. If recognition fails, enter those words through **Type a request**, or use **Fix meeting details**. Provider errors get one bounded retry; any older result is explicitly labeled. Rehearse the actual microphone path before recording; the automated recovery proof replays finalized utterances through the API.

## Judge journey

A judge can start a voice room alone or join by code. The same setup screen also offers **Open shared Stage without microphone**: real typed planning checks and actual votes, without RTC capture or cloud voice. For two-device testing keep the USB localhost forwarding active. A public judge link would need the backend and HTTPS hosting; this change remains local.

## What is working and what still needs the physical rehearsal

The shared Stage, public read providers and actual member votes are implemented. The verification script checks provider results, two authenticated member views, early-confirmation rejection and the final no-booking plan. Unit tests separately cover permission/media cleanup, final-turn forwarding, retries, provider failure, vote ownership and stale results. See [claim evidence](claim-evidence.md) and [the Stage guide](live-smart-stage.md).

The user previously confirmed live voice on the device pair. Rehearse final speech-to-card updates, audible tool-result replies in both languages and remote video on the actual laptop/Android before recording. Cloud acceptance of a think request alone does not prove audible playback.

## Optional B-roll

Use the home artwork, neutral logo/loader and recurring Priya/Ayaan/Maya/Kabir personalities to show branding. The characters are not four autonomous AI agents. Existing Create crew/rule choices and Friends invitations remain UI previews. The guided outing offers sample budget, rain and early-departure scenarios with simulated votes; label any footage from it **GUIDED DEMO**. It is no longer necessary to switch into that flow to show shared live votes.

No calendar event, reservation, payment or persistent history is created by the live Stage. Exact booking slots need a booking provider; missing venue prices, indoor seating and dietary tags stay unverified.
