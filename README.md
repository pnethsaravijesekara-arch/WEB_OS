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

**Settings → Widgets** controls clock, calendar and weather visibility, appearance and placement. Time and date sit directly on the wallpaper. Choose Air for a single line of digits, Stack for two rows, or Dial for analog hands. Adjust the ink for your wallpaper and choose a palette and position. Glass, Solid and Outline control the weather surface. To fetch weather, enter a city, select **Apply city**, then **Refresh** on the widget. Open-Meteo receives that city lookup and its coordinates. The most recent successful reading displays its timestamp offline. No location permission is requested.

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

## Privacy and security notice
Velora is an experimental client-side browser desktop, without an independent security audit. File imports and desktop data are processed and saved in browser storage. Keep backups and avoid passwords, financial information and other sensitive files. The visual lock is not authentication. Clearing site data can remove saved work.

The hosted page still contacts its hosting provider, which may keep access logs. Weather refresh sends a city lookup and coordinates to Open-Meteo. Web searches and external pages contact their respective services. Their policies apply. Sign in through your regular browser tab after checking the destination. These network features mean the experience must not be advertised as entirely offline or zero network traffic.

External embedded pages are sandboxed without form submission or same-origin privileges, with camera, microphone, geolocation, payment and clipboard access denied. External addresses require HTTPS. This is risk reduction, not a security or legal guarantee. No analytics or cloud file upload service was added by this change.

## License and release notices

Project-authored code is available under the [MIT License](LICENSE), which permits reuse, modification and commercial distribution with its notice retained. Review [third-party and asset notices](THIRD_PARTY_NOTICES.md), [privacy and data handling](PRIVACY.md) and the [security policy](SECURITY.md) before deployment. Velora is an experimental browser desktop supplied as is. These files do not guarantee security, intellectual-property clearance or compliance in every jurisdiction.
