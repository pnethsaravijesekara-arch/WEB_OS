# Checkpoint 01 acceptance and recording checklist

Use a current desktop browser. Start with `npm ci`, `npm run dev`. For release verification, run `npm run build` and `npm run preview` and repeat the same steps.

- [ ] Reload: startup shows the VELORA mark; desktop controls are unavailable during boot.
- [ ] Allow boot to finish: desktop, clock/date, shortcuts and dock appear.
- [ ] Open Welcome from the dock; verify active label and running indicator.
- [ ] Close with the X button; verify focus returns to another window or the launcher.
- [ ] Open the launcher; verify two working system apps.
- [ ] Use Tab and Enter to open About Velora; Ctrl + Alt + W closes the application.
- [ ] Open Welcome from the desktop shortcut; “Start using Velora” closes it.
- [ ] Open the launcher and dismiss by Escape, its X, and an outside click.
- [ ] Velora menu → Restart… → confirm and select Skip startup; verify a clean desktop and cleared indicator.
- [ ] Repeat replay and let it finish automatically; no stale boot timer hides the new boot.
- [ ] Observe a minute boundary; both clock displays update consistently.
- [ ] Enable OS reduced motion and reload; intro duration is shortened and decorative animation disabled.
- [ ] Check 1366 × 768, 1920 × 1080, 390 × 844 and small landscape layouts; scroll application content if needed.
- [ ] Inspect application console errors; distinguish extension errors from app errors.

This is a reusable checklist, not a claim that every box was tested. The actual run is in DEVELOPMENT_LOG.md.

## Reveal sequence (about 25 seconds)

1. Velora menu → Restart… → confirm; record the real logo reveal.
2. Hold on the Daybreak desktop with clock, icons and dock.
3. Open the launcher and then Welcome.
4. Select “Start using Velora” to return to the desktop.
5. Open About Velora and show “First Light · Preview.”

Do not show music, files, terminal or multitasking as completed at this checkpoint.

## Revision 0.1.1 checks

- Open the top-right controls; enter and exit real browser fullscreen.
- Change workspace brightness, Reduce motion and Reduce transparency; confirm visible state changes.
- Click the clock, advance a month, return to Today, and dismiss with Escape.
- Lock via the system bar or controls, then unlock with Enter. Confirm the app is preserved.
- Open each Welcome sidebar section and verify active selection and heading.
- Recheck open and close after returning from lock.
- Verify the single visible shell panel replaces the previous panel.
- Check the 390 × 844 layout, then check a physical phone separately.

## Checkpoint 02 — multitasking and power

- [ ] Open Welcome; use + twice and open About: four independent windows.
- [ ] Move and resize one, select a different sidebar tab, minimize, then restore from dock. Geometry and tab must remain.
- [ ] Click an exposed background window; it becomes active and comes to front.
- [ ] Double-click title bar; maximize, then restore exact previous bounds.
- [ ] Drag to left/right/top edge; inspect snap preview and resulting placement.
- [ ] Ctrl + Alt + Tab switches; Shift reverses; minimized windows restore.
- [ ] Keyboard title-bar move and bottom-right-handle resize work.
- [ ] Apps → Open windows restores a specific minimized instance.
- [ ] Start minimizing, then open launcher immediately: delayed animation must not dismiss launcher.
- [ ] Immediate + and maximize clicks during opening are reliable.
- [ ] Shutdown → Cancel preserves all windows; Escape also cancels.
- [ ] Confirm shutdown: clean power-off screen; Start Velora returns through boot.
- [ ] Restart closes all windows and boots once. Repeat with reduced motion.
- [ ] Check shutdown from controls and lock screen.
- [ ] Resize browser viewport; windows remain inside usable bounds.
- [ ] Run `npm test` and `npm run build`; repeat core flows in the compiled export.

Reveal: four overlapping windows → drag/resize → minimize/restore → two snapped windows → keyboard switch → shutdown/start. See the log for executed checks; unchecked items here are reusable instructions, not test results.
