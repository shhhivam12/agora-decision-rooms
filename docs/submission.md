# RoundTable AI submission

Prepared on 30 September 2026 for the Agora Voice AI Hackathon.

## Approach

Lead with the group decision problem and show one complete mobile journey. Make the Agora RTC, RTM, Agent Client Toolkit and managed Conversational AI architecture easy to inspect. Present the working experience confidently and disclose live integration status in one clear paragraph.

The official Commudle FAQ accepts a mobile application or prototype, and evaluates innovation, mobile experience, meaningful real-time voice, execution, UX and impact. Meaningful live Agora usage remains the largest eligibility risk until account/device audio is verified.

Official event: https://www.commudle.com/communities/ai-mobile-coders/hackathons/voice-ai-hackathon

## Exact form fields

The deployed public frontend was inspected without account credentials. The authenticated team page remains unverified because browser automation fails to initialize. Target association: `HackathonTeam`, ID `8033`.

| Field | Prepared answer |
| --- | --- |
| `name` | RoundTable AI — Shared Voice Decisions with Agora |
| `build_type` | project |
| `description` | Use the polished description below |
| `link` | https://github.com/shhhivam12/roundtable-ai-hackathon |
| `live_app_link` | Leave empty until a public HTTPS preview is deployed and verified; never use localhost |
| `video_iframe` | Actual `<iframe ...></iframe>` embed markup from the hosted video; a plain URL fails validation |
| Images | Thumbnail, comparison, approval and receipt PNGs in `artifacts/submission` |
| Tags | Agora, Conversational AI, React Native, Voice AI, TypeScript, Android, FastAPI, Collaboration |
| Team | Preserve the registered association; do not add members or send invitations |
| CAPTCHA | Human completion if shown |
| Publish | Final action after links, playback and preview are checked |

Current frontend constraints: project name required, no URL in the name, maximum 100 characters; description minimum 300 characters; at least five tags; source link or live app link required; PNG/JPG/JPEG images under 3 MB each; video accepts iframe markup. Creation checks reCAPTCHA. Backend deadline/eligibility acceptance remains unverified.

## Polished project description

### RoundTable AI

**Talk together. Decide together. Get it done.**

RoundTable AI is a mobile decision room where an AI serves the whole group. Friends bring different budgets, food preferences and time constraints; a shared Smart Stage turns those needs into a visible brief, comparable options, a room vote, explicit approval and a traceable outcome.

### The problem

Group planning gets stuck in chat threads. One person repeats everyone's preferences, options are hard to compare, and agreement is easy to assume. Most voice assistants serve one person at a time. RoundTable makes the group's needs, trade-offs and consent visible in one mobile experience.

### The product

The app includes Home, Rooms, Create, Friends and Profile. Inside the Group Outing Room, participant tiles sit alongside the Smart Stage, with captions, hand raise, microphone controls, stage expansion and agent pause/resume.

The guided journey resolves a budget conflict. Ayaan wants an outing under ₹700 per person. RoundTable compares bowling at ₹760, painting at ₹890 and a games café at ₹620. The first two options are visibly excluded; the eligible option explains its ₹80 headroom. All three simulated participants vote, the host reviews the action, and approval leads to a local demo receipt. Rain and early-departure scenarios demonstrate how the same process handles a changed brief.

The AI suggests and explains; application state records votes, gates approval and exposes the outcome. Nothing important happens invisibly.

### Agora at the core

The native foundation uses **Agora RTC** for microphone publication and agent audio, **Agora RTM** for transcripts and agent state, and the **Agora Agent Client Toolkit** for the conversation lifecycle. Android exposes this session through **Me → Open Agora voice**, with a configurable backend URL and microphone permission handling.

FastAPI generates short-lived Agora tokens and starts/stops Conversational AI sessions. The configured pipeline combines Deepgram speech recognition, an OpenAI language model and MiniMax speech synthesis through Agora's managed orchestration. Voice activity detection, interruption settings, metrics and errors are enabled in source. The RoundTable facilitation prompt collects outing constraints and avoids inventing votes or actions. Credentials stay on the server.

### What this submission demonstrates

The video shows the complete guided mobile decision journey using actual app interactions. Participants, venue options, votes and calendar receipt are labelled demo data. The native Agora voice path is wired in source; live account and Android audio validation are pending. Multi-device shared state, real venue providers, video calls and external calendar writes are the next integrations.

### Technical execution and original work

React Native and TypeScript power the client, with a Vite evaluator preview and FastAPI/Python backend. TypeScript, 17 Jest tests and the production web build pass; two backend SDK/configuration tests pass. GitHub Actions supports a standalone ARM64 Android build.

Agora's official React Native Conversational AI recipe supplies the reused SDK foundation. Original hackathon work includes the social experience, Smart Stage, budget/rain/time scenarios, voting and consent interaction, branding, facilitation prompt and reachable native voice flow.

The first use case is friends planning an outing. The decision pattern can extend to shared purchases, household choices and team planning: everyone is heard, trade-offs stay visible, and actions wait for approval.

Built by **Shivam Mahendru** for the **Agora Voice AI Hackathon 2026**.

## Video metadata

**Title:** RoundTable AI | Shared Voice Decisions with Agora | Hackathon Demo

**Description:** RoundTable AI gives a group one shared decision room. Watch the mobile Smart Stage resolve a budget conflict, compare options, record simulated votes, request approval and produce a local receipt. Built with React Native and an Agora RTC/RTM/Agent Client Toolkit foundation plus a FastAPI Conversational AI backend. This video shows the guided product demo; native account/device validation and external providers remain pending. Built by Shivam Mahendru for the Agora Voice AI Hackathon 2026. Foundation: Agora's official React Native Conversational AI recipe. Narration is an AI-generated presentation voiceover.

**Visibility:** Unlisted with embedding enabled. Paste the platform's real embed markup in the iframe field.

## Upload files

- `artifacts/submission/roundtable-ai-demo-1080p.mp4`
- `artifacts/submission/roundtable-demo-captions.srt`
- `artifacts/submission/roundtable-ai-thumbnail.png`
- `artifacts/submission/roundtable-ai-project-presentation.pdf`
- `artifacts/submission/roundtable-ai-source.zip` (credentials and generated dependencies excluded)
- Latest Android APK from the submission branch; existing older APKs do not contain the current native voice wiring.

## Submission gates

1. Recover browser control or fill the form manually from this package.
2. Put the authorized Agora project configuration in `server/.env`; verify audible native voice and RTM transcripts.
3. Resolve repository visibility or give judges the sanitized source archive.
4. Host the MP4, paste its real iframe, and verify logged-out playback.
5. Review the team association, complete CAPTCHA if required, and publish before the round closes.

No form has been filled, uploaded or published at the time this document was prepared.
