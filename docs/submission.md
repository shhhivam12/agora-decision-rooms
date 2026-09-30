# RoundTable AI — Agora Voice AI Hackathon 2026

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

React Native and TypeScript power the client, with a Vite evaluator preview and FastAPI/Python backend. TypeScript, 17 Jest tests and the production web build pass; two backend SDK/configuration tests pass. GitHub Actions produced a standalone ARM64 Android build with the native voice entry included.

Agora's official React Native Conversational AI recipe supplies the reused SDK foundation. Original hackathon work includes the social experience, Smart Stage, budget/rain/time scenarios, voting and consent interaction, branding, facilitation prompt and reachable native voice flow.

The first use case is friends planning an outing. The decision pattern can extend to shared purchases, household choices and team planning: everyone is heard, trade-offs stay visible, and actions wait for approval.

### Judge resources

Try the product: https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/

Watch the narrated demo: https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/video.html

Project presentation: https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/roundtable-ai-project-presentation.pdf

Download the Android app, source package and media: https://github.com/shhhivam12/roundtable-ai-hackathon/releases/tag/hackathon-2026

Built by **Shivam Mahendru** for the **Agora Voice AI Hackathon 2026**.
