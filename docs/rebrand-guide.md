# Agora Decision Rooms

Display name: **Agora Decision Rooms**. Tagline: **Talk together. Decide together.**

This is an independent hackathon project built with Agora, with the same guided group decision workflow and native voice integration.

## Visual direction

The supplied screenshot informs the rounded room cards, character-based participant tiles, quiet surfaces, thin icons, pill controls and generous spacing. The UI uses charcoal `#242523`, soft off-white `#FAFBF7`, and pale neutral `#EDF0EA`. Small green state dots and muted red error text communicate status; purple and decorative colour gradients are removed.

The approved logo shows three people around one round table, in charcoal, off-white and neutral grey. Its SVG uses the same silhouettes as the rotating loader, with the original logo framing for the static mark. The shared `BrandIcon` supplies app headers, footers, profile, landing and voice/decision room screens. Native launcher and launch-screen assets and the browser favicon use this same mark. The 24 matching line icons use static PNG imports, avoiding a new runtime dependency.

- UI icon: `mobile/assets/branding/decision-rooms-icon.svg` and `.png`.
- Header/landing lockup: `mobile/assets/branding/decision-rooms-lockup.svg` and `.png`.
- Rebuild vector exports and Android/iOS launcher assets: `node scripts/build-decision-brand.cjs`.
- Shared tokens: `mobile/src/ui/theme.ts`.
- Shared loading component: `mobile/src/ui/RoomLoader.tsx` and `.web.tsx`; see [usage](room-loader.md).
- Web startup: `mobile/web/index.html` shows the rotating loader while JavaScript loads; React replaces it as soon as the app mounts.
- Native startup: approved logo on Android and iOS launch screens. In-app loaders cover voice connection, agent thinking, guided search and event preparation.
- New screenshot set: `docs/screenshots/decision-rooms/`.

The React Native registration key and native application ID stay stable for startup and installation continuity. The user-facing app name, service descriptions and room assistant greeting are updated.

## Character artwork

The current app replaces human photographs with the recurring Decision Rooms cast: Priya the planner, Ayaan the budget detective, Maya the idea spark and Kabir the peacemaker. All share the logo's circular heads, curved arms and charcoal/ivory/grey palette. Three scenes tell the story: talk through preferences, compare options, then agree on one shared plan.

See [the character world and usage guide](character-world.md) and [the exact generation prompts](character-art-prompts.json). Native imports use transparent PNG; the browser uses compressed transparent WebP through `CharacterSources.web.ts`. Regenerate crops and exports with `node scripts/build-character-assets.cjs`.

Earlier cafe and stock-portrait assets remain in the repository for historical media, with attribution retained in [media credits](media-credits.md). They are no longer imported by the app.

## Rebranded media

`scripts/decision-scenes.json` contains the narration and scene text. `scripts/build-decision-media.py` builds a 1080p narrated screenshot walkthrough, thumbnail, SRT captions and PDF presentation. Default narration is an installed local Microsoft Zira Desktop voice; no text upload is needed. `audio-cloud` is an explicit alternative that sends narration to Microsoft's speech service and requires authorization before running.

Generated files are in `output/decision-rooms/` and `output/pdf/`. They are review artifacts and excluded from Git. Screenshots are from the running app. Existing walkthrough exports predate the character rollout. The video is a composed walkthrough, not a recording of a live group call. Original published media and repository URLs remain historical evidence until the new version is published.

## Verification and scope

The existing decision controls remain: budget/rain/early scenarios, explicit votes, action review, host approval, pause/resume, captions, stage expansion and local receipts. Stage changes now scroll to the top, circle search filters contacts, and floating controls fit a 320-pixel phone.

The group stage uses fixtures and simulated votes. External calendar writes, participant video and group synchronization remain pending. Native Agora voice is separate. A real device audio test is still required. No public submission or YouTube video is changed by this local rebrand.
