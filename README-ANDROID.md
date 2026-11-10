# SquardGames Android app (WebView + AdMob)
The app loads your live website, so every website update shows in the app instantly (no new Play Store release needed). AdMob ads are native (banners top/bottom, app-open, interstitial, rewarded, native card on the home page).

## 1. Set your site address
`app/build.gradle.kts` -> `SITE_URL` = your live HTTPS website (must end with `/`).

## 2. Open and run
Install Android Studio -> File > Open -> this `android` folder -> let Gradle sync (if it asks, accept the AGP/Gradle upgrade suggestion) -> Run on a phone.
Debug builds automatically use Google TEST ads. NEVER click your own live ads (AdMob bans accounts for that).

## 3. Release for Play Store
Build > Generate Signed App Bundle (AAB). Keep the keystore file + passwords safe forever (lost = cannot update app).
Targets Android 16 (API 36) as Google Play requires since 31 Aug 2026.

## 4. Before submitting (checklist)
- AdMob: verify each ad unit's format (Interstitial/Rewarded/Native/App open/Banner). `AdIds.kt` maps your unit "inst beta" as Interstitial #2 - if it is another type, ads will not load.
- AdMob > Privacy & messaging: create the GDPR consent message (EEA/UK). Add your website to the AdMob app listing; the site already serves /app-ads.txt.
- Play Console: privacy policy URL = https://YOUR-SITE/privacy.html, Data safety form (ads, player name, country, scores), content rating, 512x512 icon, screenshots.
- Real-money prizes: Google Play restricts apps with cash-prize contests. The app hides prizes/claim by default (`APP_PRIZES=false` in public/app.js). Read Play's "Real-Money Gambling, Games, and Contests" policy before enabling.
- Website web-ads (Adsterra/Monetag) are switched off inside the app automatically.
