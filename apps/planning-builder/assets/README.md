# Assets

Replace these placeholders before shipping:

- `icon.png` — 1024×1024 app icon
- `adaptive-icon.png` — 1024×1024 Android adaptive foreground
- `splash.png` — 1284×2778 splash image
- `favicon.png` — 48×48 web favicon
- `notification-icon.png` — Android notification small icon (transparent, 96×96)

`PrivacyInfo.xcprivacy` is referenced via `app.config.ts` `privacyManifests`. If
you prefer the file-based approach, copy it into `ios/<Target>/` after running
`expo prebuild`.
