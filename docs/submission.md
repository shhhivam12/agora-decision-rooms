# RoundTable AI submission

RoundTable AI

Talk together. Decide together. Get it done.

RoundTable AI is a mobile decision room where an AI serves the whole group. Friends bring different budgets, food preferences and time constraints; a shared Smart Stage turns those needs into a visible brief, comparable options, a room vote, explicit approval and a traceable outcome.

The problem

Group planning gets stuck in chat threads. One person repeats everyone's preferences, options are hard to compare, and agreement is easy to assume. Most voice assistants serve one person at a time. RoundTable makes the group's needs, trade-offs and consent visible in one mobile experience.

The product

The app includes Home, Rooms, Create, Friends and Profile. Inside the Group Outing Room, participant tiles sit alongside the Smart Stage, with captions, hand raise, microphone controls, stage expansion and agent pause/resume.

The guided journey resolves a budget conflict. Ayaan wants an outing under ₹700 per person. RoundTable compares bowling at ₹760, painting at ₹890 and a games café at ₹620. The first two options are visibly excluded; the eligible option explains its ₹80 headroom. All three simulated participants vote, the host reviews the action, and approval leads to a local demo receipt. Rain and early-departure scenarios demonstrate how the same process handles a changed brief.

The AI suggests and explains; application state records votes, gates approval and exposes the outcome. Nothing important happens invisibly.

How it works

1. Create the room: Set the outing goal and decision rule; participants share one visible workspace.

2. Collect constraints: The Smart Stage captures the ₹700 budget, vegetarian food preference and time window.

3. Compare options: Bowling at ₹760 and painting at ₹890 exceed the budget. The ₹620 games café stays eligible with ₹80 headroom.

4. Record the vote: Each of the three demo participants votes explicitly; the workflow waits for all three.

5. Review and approve: The host checks the plan, attendees and time before giving permission.

6. Show the receipt: The local demo receipt records the selected plan, votes and approval. Rain and early-departure scenarios rerun the same process with a changed brief.

Agora at the core

The native foundation uses Agora RTC for microphone publication and agent audio, Agora RTM for transcripts and agent state, and the Agora Agent Client Toolkit for the conversation lifecycle. Android exposes this session through Me → Open Agora voice, with a configurable backend URL and microphone permission handling.

FastAPI generates short-lived Agora tokens and starts/stops Conversational AI sessions. The configured pipeline combines Deepgram speech recognition, an OpenAI language model and MiniMax speech synthesis through Agora's managed orchestration. Voice activity detection, interruption settings, metrics and errors are enabled in source. The RoundTable facilitation prompt collects outing constraints and avoids inventing votes or actions. Credentials stay on the server.

What this submission demonstrates

The video shows the complete guided mobile decision journey using actual app interactions. Participants, venue options, votes and calendar receipt are labelled demo data. On 30 September 2026, the configured live Agora account successfully generated a short-lived token, started a Conversational AI agent and stopped it. Android microphone playback and live transcript reception still need a device test. The video also includes a clearly labelled fictional conversation with licensed stock portraits and scripted voices. Multi-device shared state, real venue providers, video calls and external calendar writes are the next integrations.

Technical execution and original work

React Native and TypeScript power the client, with a Vite evaluator preview and FastAPI/Python backend. TypeScript, 17 Jest tests and the production web build pass; two backend SDK/configuration tests pass. GitHub Actions produced a standalone ARM64 Android build with the native voice entry included.

Agora's official React Native Conversational AI recipe supplies the reused SDK foundation. Original hackathon work includes the social experience, Smart Stage, budget/rain/time scenarios, voting and consent interaction, branding, facilitation prompt and reachable native voice flow.

The first use case is friends planning an outing. The decision pattern can extend to shared purchases, household choices and team planning: everyone is heard, trade-offs stay visible, and actions wait for approval.

Judge resources

Try the product: https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/

Watch the narrated demo on YouTube: https://youtu.be/Ysq3IAfMn4Q

Project presentation: https://shhhivam12.github.io/roundtable-ai-hackathon/evaluator/roundtable-ai-project-presentation.pdf

Download the Android app, source package and media: https://github.com/shhhivam12/roundtable-ai-hackathon/releases/tag/hackathon-2026

Built by Shivam Mahendru for the Agora Voice AI Hackathon 2026.

## Submission assets

The repository contains 14 captured mobile screens, a product overview and an illustrative conversation frame. The demo is 3 minutes 14 seconds, with narration, captions and explicit Agora architecture. A standalone ARM64 APK and an 8-page presentation accompany it.

The live backend token and agent start/stop check passed on 30 September 2026. [Sanitized evidence](verification/agora-backend.json). Android audible playback remains unverified.
