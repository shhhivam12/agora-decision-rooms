# Call room and Smart Stage

The call room keeps participant tiles and call controls visible while a shared workspace presents the agent's current operation. Its stage moves through brief, search, compare, vote, approval, execution and receipt. People can pause automatic progression or expand the workspace. Changing the scenario cancels pending progression and resets votes.

## Outing scenarios implemented

- Budget squeeze: a participant lowers the limit to ₹700; the comparison excludes two options and recommends the ₹620 games café.
- Rain changes plans: the stage highlights the indoor requirement and compares three indoor alternatives.
- Leave early: the proposed time window shifts to 6:30–8 PM and shorter travel becomes the recommendation reason.

## Future stage operations

- Expenses: itemize a receipt, assign shared and personal costs, flag disputed items, recalculate balances, then request approval before creating settlement requests.
- Project planning: extract tasks from conversation, show owners and dependencies, flag overload, compare scope cuts, and approve a task-board update.
- Outing extensions: visualize travel times, correct individual constraints, compare venue availability, and ask affected participants to approve a calendar write.

## Current boundary

This is an interactive call-interface simulation. Camera-off tiles are placeholders; microphone and hand controls update local UI state. Captions are fixtures. The agent progression, venue options, participant votes and calendar receipt are simulated and labelled in the room. Nothing is transmitted or booked.

Live integration requires binding Agora participant tracks and microphone controls, receiving typed agent/tool events, synchronizing room state and votes across devices, and generating receipts from actual provider responses. Adding API keys alone does not implement those connections. The legacy CallScreen and useCallStore remain separate from this room.
