# Use the Smart Stage

The shared browser room puts Kabir's planning work beside the conversation. **Plan**, **Checks**, **Options** and **Decision** keep everyone's preferences, evidence and votes visible on each member's device. Start the backend using the [setup guide](live-demo-guide.md).

## From preferences to agreement

1. Start a room, share its code and join from another browser or phone. Choose **Open shared Stage without microphone** for a typed session.
2. In **Plan**, set the city, meeting town, date and time. Speak supported budget, vegetarian and indoor/outdoor preferences, or use **Edit my preferences**. Finalized turns update the speaking member's card; partial captions do not create preferences or votes.
3. Ask Kabir to find restaurants, or open **Checks** and run the selected check. Missing details trigger a follow-up. Typed requests are available.
4. Compare the shortlist under **Options** and choose **Propose this venue**. Check listed reservation policy, weather and driving time.
5. Each participant chooses **Support this plan** or **Needs changes** from their own device. Changed details, venue or roster reset agreement. The host confirms only when every current member supports the current revision.
6. The shared outcome records the chosen plan, member votes and host approval. **No booking has been made**; use the source or contact link to follow up with the venue.

## Four planning checks

| Request | Result | Limits |
| --- | --- | --- |
| Find restaurants | Up to four OpenStreetMap/Overpass cafe or restaurant listings near the selected city centre | Prices, seating and missing dietary details remain unknown. |
| Is reservation available? | Listed reservation policy, opening hours, website and phone when provided | Policy is not live table availability. No reservation is made. |
| Will it rain? | Open-Meteo rain probability and temperature for the chosen three-hour window | Forecasts cover the next seven days and are estimates. |
| How long to get there? | OSRM driving time and distance from the named meeting town centre | Excludes live traffic, parking, walking and private GPS location. |

Results carry source links, check times and uncertainty. Public responses have a short cache; provider failures receive bounded retries. A previous result may appear with its original timestamp and an explicit stale-result label. Failed checks never silently become sample venue data.

## Conversation and consent

Kabir receives completed check results, sources and meeting context through the Agora session so it can explain the evidence. If voice delivery fails, the Stage result stays visible. Switching between Stage, captions and Call view keeps the room running.

The backend owns shared preferences, provider requests, member votes and confirmation. Captions and assistant suggestions cannot fabricate a person's vote or approve a plan. The recurring illustrated cast is the product's visual identity; one AI facilitator serves the live room.

The guided outing is a separate offline example with sample venues and simulated votes. Neither path makes a booking, payment or calendar write.

[Architecture](architecture.md) · [Features and scope](claim-evidence.md)
