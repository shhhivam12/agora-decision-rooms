# Next demo feature choices

The **Live Smart Stage** has been selected and implemented: final speech preferences, real public venue/reservation-policy/weather/travel reads, shared member votes and host confirmation. See [the shipped Stage guide](live-smart-stage.md). The implementation discussion below is historical; the other options remain proposals.

## Selected and shipped: turn the live conversation into a shared decision

**Demo moment:** Shivam says “₹700 each”; Priya says “Vegetarian, indoors, home by nine.” Their individual constraint cards appear on both devices. The assistant explains a conflict, updates the comparison and requests a vote. Each person votes from their own device. A result is shown only after their actual votes; the host reviews and approves the next action.

**Why this first:** It completes the product's promise and connects the strongest existing pieces. It makes the AI's reasoning visible, gives every participant a real vote and produces a clear beginning → conflict → decision → receipt story for the video.

**Implementation:** accept final speaker-attributed transcripts, extract structured constraints on the backend, store one authoritative room state, and broadcast updates using Agora Signaling or deliver authenticated snapshots. Add actual per-member votes and host approval. Define conflict handling, retries and late-join recovery. Keep sample venues clearly labeled until a real discovery integration is connected.

Agora supports [Signaling pub/sub](https://docs.agora.io/en/realtime-media/rtm/quickstart/web) for app state and [custom HTTPS tool calls](https://docs.agora.io/en/ai/build/tools/custom-tools) for agent-to-backend actions. For a fully local demo, our backend can process the finalized transcripts without a public tool callback. If Agora itself must call our endpoint, that tool requires a reachable HTTPS endpoint; localhost alone is insufficient.

## Other options

| Proposal | What the video shows | Added work / dependency |
| --- | --- | --- |
| **Show the menu, decide together** | A participant shares a menu image from their phone. AI extracts vegetarian choices and prices into the shared comparison, explains assumptions, and asks the group to confirm. | Explicit image capture/share, image-capable model or OCR, structured extraction and confirmation. Human video calling alone does not give the current assistant image understanding. Start with one submitted still image for predictable results. |
| **Live plan rescue** | Someone says “It's raining.” A real weather result appears; the assistant removes outdoor options and finds indoor choices within the agreed budget. | Weather and venue APIs, city/location input, sourced timestamps, API quota and missing-result handling. Venue availability/bookings need separate provider support. |
| **An approved plan becomes a real calendar event** | Actual votes → host approval → event appears in a connected calendar with time, place and attendees; the UI displays the returned event link. | Calendar OAuth and write scope, server-side tool, approval gate, timezone and duplicate-action prevention. Until connected, the existing receipt remains a local demo. |
| **One conversation, two caption languages** | One person speaks Hindi while another follows an English translation beside the original, and vice versa. | Translation of finalized, speaker-attributed captions with clear original/translation labels. Current bilingual recognition/replies do not automatically translate every caption. |
| **Tap or scan to join the table** | Android scans a QR code or taps a physical NFC card and opens the exact room, enters a name and joins. | Invitation URL and room expiry handling; QR code is simple. A standard NFC URL tag can open the link without Web NFC permission. On a USB local demo the link must use the forwarded localhost port; a public demo needs HTTPS. |

Weather/calendar actions can use [Agora custom tools](https://docs.agora.io/en/ai/build/tools/custom-tools) or a reachable [MCP server](https://docs.agora.io/en/ai/build/tools/mcp-tools). These provide the transport and orchestration; we still implement the actual integration and approval behavior.

For the strongest final hackathon story, choose the **live shared decision flow** first, then **menu-image comparison** for a visual twist or **real calendar handoff** for a verified action. Do not describe the proposed integrations as working before they are implemented and tested.
