# Checkpoint 01 design revision — desktop shell

## User feedback

The first build felt like an AI-generated website rather than an operating system. Its oversized desktop clock, editorial headline, wallpaper caption, manifesto text and split hero panel used landing-page composition. This revision changes the visual grammar and actual shell interactions while remaining in Checkpoint 01.

## Official references consulted (2026-10-29)

- [Apple: desktop, menu bar and Dock](https://support.apple.com/guide/mac-help/desktop-menu-bar-and-dock-mchlws12345m2/mac). Separate persistent system navigation from the workspace. The search result was accessible; a subsequent direct fetch returned 429.
- [Microsoft: Mica](https://learn.microsoft.com/en-us/windows/apps/design/style/mica). Use a readable subtly tinted base for long-lived application surfaces. Our CSS is an approximation, not Microsoft's native material implementation.
- [Samsung: motion basics](https://developer.samsung.com/one-ui/motion/basic.html). Preserve spatial relationships and use responsive deceleration rather than arbitrary decorative movement.
- [Samsung: visual depth](https://developer.samsung.com/one-ui/structure/visual-depth.html). Use restrained hierarchy, blur and shadows to distinguish foreground controls.
- [Huawei: HarmonyOS computer](https://consumer.huawei.com/cn/harmonyos-computer/harmonyos-5/). Reference the continuity between lock screen, desktop, system bars and application surfaces.
- [Huawei: HarmonyOS design](https://consumer.huawei.com/en/harmonyos/). Reference refined gradients, depth and natural movement as design principles, not product compatibility claims.

These are design inputs; this is an original VELORA interface and does not copy vendor assets or claim native OS integration.

## Decisions applied

| Previous treatment | Revision |
|---|---|
| Large decorative desktop clock and tagline | Clock lives in system bar; large clock appears only on lock cover |
| Split editorial Welcome hero | Compact sidebar utility with active rows and useful actions |
| Monochrome muted icons | Consistent shaped icons with blue app identity and neutral utilities |
| Flat abstract vector background | Local 41.5 kB Aurora satin-wave wallpaper |
| Generic fade-in | App transforms originate at its dock icon; system panels use their anchor direction |
| Status wording without controls | Working system menu, calendar and display panel |
| Implicit desktop state | Active-app label, dock marker, focus return and explicit pressed states |

## Motion and performance

App open: 280 ms decelerating scale/opacity. App close: 140 ms. Panels: 220 ms. Unlock: 320 ms. Boot reveal: 450 ms; the boot intro itself lasts 2.1 seconds. The app uses the Web Animations API and cancels a prior window transition when another action supersedes it. Reduced motion changes those animations to zero duration and disables CSS animation. No continuous wallpaper animation, physics loop or 3D runtime.

## Scope boundary

Still one window. No drag/resize/maximize/minimize, app search, file system, music, terminal, persistent personalization or Service Worker. Calendar and session display controls are concrete refinements to the Checkpoint 01 shell. Lock is a visual cover with a clear no-password notice. Brightness only dims the workspace; no hardware brightness, Wi-Fi, battery or audio controls are simulated.
