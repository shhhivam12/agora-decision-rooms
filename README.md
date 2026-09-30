# RoundTable AI

> Talk together. Decide together. Get it done.

**Evaluator links:** [Try the app](https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/) · [Watch the narrated demo](https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/video.html) · [Project presentation](https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/roundtable-ai-project-presentation.pdf)

This public repository contains the sanitized hackathon snapshot. Server credentials and generated dependency folders are excluded. The included Android debug signing key is only for test builds.

## Judge quick start

RoundTable AI demonstrates a complete **guided group decision journey**: a shared brief, budget-aware comparison, three participant votes, host approval, and a local receipt. The AI serves the room while application state owns the decision.

- **Try it:** `cd mobile`, `npm ci`, `npm run web`; open `http://127.0.0.1:5173`.
- **Golden path:** Create an outing room → Create room & invite → Let RoundTable work → vote as each demo participant → review → approve → receipt.
- **Native Agora voice:** Android → Me → Open Agora voice → backend URL → Prepare voice session → Connect Agora voice. An enabled Agora project and running FastAPI backend are required.
- **Submission:** [form answers and evaluation guide](docs/submission.md), [claim evidence](docs/claim-evidence.md), [Smart Stage](docs/smart-stage.md).

The guided outing uses labelled fixture data. The native RTC/RTM voice entry and managed Agora agent backend are wired in source; live account/device validation is pending. Group synchronization, live venue search, video capture, and external calendar writes are not claimed as complete.

RoundTable AI is a mobile-first shared voice agent that helps a group turn a live conversation into a consented, verifiable action.

Instead of serving one user, the AI serves the room. It listens for each participant's constraints, makes trade-offs visible, proposes comparable options, records the group's decision, requests the right approvals, and executes only the approved action.

## Hackathon scope

The prototype is built for the [Agora Voice AI Hackathon](https://www.commudle.com/communities/ai-mobile-coders/hackathons/voice-ai-hackathon). The event requires a mobile or mobile-first application with Agora Conversational AI as a meaningful part of the real-time voice experience.

The primary demo is one complete group-outing journey:

1. A host creates a room and invites participants.
2. Participants state preferences and constraints by voice.
3. The app displays a shared constraint board as the conversation evolves.
4. The AI presents three comparable options and explains the trade-offs.
5. Participants rank or approve the options from their phones.
6. The deterministic decision engine selects the result using the room's rule.
7. The app asks for final approval before taking an external action.
8. The backend creates a calendar event and returns a verifiable receipt.

The demo should prove one reusable engine rather than several disconnected assistants.

## Why it is different

Most voice assistants optimize for one person. RoundTable AI models a group:

- who is participating;
- which constraints are public or private;
- where preferences conflict;
- which decision rule applies;
- who is affected by an action;
- who must approve it;
- whether execution succeeded.

The AI may summarize, compare, and explain. Deterministic application code owns votes, permissions, approval thresholds, execution, and receipts.

## Recommended implementation

- **Mobile:** bare React Native with TypeScript, built from Agora's official React Native Conversational AI recipe
- **Real-time voice:** Agora RTC, RTM, and Agent Client Toolkit
- **Agent backend:** Python and FastAPI using Agora's managed voice pipeline first
- **Room state:** Supabase Postgres with Realtime for durable room, vote, approval, and action state
- **Decision engine:** typed Python domain logic with explicit policies and audit events
- **First live integrations:** venue search behind a provider adapter and Google Calendar for the final action
- **Testing:** Jest for the mobile client, Pytest for backend/domain behavior, and a scripted deterministic demo mode

React Native is the speed-oriented choice because it gives one TypeScript UI codebase for Android and iOS and Agora now provides an official bare React Native voice-agent recipe. The hackathon demo should be tested and shipped on Android first. The code can remain iOS-ready, but an iOS build still requires access to macOS/Xcode and should not be allowed to block the demo.

## Repository map

```text
docs/
  architecture.md       System boundaries, data flow, and safety model
  build-plan.md         Date-free implementation plan and acceptance gates
  demo-script.md        The judge-facing golden path
  hackathon-brief.md     Verified event constraints and sources
  product-brief.md       Product definition, scope, and non-goals
```

```text
mobile/                  React Native application and deterministic outing demo
server/                  Official FastAPI Agora agent foundation
packages/domain/         Future shared schemas and deterministic decision rules
```

## Product status

The first mobile vertical slice is implemented under `mobile/`. It includes a complete five-tab social shell, branded Home/Rooms/Create/Friends/Profile pages, an interactive Group Outing Room, shared Central Stage, agent activity, constraints, option comparison, voting, approval, and a verified demo receipt. Android and iOS launcher assets use the selected RoundTable v3 icon; in-product identity uses the v4 lockup.

The group outing uses deterministic demo data. The Android voice screen connects the Agora RTC, RTM, and Agent Client Toolkit session implementation to the product. The backend prompt facilitates group outing constraints. Live account and device verification is pending; the group stage is not driven by a live Agora transcript yet.

## Run the current prototype

Fast laptop browser preview:

```powershell
cd mobile
npm ci
npm run web
```

Then open `http://127.0.0.1:5173`. For native Android testing, start Metro with `npm start` and run `npm run android` in another terminal after configuring Android Studio. See [`mobile/README.md`](mobile/README.md) for the exact paths and current limitations.

## Working-name note

RoundTable AI is a strong descriptive working name, but similar names are already in use. Keep it for the hackathon unless branding becomes a judging or publication concern; perform a proper naming and trademark check before treating it as a production brand.
