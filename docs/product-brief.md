# Product brief

## One-sentence definition

RoundTable AI is a shared voice agent that helps a group surface constraints, compare options, make an explicit decision, approve the consequences, and verify that the chosen action was completed.

## The problem

Group conversations often produce discussion but not completion. Preferences are scattered across speech and chat, quieter participants are missed, the same trade-offs are repeated, and someone still has to manually turn the final agreement into calendar events, tasks, bookings, or payment requests.

Single-user assistants do not solve the governance problem. A group needs a system that can answer:

- What is the shared goal?
- What does each participant need?
- Which constraints conflict?
- How will the group decide?
- Who is affected by the proposed action?
- Who must approve it?
- What proof shows that the action succeeded?

## Product promise

Every RoundTable room moves through a visible state machine:

`forming -> understanding -> comparing -> deciding -> approving -> executing -> verified`

The room never silently jumps from conversation to an external side effect.

## Hackathon wedge: group outing

The group-outing room is the only end-to-end scenario required for the first prototype.

### Input

- participant identity;
- budget ceiling;
- availability window;
- location or travel radius;
- food and activity preferences;
- accessibility or dietary constraints;
- room decision rule.

### Live experience

- voice activity and participant presence;
- attributed transcript;
- constraint cards that update as people speak;
- an unresolved-conflict indicator;
- three option cards with consistent comparison fields;
- participant ranking or approval controls;
- a final approval sheet;
- an execution receipt.

### Output

- selected outing plan;
- explanation of why it satisfied the decision rule;
- recorded votes and approvals;
- created calendar event;
- provider response identifier and action status.

## Product principles

### Voice is structurally necessary

The group negotiates naturally in a live Agora room. The agent listens to multiple participant UIDs, responds with low-latency speech, handles interruption, and keeps the shared UI synchronized with the conversation.

### The model advises; code governs

An LLM can extract candidate constraints, generate option explanations, and summarize disagreement. Typed deterministic logic validates constraints, counts votes, evaluates approval policy, performs tools, and records results.

### Consent precedes side effects

Research and drafting can be automatic. Calendar writes, reservations, payments, messages, and task creation require an explicit approval policy and an idempotency key.

### Completion must be observable

Success is a provider response and a receipt, not an assistant saying that something was done. Failed or partial actions remain visible and retryable.

### Private constraints are not public copy

The future platform may let a participant submit a private budget or accessibility need. The system may use it to eliminate unsuitable options without revealing the value to the room. This is a stretch goal, not a required prototype claim.

## Primary users

- friends coordinating an outing;
- student teams planning shared work;
- hackathon teams converting discussion into assignments;
- small groups making choices with real constraints.

## Non-goals for the prototype

- autonomous purchases or money movement;
- hotel or travel booking;
- a marketplace of many integrations;
- a general-purpose meeting assistant;
- production-grade identity, payments, or private-constraint isolation;
- six complete scenario templates;
- replacing human judgment with an LLM-generated decision.

## Platform path after the prototype

The reusable asset is the room protocol: goal, participants, constraints, options, decision rule, approvals, actions, and receipts. New templates should configure that protocol rather than introduce separate mini-products.

