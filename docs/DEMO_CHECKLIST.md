# Recording run · Velora 1.0

1. Extract the download. On Windows double-click Start Velora.bat. Capture the powered-off state, Start PC, boot mark, wallpaper and automatic About reveal. Record the short version using Skip startup.
2. Open four windows. Move and resize one at its corner, snap left and right, minimize one and restore it from the dock.
3. Press Ctrl + Alt + Space, type Paint and press Enter. Show Ctrl + Alt + K, window switching and right-click on the wallpaper.
4. Create a text file in Files. Rename it and move it into Documents. Reload, start the desktop and reopen the file.
5. Open Notepad and edit the file. Play First Light.wav in Music. Draw one stroke in Paint, undo, redraw and save to Pictures. View it in Gallery, add a Calendar event and calculate 2+3*4.
6. In Terminal enter cd Documents, pwd and ls. Use the up arrow to recall a command. Enter open calculator.
7. Open Settings. Try dark theme, a custom photo and a side dock. Enable a weather widget, choose a city and refresh. Show the timestamp. Reboot and show the saved choices. Choose a window from Workspace overview.
8. Open Browser and follow its offline field guide. In Clock set an alarm, try Timer, and start/pause Stopwatch. On HTTPS test a short voice memo and a video imported from the recording device. Confirm the audio codec works on that device.
9. For the installed offline take, first load the HTTPS build and wait for the service worker installation in browser developer tools. Disconnect, reload, press Start PC, and reopen a saved document. Restore the connection before refreshing weather.

## Verification boundaries

Browser checks during development covered startup, multitasking, search, persistence, calculation, terminal launch, Paint to Gallery, calendar, clocks, Browser history and live weather. The release harness exercised the generated service worker using a simulated outage. Before filming on the target PC, check Windows batch execution, performance, real microphone input, speaker output, video codecs and installed offline reload on that hardware.
