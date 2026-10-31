# VELORA · First Light

A personal browser desktop. A lightweight browser OS experience by Pasindu Wijesekara, built with AI.

**Version 0.2.0 — Checkpoints 01–02.** This is a working desktop foundation, not a replacement for Windows. Checkpoint 01 is approved; Checkpoint 02 is ready for review. Checkpoints 03–08 remain gated. It has no access to native system files or native shell commands.

## Run on Windows or another desktop

Use Node.js 22.12+ (Node 24 recommended) and npm. From this folder:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Production build:

```sh
npm run build
npm run preview
```

`dist/` is a static production bundle. Host it with an HTTP server, not by double-clicking `index.html`. The relative Vite base supports root and subdirectory hosting. No deployment is included or authorized yet.

## What works in this checkpoint

- Original VELORA mark and locally bundled Aurora WebP wallpaper; no runtime image downloads or web fonts.
- A restrained 2.1-second startup, Skip startup, Escape to skip, and confirmed Restart in the Velora menu.
- Interactive desktop shortcuts, a dock and a basic two-app launcher.
- Live local clock and date, refreshed at minute boundaries and on tab visibility changes.
- Welcome and About Velora system apps with sidebar navigation, independent simultaneous windows.
- Launch and close actions, active-app label and dock indicator, keyboard activation and focus restoration.
- Responsive CSS, scrollable application content, and reduced-motion styles.
- System menu, month calendar, real browser fullscreen and session-only display controls.
- Visual lock/unlock cover that preserves the current application. It is not a security lock.
- Short window fades and dock-origin minimize/close transitions, panel motion and immediate pressed states.

Welcome's “Start using Velora” button closes the app. About explains the product and browser boundary. Neither app is a placeholder for file management, music or settings.

## Technical foundation

Vite + strict TypeScript + modular CSS; no runtime framework or third-party runtime dependencies. DOM rendering is event-driven. The wallpaper is a 41.5 kB static WebP; there is no canvas, WebGL, perpetual animation loop or remote API. Blur is confined to the dock and the one visible system panel; Reduce transparency disables it. Typography uses installed system fonts.

- `src/main.ts`: boot/power lifecycle, launcher and shell.
- `src/window-manager.ts`: window instances, focus, pointer gestures and transitions.
- `src/geometry.ts`: pure bounds, resize and snapping functions; tested in `tests/geometry.test.mjs`.
- `src/apps.ts`: system-app registry and content.
- `src/clock.ts`: minute-aligned clock timer, paused in hidden tabs.
- `src/icons.ts`: shared original SVG icon family.
- `src/styles/`: tokens, desktop and app styling.
- `public/`: SVG identity and locally bundled wallpaper assets.
- `ROADMAP.md`: eight gated checkpoints and acceptance criteria.
- `DEVELOPMENT_LOG.md`: implementation and observed verification results.
- `docs/DEMO_CHECKLIST.md`: repeatable browser acceptance tests.
- `docs/YOUTUBE_SCRIPT_SI.md`: Sinhala voiceover and recording sequence.

## Later architecture boundaries

Checkpoint 04 will add an IndexedDB-backed virtual file service with stable node IDs, parent IDs, metadata and Blob content, without pretending to access Windows. Checkpoint 05 apps will share that service. Checkpoint 06 terminal commands will operate only on the virtual filesystem. Checkpoint 07 will persist personalization. Checkpoint 08 will add versioned Service Worker caching and offline release checks.

**Not implemented:** search, command palette, file storage, user apps, terminal, persistent personalization, offline installation or deployment.

## Verification limits

The production build and TypeScript check pass. Desktop browser interaction and visual inspection were performed; see the development log for exact results. A 390 × 844 iframe viewport was checked in the desktop browser. Actual i3 / 4 GB hardware, physical mobile devices, screen readers, offline installation and future checkpoint functions have not been tested. Small bundles are not a substitute for real-device measurements.

## Review without installing development tools

After `npm run build`, open `dist/VELORA_Checkpoint_02_Preview.html` directly in a modern browser. This self-contained review export contains the same compiled application and embedded assets; it does not require a server or internet. It is not an installed offline PWA; the Service Worker remains a Checkpoint 08 task. The export was browser-tested over the managed preview server; Windows file-URL behavior still needs a local check.

## Design revision

Version 0.1.1 replaces the initial editorial welcome screen with a compact desktop shell and utility layout. See `docs/DESIGN_REVIEW.md` for official design references and `docs/WALLPAPER.md` for asset provenance. Session display controls are shell refinements; the full Checkpoint 07 personalization system is not implemented.

## Checkpoint 02 controls

- Drag a title bar; resize any edge/corner. Double-click a title bar to maximize/restore.
- Drag to the left/right edge to snap, or the top edge to maximize.
- Title bar: + new instance, − minimize, □ maximize/restore, × close.
- Dock click restores the most recent instance; Shift-click creates another. Apps → Open windows selects any instance, including minimized windows.
- System menu: Restart and Shut down. Shutdown is also available in Controls and on the lock screen. Both power actions ask for confirmation and close all windows; they do not shut down Windows. Start Velora boots again. Display preferences last only in this page session.

| Keyboard | Action |
|---|---|
| Ctrl + Alt + Tab / Shift + Ctrl + Alt + Tab | Next / previous window, including minimized |
| Ctrl + Alt + N | New instance of active app |
| Ctrl + Alt + M / W | Minimize / close active window |
| Ctrl + Alt + ← / → | Snap left / right |
| Ctrl + Alt + ↑ / ↓ | Maximize / restore normal bounds |
| Arrows on focused title bar | Move 16 px; Shift moves 1 px |
| Arrows on bottom-right resize handle | Resize 16 px; Shift resizes 1 px |
| Escape | Cancel drag, dismiss panel/dialog, skip boot or unlock visual cover |

Native Alt+Tab remains owned by the real OS. Window content, geometry and scroll state survive minimize/restore; windows are intentionally not persisted through reload/restart. Run `npm test` for six geometry tests (Node 22.12+ with type stripping; Node 24 recommended).
