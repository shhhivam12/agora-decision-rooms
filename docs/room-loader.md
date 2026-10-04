# Agora Decision Rooms loader

The approved neutral roundtable logo becomes a seamless 2.4-second clockwise
loop. The three original people rotate together around a stationary grey table.
Charcoal, off-white and grey match the proposed logo. The table is centred on the
rotation pivot, and every pose fits inside the badge without clipping.

## App usage

```tsx
import { RoomLoader } from './RoomLoader';

<RoomLoader size={64} label="Opening your room" />
```

The native version uses a 256px transparent PNG layer and React Native's native
animation driver. The browser resolves `RoomLoader.web.tsx` and rotates the SVG
people with CSS. Neither version adds a runtime package or rerenders on each
frame. Both respect the system's reduced-motion preference. Native loops and
accessibility listeners stop on unmount.

- `size`: badge size in pixels, default 64.
- `label`: accessible loading description. Use visible status text alongside it.
- `badge={false}`: transparent background for a dark surface.
- `paused`: stops motion when keeping a loader mounted but inactive.

The loader appears during web startup, native voice connection and agent thinking,
and the guided demo's search/event preparation stages. Existing timing and decision logic govern when
these states end; the animation adds no loading delay.

Interactive preview: run `npm run web` in `mobile` and open
`http://127.0.0.1:5173/loader-preview.html`. The preview renders the actual web
component at 160, 96, 64, 48, 32 and 24px, with a pause control.

## Portable exports

- `mobile/assets/branding/roundtable-loader.svg`: animated transparent vector.
- `mobile/assets/branding/roundtable-loader-badge.svg`: animated charcoal badge.
- `mobile/assets/branding/roundtable-loader-people.png`: native rotating layer.
- `output/roundtable-loader/roundtable-loader-preview.gif`: looping preview.
- `output/roundtable-loader/roundtable-loader-transparent.webm`: 512px, 30fps,
  2.4-second loop with verified alpha, for later video composition.

The SVG is about 5.6 KB and the native PNG layer about 4.7 KB. The animated GIF
and WebM are preview/editor assets, not app runtime assets. The still source is
retained in `mobile/assets/branding/roundtable-neutral-source.png`; it is not
imported into the runtime bundle.

## Rebuild

Run `scripts/trace-roundtable-loader.py` with Python, Pillow and numpy, then
`node scripts/export-roundtable-loader.cjs`. The trace preserves all six original
silhouettes and smooths their outlines into short quadratic vector paths. The
exporter uses Sharp at build time and FFmpeg for the video. Set
`ROUNDTABLE_FFMPEG` to another installed FFmpeg binary if needed.

For FFmpeg composition, select `-c:v libvpx-vp9` **before** the WebM's input to
decode its alpha channel. Output contains 72 unique frames; the next loop frame
returns to the starting angle without a duplicate end frame.

Verification: TypeScript, all 17 existing tests and the production web build
pass. Browser checks cover changing rotation, stationary table, pause/resume,
small sizes and phone layout. WebM alpha was decoded and checked at a clear
corner and the opaque table centre. Native device performance and the live
voice connection were not measured in this asset-focused check.
