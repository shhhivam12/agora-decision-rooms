# Build plan

This plan is ordered by dependency and demonstration risk. It intentionally contains no calendar estimates.

## Gate 1: prove the voice path

### Build

- Import the official bare React Native recipe into `mobile/` and its FastAPI service into `server/`.
- Rename and brand the starter without changing the proven session lifecycle.
- Configure Android local development and an HTTPS-reachable backend.
- Render live user and agent transcript rows, connection state, mute, interrupt, and end controls.

### Exit criteria

- A physical Android device can start and end a real Agora Conversational AI session.
- The user and agent can interrupt each other.
- Agent audio is audible and transcripts arrive with no secrets in the client bundle.
- Reconnect and microphone-denied states are visible rather than silent.

## Gate 2: make it a real room

### Build

- Add room creation and invite-code join.
- Assign a stable application participant ID and unique Agora UID to every device.
- Show participant presence, speaking state, and attributed transcript turns.
- Update the agent's subscribed remote UID set as participants join or leave.

### Exit criteria

- At least two phones can join the same room and hear one another and the agent.
- The UI distinguishes each participant and the agent.
- Join, leave, and rejoin do not corrupt room state.

## Gate 3: turn speech into inspectable shared state

### Build

- Define typed schemas for budget, availability, location, food, activity, and accessibility constraints.
- Let the agent emit proposed constraint events rather than directly mutating final state.
- Display attributed constraint cards with confidence and correction controls.
- Add a visible unresolved-conflict state.

### Exit criteria

- The golden-path utterances create the expected constraint cards.
- A participant can correct a wrong extraction.
- Unsupported or ambiguous values are marked for clarification.
- Tests prove that invalid model output cannot enter room state.

## Gate 4: compare real options

### Build

- Add a venue-provider interface and deterministic fixture implementation.
- Add one live venue search provider behind the same interface.
- Normalize results into three option cards with the same comparison fields.
- Ask the agent to explain trade-offs using only normalized option data.

### Exit criteria

- Every displayed claim traces to a provider field or is labelled as an estimate.
- The same room can switch between live and fixture providers without UI changes.
- Provider failure leaves the voice room functional and clearly reports degraded mode.

## Gate 5: decide without delegating governance to the model

### Build

- Implement ranked choice or simple majority as deterministic code; use one rule in the demo.
- Freeze an option-set version before accepting votes.
- Show who has voted without revealing a private ballot value if secret voting is enabled.
- Render the winning option, rule, tally, and unresolved tie state.

### Exit criteria

- Unit tests cover win, tie, changed option set, duplicate vote, late join, and participant leave.
- The LLM cannot change a tally or bypass the selected rule.
- The demo has a deliberate conflict that the vote visibly resolves.

## Gate 6: approve, execute, and verify

### Build

- Create a pending Google Calendar action from the winning option.
- Display the exact event details and required approvers.
- Require explicit approval before calling the adapter.
- Execute with an idempotency key and persist a sanitized provider receipt.
- Render success, failure, retry, and uncertain states.

### Exit criteria

- Repeated taps cannot create duplicate events.
- A successful action links to or identifies the created calendar event.
- A failed action is never narrated as completed.
- The room reaches `verified` only after provider-confirmed success.

## Gate 7: make the mobile demo memorable

### Build

- Create a polished room screen with a strong call state and minimal navigation.
- Animate constraint, option, voting, approval, and receipt transitions.
- Use haptics for vote confirmation and verified completion.
- Add a deterministic seed/reset control accessible only in demo mode.
- Prepare a local-network and deployed-backend runbook.

### Exit criteria

- The full golden path works repeatedly from a clean room.
- A fallback path exists for venue search while Agora voice and calendar execution remain live.
- The app clearly labels any synthetic data.
- No screen requires typing during the primary demo except joining by code if deep linking is unavailable.

## Gate 8: submission readiness

### Build

- Document setup, environment variables, architecture, limitations, and significant reused starter code.
- Add unit, type, backend, and Android build checks to CI.
- Record a concise demo that shows the user problem, live multi-user voice, conflict, vote, approval, action, and receipt.
- Capture a backup screen recording from a verified build.

### Exit criteria

- A new developer can follow the README without receiving secrets.
- The repository identifies live, simulated, and deferred capabilities accurately.
- The submitted APK and repository commit correspond to the recorded demo.

## Explicitly deferred

- payment execution;
- travel booking;
- video calling unless it improves the core interaction after voice is stable;
- private-constraint cryptographic isolation;
- study, debate, and project-planning templates;
- iOS release packaging if macOS build access is unavailable;
- an integration marketplace or generic MCP catalog.

