# VELORA development log

## Checkpoint 01 — First Light · 2026-10-29

**Status:** implemented, desktop acceptance checked, awaiting owner review. Checkpoint 02 has not started. Public GitHub push and public deployment have not been performed.

### Scope and implementation stages

1. Inspected the requested `pnethsaravijesekara-arch/WEB_OS` repository through GitHub. It was public and empty, with no existing code or repository instructions.
2. Established VELORA / First Light: teal/navy, warm parchment accents, original ribbon mark, native system typography and Daybreak vector wallpaper.
3. Created a Vite + strict TypeScript foundation with modular CSS and no runtime framework.
4. Implemented a short boot, skip/replay, an interactive desktop, minute-aligned local clock/date, dock, launcher, and a single application window with Welcome/About views.
5. Added keyboard-accessible buttons, focus restoration, inert desktop during startup, Escape dismissal, scrollable app content and reduced-motion CSS.
6. Built and inspected the application in the actual cloud browser. Repaired the managed preview hostname configuration before completing the functional tests.
7. Added eight-checkpoint roadmap, setup guide, honest Sinhala narration, demo checklist and a self-contained production preview export.

### Actual verification

| Check | Result | Evidence / boundary |
|---|---|---|
| `npm run build` | PASS | Strict TypeScript check, Vite production build and standalone export completed |
| Boot → desktop | PASS | Browser showed startup then interactive desktop |
| Dock → Welcome → close | PASS | Window visible, then absent; active label returned to Desktop |
| Launcher → app | PASS | Opened Welcome and About from launcher |
| Keyboard Tab/Enter | PASS | Navigated launcher and activated About |
| Escape | PASS | Closed About and dismissed launcher |
| Startup replay + skip | PASS | Returned to clean desktop with focus on launcher |
| Desktop Welcome shortcut + CTA | PASS | Opened app; Make yourself at home closed it |
| Launcher close button | PASS | Launcher hidden and focus returned to dock button |
| Clock update | PASS | Both clock displays advanced from 17:19 to 17:22 and later 17:24 during the run |
| Actual visual review | PASS | Inspected Daybreak desktop and settled Welcome window at browser viewport about 1363 × 936 |
| Compiled export smoke test | PASS | Loaded exported HTML over managed HTTP preview; booted, opened/closed Welcome and launched again from launcher |
| App console logs | PASS | No app-origin warnings/errors observed in captured browser logs; browser-extension metadata errors were unrelated |
| i3 / 4 GB performance | NOT TESTED | No access to target hardware; no FPS/RAM claim |
| Mobile/reduced motion/screen reader | NOT TESTED | CSS and semantics implemented; actual device/emulation/accessibility acceptance remains outstanding |
| Windows direct file opening | NOT TESTED | Export is self-contained; browser run used HTTP |
| Offline/PWA | NOT IMPLEMENTED | Reserved for Checkpoint 08; self-contained review file is not a Service Worker installation |

### Bugs and limitations

- Initial browser approval attempt was blocked by a usage-limit review failure. On continuation the normal browser tool succeeded; no alternate browser path was used.
- Vite rejected `terminal.local` on first preview. Added that exact hostname to dev and preview allowlists in `vite.config.ts`, restarted the preview and verified the fix. Arbitrary hosts are not allowed.
- No further application bug was observed in the completed test flows. Unexecuted tests above remain explicitly open.
- Single-window replacement is intentional for Checkpoint 01. There are no fake minimize/maximize controls or pretend future apps.
- Boot progress is an intro animation, not a fabricated hardware/resource scan.

### Performance evidence

Production JS: 10.63 kB, 3.77 kB gzip. CSS: 14.29 kB, 4.14 kB gzip. Wallpaper: 2,008 bytes. Logo: 195 bytes. These are build-output sizes, not runtime performance measurements. One minute-aligned timer updates clock text and pauses while the document is hidden. No continuous canvas, 3D engine or downloaded fonts.

### Changed files

All files are new in this initially empty repository:

