# Velora OS · First Light 1.0

Velora is a browser desktop for Pasindu Wijesekara’s “I Built My Own Operating System Using AI!” It starts powered off. Press **Start PC** to boot into a live wallpaper and the About window.

## Open on Windows

Download the repository ZIP, extract it, then double-click **Start Velora.bat**. Keep **Velora.html** beside it. This portable build opens in your default browser with the desktop assets embedded. No Node installation is needed to run it. On other platforms open Velora.html directly in a modern browser. For predictable persistence across updates, microphone access and installation, use the same hosted origin and browser profile. The browser controls storage permissions for local files.

## Apps and desktop

| App | What you can do |
|---|---|
| Files | Create folders and text files, import, rename, move, preview and confirm deletions. |
| Notepad | Edit local text with autosave and save a separate copy. |
| Paint | Draw with a pen, mouse, touch or keyboard, erase, undo five strokes and save a PNG to Pictures. |
| Music, Video Player, Gallery | Import and play supported local media. Try the included First Light WAV and Afterglow illustration. |
| Calculator | Evaluate expressions with parentheses and arithmetic precedence. |
| Calendar | Browse months and save all-day events as local iCalendar files. |
| Clock | Use a stopwatch, countdown timer or scheduled local-time alarm. An alarm can ring after closing Clock while Velora remains running. Suspended tabs may deliver it late. |
| Sound Recorder | Grant microphone permission, record a memo and stop to save it to Music. |
| Browser | Enter a URL, search the web, use back/forward, save bookmarks and browse the offline field guide. Sites that block framing have an external-tab link. |
| Terminal | Run **help**, **pwd**, **ls**, **cd**, **cat**, **mkdir**, **touch**, **date**, **history**, **apps**, **open** and **clear** on the virtual desktop. |
| Settings, Welcome, About Velora | Configure the desktop, learn its controls and inspect the release. |

**Settings → Widgets** controls clock, calendar and weather visibility, appearance and placement. Choose Glass, Solid or Outline, four color palettes and upper or lower placement. To fetch weather, enter a city, select **Apply city**, then **Refresh** on the widget. Open-Meteo receives that city lookup and its coordinates. The most recent successful reading displays its timestamp offline. No location permission is requested.

Settings also includes light, dark and system appearance, accent colors, wallpaper import, live wallpaper, focus mode, reduced motion and dock size, position and auto-hide. A desktop lock covers the UI without authenticating the user. Shutdown and restart affect the Velora workspace.

## Keyboard

| Shortcut | Action |
|---|---|
| Ctrl + Alt + Space | Search applications. Enter launches the first match. |
| Ctrl + Alt + K | Search commands and apps. |
| Ctrl + Alt + Tab | Choose an open window. |
| Ctrl + Alt + O | Workspace overview. |
| Ctrl + Alt + arrows | Snap, maximize or restore a window. |
| Ctrl + Alt + M / W | Minimize or close the active window. |
| Shift-click a dock app | Open another instance. |

## Develop and deploy

Use Node 22.13+ or Node 24 LTS and npm. Run these commands from the repository:

```sh
npm ci
npm run dev
npm test
npm run build
npm run check:release
npm run preview
```

The build produces **dist/** for static hosting and regenerates the portable **Velora.html**. Upload the contents of dist to an HTTPS static host, retaining relative paths. Open the hosted desktop once online and let the service worker finish caching. On supported browsers the hosted desktop can be installed and reopened offline. Weather refresh and external websites need a connection. Imported files, notes, drawings and settings are local to each browser profile and origin. Clearing site data removes them.

The project uses Vite, TypeScript and browser APIs. No runtime framework, remote fonts or cloud account are required by the application. Media decoding depends on the browser. File imports are limited to 64 MB and editable notes to 1 MB.

See DEVELOPMENT_LOG.md for the checkpoint history, ROADMAP.md for coverage, and docs/DEMO_CHECKLIST.md and docs/YOUTUBE_SCRIPT_SI.md for filming.
