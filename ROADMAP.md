# VELORA development roadmap

Implement sequentially. Preserve completed behavior and record evidence in DEVELOPMENT_LOG.md. The owner approved Checkpoint 01, Checkpoint 02 implementation and GitHub push on 2026-10-30. Stop before Checkpoint 03 until approved. Deployment remains a later checkpoint.

| Checkpoint | Scope | Dependency | Acceptance and test requirement | Reveal | Status |
|---|---|---|---|---|---|
| 01 · First Light | Identity, startup with skip, wallpaper, desktop, dock, local clock/date, launcher, basic app window | None | Start, finish and skip boot, open/close an app without application errors; inspect actual preview; verify keyboard basics | First OS boot | Approved |
| 02 · Window engine | Independent windows, dragging, resizing, minimize/restore, maximize, focus, z-order, taskbar indicators, snap, keyboard switching | 01 approved | Four simultaneous windows; resize and move; minimize and restore; keep bounds usable after viewport resize; test touch/pointer and keyboard | Real multitasking | Implemented; review pending |
| 03 · Navigation | Searchable launcher, command palette, shortcuts, recent apps, app switcher, desktop context menu | 02 | Launch different apps by search and keyboard; test empty search, Escape dismissal, focus return and shortcut collisions | Keyboard app launch | Not started |
| 04 · Virtual files | Folders/files, create, rename, move, preview, delete confirmation, browser import, IndexedDB persistence | 03 | Create/import, reload and reopen; test name collisions, invalid moves, recursive deletion confirmation, transaction failure and quota errors | A saved file survives reload | Not started |
| 05 · Applications | Autosaving Notes, local Music Player, Gallery, Calculator, shared file service | 04 | Save/reopen notes, play actual imported audio, view an imported image, verify calculations; test unsupported files, denied playback and object-URL cleanup | Music while using another app | Not started |
| 06 · Terminal | help, clear, date, ls, cd, pwd, useful file commands, app launch, errors and history | 05 | Navigate virtual folders and open an app; verify quoting, unknown paths, history and destructive-command confirmation; never execute native shell | Control the desktop through terminal | Not started |
| 07 · Personalization | Wallpaper, light/dark themes, accent, persisted settings, focus mode, workspace overview, transitions | 06 | Change settings, reload, verify persistence; check contrast and keyboard overview navigation across themes | Transform the OS instantly | Not started |
| 08 · Release | UI polish, performance, accessibility, responsive checks, reduced motion, versioned Service Worker, offline, deployment and final README | 07 | Repeat all acceptance tests on production build; load once then offline/reload, test cache updates, small viewport, keyboard/screen reader and real low-end hardware; approve public release | Final showcase | Not started |

## Definition of done for every checkpoint

1. State scope and implementation stages before changing code.
2. Build real functionality; avoid simulated success or fake demos.
3. Run a build and relevant browser checks; log bugs and fixes.
4. Record what was tested, what passed and what remains untested.
5. Supply a visual demo moment and short Sinhala voiceover.
6. List changed files and save a clearly named version-control commit.
7. Obtain required checkpoint/publication approval before the next gated action.
