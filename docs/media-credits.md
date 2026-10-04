# Media credits

## Current app artwork

The Decision Rooms cast and three story scenes were created using built-in image generation, referenced to the user-approved roundtable logo. These are fictional illustrated brand characters. Sources, optimized PNG/WebP exports and exact prompts are documented in [the character world](character-world.md) and [prompt manifest](character-art-prompts.json). Current app screens import this artwork rather than human portraits.

## Assistant motion exports

Kabir's live avatar is a code-drawn SVG extension of the existing headphone-and-mug character, using the same neutral palette. `AssistantFigure.tsx` supplies both the app rig and the exported speaking, thinking and listening loops. The loops use a sample mouth-motion signal and contain no speech or recorded call. The live app instead animates from the actual incoming assistant audio. See [the assistant guide](assistant-avatar.md) and `mobile/assets/assistant-motion/manifest.json`.

## Historical photos and videos

Earlier walkthroughs use actual local app screenshots, with local synthetic presentation narration. They are composed walkthroughs, not captured live group calls. Their stock participant portraits depict fictional demo participants with cameras off; they are not actual users or endorsers.

- Ayaan portrait: [So Phors / Pexels](https://www.pexels.com/photo/smiling-man-working-with-smartphone-and-laptop-26840764/).
- Priya portrait: [Jeff Vinluan / Pexels](https://www.pexels.com/photo/woman-smiling-while-using-a-laptop-8407679/).
- Host portrait: [Vitaly Gariev / Pexels](https://www.pexels.com/photo/smiling-man-working-on-laptop-23224716/).
- Original photos retain their [Pexels license](https://www.pexels.com/license/) attribution.
- Earlier cafe room cover: built-in AI-generated illustration retained under `mobile/assets/photos/`; it is no longer imported by the app.
- Earlier rebrand narration: installed local Microsoft Zira Desktop synthetic voice.
- The original published video retains its stock-portrait conversation and scripted voices as historical media.

The earlier full walkthrough videos have not been regenerated. The new media consists of the small assistant-motion loops and their preview montage.