- Configuration: `.gitignore`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`.
- Application: `src/main.ts`, `src/apps.ts`, `src/clock.ts`, `src/icons.ts`.
- Styling: `src/styles/tokens.css`, `src/styles/desktop.css`, `src/styles/apps.css`.
- Identity: `public/mark.svg`, `public/daybreak.svg`.
- Export: `scripts/create-preview.mjs`.
- Documentation: `README.md`, `ROADMAP.md`, `DEVELOPMENT_LOG.md`, `docs/DEMO_CHECKLIST.md`, `docs/YOUTUBE_SCRIPT_SI.md`.

### YouTube reveal

Replay startup → Daybreak desktop → Launcher → Welcome → Make yourself at home → About Velora. Sinhala voiceover is in `docs/YOUTUBE_SCRIPT_SI.md`. Describe this as the first functioning browser desktop foundation, not a completed eight-checkpoint OS.

### Version-control and next gate

Saved as the local commit `feat(checkpoint-01): build VELORA First Light desktop foundation`. Source package includes a Git bundle to preserve that commit. The owner requested approval before public publication; because the selected repository is public, push remains pending. Obtain approval for push separately from Checkpoint 02 implementation.

## Checkpoint 01 revision — desktop shell · 2026-10-30

**Version 0.1.1.** User feedback: the first design felt like a website rather than an OS. This entry supersedes the original visual design and its UI labels; earlier test records remain historical.

### Implemented

- Replaced the oversized desktop clock, promotional copy and split Welcome hero with a compact system bar, icon-based desktop and a sidebar utility window.
- Added an original locally bundled Aurora wallpaper, coherent blue application icons, restrained glass shell panels and readable tinted application surfaces.
- Implemented dock-origin app opening/closing, decelerating panel transitions and a minimal startup. Animations are short, cancelable and disabled by the reduced-motion control.
- Added a system menu, current-month calendar with previous/next/Today, real browser fullscreen, session-only workspace dimming, reduced motion and reduced transparency.
- Added a visual lock cover with keyboard unlock and preserved application state. This is explicitly not an authentication or password lock.
- Fixed focus restoration for openers removed by a view change; disconnected buttons no longer receive focus. Outside dismissal restores focus to a live control.
- Updated the self-contained export to embed the wallpaper and updated the README, recording checklist, Sinhala voiceover, design rationale and asset provenance.

### Observed validation

Development browser checks on October 29 and compiled-export follow-up on October 30:

| Check | Result |
|---|---|
| TypeScript + production build + standalone export | PASS |
| Automatic boot; system-menu replay; Skip startup | PASS |
| Dock/desktop/launcher opens; close and Start using Velora | PASS |
| Keyboard launcher activation, Escape dismissal | PASS |
| Fullscreen enter and exit | PASS — control changed to Exit full screen and back |
| Reduced motion and transparency | PASS — pressed state and visual surfaces changed |
| Workspace brightness | PASS — keyboard slider changed from 100 to 99 and back |
| Calendar next month and Today | PASS — October to November 2026 and back |
| Lock/unlock | PASS — desktop inaccessible while cover visible; app preserved on return |
| Small viewport | PASS — actual 390 × 844 iframe in desktop Chrome; Welcome, controls and keyboard unlock usable |
| Close followed by opening another app | PASS — About remained visible with correct active label |
| Application console | PASS — no app-origin errors/warnings in final captured log; extension metadata errors excluded |
| Actual Windows file-URL launch | NOT TESTED — compiled self-contained file tested over HTTP |
| Physical phone, screen reader, target i3/4 GB hardware | NOT TESTED |

These are observed browser checks, not a comprehensive automated test suite or a claim of production release readiness.

### Build size and changed files

Production JS: 18.89 kB, 5.91 kB gzip. CSS: 19.17 kB, 5.19 kB gzip. Aurora wallpaper: 41,450 bytes. The review HTML is approximately 150 kB and embeds its assets. No runtime framework or graphics engine was added.

Changed: `src/main.ts`, `src/apps.ts`, `src/icons.ts`, all three `src/styles/` modules, `index.html`, package/version files, `scripts/create-preview.mjs`, `README.md`, `docs/DEMO_CHECKLIST.md`, `docs/YOUTUBE_SCRIPT_SI.md`, and this log. Added `public/aurora.webp`, `docs/DESIGN_REVIEW.md`, `docs/WALLPAPER.md`. Temporary viewport harness was removed after checking.

### Demonstration and version control

Reveal: short monochrome boot → clean Aurora desktop → icon-to-window opening → working controls → calendar → lock/unlock. Updated Sinhala narration is in `docs/YOUTUBE_SCRIPT_SI.md`.

Local commit: `refactor(checkpoint-01): redesign Velora as a desktop shell`. The source ZIP and Git bundle preserve both checkpoints of work. GitHub publication remains pending the requested public-push approval. Checkpoint 02 has not begun. Persistent settings, theme selection, multi-window management and offline installation remain in their planned later checkpoints.

## Checkpoint 02 — window engine and power · 2026-10-31

**Version 0.2.0.** Owner approved the revised desktop, Checkpoint 02 and GitHub publication. Checkpoint 03 is not started. This entry supersedes earlier pending-push and single-window notes.

### Implementation stages

1. Preserved the approved Aurora theme, compact shell, system apps, controls and calendar.
2. Added an independent window manager and pure geometry module: window identity, content, bounds, restore bounds, placement, minimize state and focus order live per instance.
3. Implemented pointer-captured dragging/resizing with animation-frame batching only during gestures, eight resize edges/corners, bounds clamping and left/right/top snap previews.
4. Added title-bar new/minimize/maximize/close controls, double-click maximize, running counts, a per-window launcher list, keyboard switching, keyboard movement/resizing and snap shortcuts.
5. Added confirmed shutdown/restart from the system menu, shutdown from controls and lock screen, a powered-off workspace and Start Velora. Shutdown clears windows and pauses the clock; it never powers off the host computer.
6. Tested in the browser, repaired interaction races, rebuilt and repeated production-export flows. Updated roadmap, setup, demo checklist and Sinhala voiceover.

### Observed validation

Browser observations were collected on October 30 UTC; final packaging on October 31. These are manual browser checks plus six automated geometry tests, not an exhaustive end-to-end test suite.

| Check | Result and evidence |
|---|---|
| `npm test` | PASS — 6 tests; offscreen clamping, odd-width split, all eight resize handles under extreme inputs, opposite-corner preservation, small bounds, saved normal geometry |
| TypeScript / production / standalone build | PASS |
| Four simultaneous windows | PASS — three Welcome instances plus About; distinct IDs and dock counts |
| Pointer drag and resize | PASS — moved About from x343.5/y162 to x503.5/y240; resized 700×500 to 600×440 in the development run; repeated pointer gestures on the compiled export |
| Minimize and dock restore | PASS — hidden window returned with retained geometry |
| Per-window launcher restore | PASS — selected About from the Minimized list and immediately maximized it |
| Maximize and restore | PASS — filled usable bounds, returned to saved normal geometry |
| Pointer snap / keyboard snap | PASS — dragged About to left edge; switched and snapped Welcome right |
| Keyboard switching / move / resize | PASS — Ctrl+Alt+Tab changed active instance; title-bar arrow moved 16 px; corner arrow resized 16 px |
| Reduced motion | PASS — toggled control, then minimize, restore, close and restart flows |
| Shutdown cancel | PASS — four windows retained; native dialog Escape also returned to lock screen |
| Confirmed shutdown / start | PASS — zero open windows, power-off screen, then real boot and desktop |
| Restart | PASS — closed remaining three windows and booted to clean desktop |
| Small layout | PASS — 390×844 iframe; opened two windows and maximized within x8/y42, 374×704 usable area; this is not physical touch-device testing |
| Browser console | No app-origin warnings/errors in captured logs; extension metadata errors excluded |
| Actual i3 / 4 GB hardware, physical touch, screen reader | NOT TESTED |
| Windows file URL / installed offline mode | NOT TESTED / NOT IMPLEMENTED — compiled export tested over HTTP; Service Worker reserved for Checkpoint 08 |
| Dynamic viewport resizing and pointer cancellation | Implemented; automated geometry covers bounds, but full browser gesture-cancellation/viewport-resize acceptance remains open |

### Bugs found and repaired

- Opening scale animation moved hit targets underneath immediate clicks. Opening now uses a short opacity fade with stationary controls; dock-origin scaling remains on minimize/close. Repeated immediate + clicks and restore→maximize succeeded after repair.
- Minimize completion used to change focus after another panel opened, dismissing the launcher. State/focus now update when minimizing starts; animation completion only hides the window. Minimize→launcher regression passed and showed the correct Minimized row.
- Keyboard focus entering a background window now brings that instance forward. Dialog cancellation returns focus to a visible opener or system-menu button.
- Close removes interaction targets immediately; shutdown also removes any exiting window remnants.

### Performance and changed files

Production JS: 30.08 kB (9.45 kB gzip); CSS: 24.09 kB (6.23 kB gzip). Existing wallpaper: 41,450 bytes. No runtime framework, added dependency, 3D renderer, continuous rendering loop or network API. These sizes do not establish FPS or RAM usage on the target PC.

Added: `src/window-manager.ts`, `src/geometry.ts`, `src/styles/windows.css`, `tests/geometry.test.mjs`.
Changed: `src/main.ts`, `src/apps.ts`, `src/clock.ts`, `src/icons.ts`, package files, export script, README, roadmap, demo checklist, Sinhala script and this log. Temporary viewport harness removed.

### Reveal and version control

Four windows → move/resize → minimize/restore → snap side by side → keyboard switch → confirmed shutdown → Start Velora. Sinhala narration: `docs/YOUTUBE_SCRIPT_SI.md`, Checkpoint 02 section.

Commit: `feat(checkpoint-02): add window management and workspace power controls`. Owner explicitly authorized pushing this checkpoint and prior local history to `pnethsaravijesekara-arch/WEB_OS` on `main`. No deployment or Checkpoint 03 work is included.

Publication note: direct `git push` lacked HTTPS credentials in the execution environment. Publication uses the connected GitHub plugin with the current Checkpoint 02 README and complete current tree. Remote commit IDs therefore differ from the local checkpoint history; the downloadable Git bundle preserves the original local commits. Auto-review rejected an attempted initialization with the historical CP01 README because it was stale; no historical snapshot was published. The current README initialization succeeded.
