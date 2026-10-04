# The Decision Rooms circle

Four different personalities sit at one table. The story is **different ideas → common ground → one shared plan**. The people are fictional brand characters, derived from the approved roundtable logo. Their roles explain the everyday group-planning problem without introducing new app capabilities.

| Character | Personality | Visual signature | Voice |
| --- | --- | --- | --- |
| Priya | The planner | Crown swoop, checklist notebook, chunky pencil | Has a plan for the plan. |
| Ayaan | Budget detective | Round spectacles, calculator, skeptical eyebrow | Checks the maths. Twice. |
| Maya | The idea spark | Grey beanie, delighted grin, lightbulb | One idea? Make it seven. |
| Kabir | The peacemaker | Headphones, tea mug, calm open hand | Turns “maybe” into “let’s go”. |
| You | Room host | Welcoming wave, plus card, simple circular head | Bring the people. Start the plan. |

The four friends are the recurring cast. The neutral host avatar represents the user. The guided room still has You, Priya and Ayaan; mascot scenes show the broader brand world rather than changing attendance.

## The three-scene story

1. **Talk:** differing food, activity and time preferences surround the table. Used for home, the circle and the room brief.
2. **Compare:** three pictogram option cards sit between the friends, with time and budget visible. Used for room cards and the comparison stage.
3. **Decide:** one checked calendar card becomes the shared plan. Used for decided-room history, the receipt, the profile promise and the home sign-off.

Large artwork sits on light neutral surfaces. Captions and controls remain real app text. Small face crops identify contacts and voters. Full busts provide gentle personality in invitations, empty states, voice introductions and participant tiles. The approved roundtable logo and rotating loader remain the core identity.

## Drawing and layout rules

Use oversized ivory circular heads, rounded torsos, curved arms, charcoal outlines, dot eyes and simple expressive smiles. Keep the same accessories and silhouette for each character. Stay within charcoal, ivory and neutral grey. The app reserves green and red for meaningful status.

Use one story scene per primary card or stage. Leave breathing room around heads and hands, show the complete scene with `contain`, and keep artwork clear of important copy and actions. Avatars may crop around the face. Illustration is decorative where the nearby text already communicates its meaning. Do not imply live video, real people, endorsements or additional connected participants.

## Saved assets and production

- Original generated artwork: `mobile/assets/characters/source/`.
- Runtime PNG and WebP exports: `mobile/assets/characters/`.
- Exact prompt set and provenance: [character-art-prompts.json](character-art-prompts.json).
- Rebuild crops and compressed exports: `node scripts/build-character-assets.cjs`.
- Shared components: `CharacterArt`, `CharacterBust`, `Avatar` and `AvatarStack`.
- Native imports resolve PNG; browser imports resolve WebP using `CharacterSources.web.ts`.

Created using built-in image generation with the approved logo and master cast as visual references. Exporting uses crop, resize and format conversion; source art remains intact. The complete browser artwork set is about 328 KB; native PNG exports total about 887 KB. Neither high-resolution sources nor the earlier human photographs are imported by the app.

## Later media

Use the same cast and three-scene arc for the next video and screenshot plan. The current request updates the app and saves reusable artwork. Existing published and locally rendered videos remain historical media until separately revised.
