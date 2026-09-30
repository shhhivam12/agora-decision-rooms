# Golden-path demo

## Setup

- The host and one guest join the same RoundTable room from separate phones.
- The room goal is: choose an evening outing and put it on everyone's calendar.
- The decision rule is simple majority for the prototype.
- The venue provider state is visible as `Live` or `Demo data`.

## Story

### Open the room

The host starts the Agora room. Presence indicators show both people and the RoundTable agent. The agent states the goal and asks for constraints.

### Create a useful disagreement

The host says they want a quiet vegetarian place near the city center and need to leave early. The guest says they prefer an activity, have a lower budget, and can only arrive later.

Constraint cards appear under the correct participants. The agent notices the time conflict and asks one focused clarification rather than restarting the interview.

### Compare

Three option cards appear with a consistent set of fields: estimated per-person cost, travel time, availability window, dietary fit, activity type, and source status.

The agent explains the most important trade-off in a short spoken response. A participant corrects one extracted preference to prove that shared state is inspectable, not hidden in a prompt.

### Decide

Both participants rank the options from their phones. The app freezes the option version, calculates the result in deterministic code, and shows the tally and decision rule.

### Approve

The winning option becomes a pending calendar action. Each affected participant sees the title, time, location, and attendees. The external write remains blocked until the required approvals are present.

### Execute and verify

After approval, the backend creates the calendar event once. The room displays a provider-confirmed receipt and transitions to `verified`. The agent summarizes the final choice and explicitly mentions that the calendar action succeeded.

## What the demo proves

- real multi-participant mobile voice;
- Agora Conversational AI is central to the interaction;
- live speech becomes visible and correctable shared state;
- disagreement is resolved by an explicit group rule;
- the LLM does not own votes or authorization;
- an approved external action produces a real receipt;
- the same room protocol can later power other scenarios.

## Failure-safe version

If venue search fails, switch to the labelled fixture provider and continue. Do not replace the Agora call, vote, approval, or calendar receipt with a prerecorded simulation. If calendar execution fails, show the failure honestly and use the prepared backup recording after explaining the observed provider error.

