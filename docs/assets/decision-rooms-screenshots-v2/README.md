# Agora Decision Rooms — screenshot story v2

**Ten new story assets with actual app screenshots**, captured and rendered on 4 October 2026. Kabir explains the group journey using his current in-app SVG avatar. The approved logo, charcoal/ivory/sage palette and real Segoe UI typography are retained.

[View all ten](contact-sheet.jpg) · [Open the gallery](index.html) · [Design specification](design-spec.json) · [Capture provenance](source-screens/capture-manifest.json)

## Ready to use

- Upload the ten numbered **JPGs in `portal-jpg/`** to the hackathon gallery, in filename order.
- Use **`github-webp/`** for lightweight GitHub embeds. PNG masters are in this directory.
- Individual assets are **1920 × 1280**, landscape **3:2**.
- All screens come from the running current app. Original source images are retained unchanged in `source-screens/`.
- Card 06 enlarges details from three screenshots. The other cards display full viewport captures inside device frames, preserving screenshot proportions.
- Every card also has a standalone `.html` source for editing copy, layout and typography without redrawing the UI.

## The story

1. **Your people. One shared plan.** — Kabir introduces Agora Decision Rooms beside the actual current home screen.

   ![Kabir introduces Agora Decision Rooms beside the actual current home screen.](github-webp/01-one-room-one-plan.webp)

2. **Start a room. Bring the crew.** — Real room setup and join-by-code screens beside Kabir's explanation.

   ![Real room setup and join-by-code screens beside Kabir's explanation.](github-webp/02-start-and-join.webp)

3. **Every preference has a place.** — The actual Smart Stage Plan view shows the three friends' individual preferences.

   ![The actual Smart Stage Plan view shows the three friends' individual preferences.](github-webp/03-shared-preferences.webp)

4. **This is the Smart Stage.** — The actual shared Smart Stage with its four planning checks and four workflow tabs.

   ![The actual shared Smart Stage with its four planning checks and four workflow tabs.](github-webp/04-smart-stage.webp)

5. **Real places. Clear trade-offs.** — Actual public venue results show vegetarian metadata, source links and unverified prices.

   ![Actual public venue results show vegetarian metadata, source links and unverified prices.](github-webp/05-real-venue-options.webp)

6. **Rain? Route? Venue details?** — Three enlarged details from real app screenshots show weather, driving and venue-policy results.

   ![Three enlarged details from real app screenshots show weather, driving and venue-policy results.](github-webp/06-check-the-details.webp)

7. **Plans change. Change the brief.** — Actual meeting-detail form illustrates changing the group's shared brief.

   ![Actual meeting-detail form illustrates changing the group's shared brief.](github-webp/07-update-the-brief.webp)

8. **Every person gets a say.** — Actual shared decision screen records all three member votes and enables host confirmation.

   ![Actual shared decision screen records all three member votes and enables host confirmation.](github-webp/08-everyone-votes.webp)

9. **Leave with a plan everyone can follow.** — Actual confirmed plan records unanimous support and explicitly states that no booking was made.

   ![Actual confirmed plan records unanimous support and explicitly states that no booking was made.](github-webp/09-confirmed-plan.webp)

10. **Agora carries the conversation.** — Actual people/Kabir and Hindi Stage screenshots alongside the implemented Agora capabilities.

   ![Actual people/Kabir and Hindi Stage screenshots alongside the implemented Agora capabilities.](github-webp/10-agora-conversation.webp)


## What the screenshots show

The room was created through the app's microphone-free Stage entry, with You, Priya and Ayaan as three actual backend members. Preferences, real provider reads, proposal, three authenticated votes and host confirmation were entered through the app's supported APIs, then captured from the actual frontend. No UI text or source screenshot was AI-generated or rewritten.

The sources were OpenStreetMap/Overpass for venue discovery and listed reservation metadata, Open-Meteo for weather, and OSRM for driving estimates. All four checks returned ready results during capture. Forecasts, listing metadata and travel times are dated examples. Venue prices, indoor seating and exact booking availability remain unverified. The confirmed plan explicitly says no booking has been made.

The voice and Agora card explains implemented RTC voice/optional video, RTM captions/state, Conversational AI facilitation and Agent Client Toolkit lifecycle capabilities. Its captured room had microphone and cameras off; the images do not represent a recorded live audio/video test. Shared Stage preferences, read tools and votes belong to the app backend.

[Current Stage guide](../../live-smart-stage.md) · [Avatar guide](../../assistant-avatar.md) · [Claim evidence](../../claim-evidence.md)

## Reproduce

From the repository root, while the existing local app and backend are running:

```powershell
node scripts/capture-decision-story-screens.cjs
node scripts/render-decision-screenshot-story.cjs
```

The capture script creates its own ephemeral room, starts no cloud voice assistant, prints no member secrets/tokens, and closes its room afterward. The renderer uses the bundled Playwright/Sharp runtime and copies the existing app SVG/avatar assets without editing them. [Export report](export-report.json) records source image hashes and file sizes.

