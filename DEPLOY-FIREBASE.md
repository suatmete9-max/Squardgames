# Put SquardGames live on Firebase (squardgames.web.app)

Firebase Hosting only serves static files (the website). The game server (server.js: leaderboard, quiz, e-mail) must run elsewhere - e.g. Render.

## A. Game server on Render
1. Upload this project to a GitHub repo, Render > New > Web Service > that repo. Build command: (empty). Start command: `node server.js`.
2. Environment variables:
   - ALLOWED_ORIGINS = https://squardgames.web.app,https://squardgames.firebaseapp.com
   - TZ_OFFSET = 5.5
   - SMTP_USER / SMTP_PASS (Gmail app password) for direct claim/support mail
   - DATA_DIR = /data  and attach a Render Disk at /data (without a disk, scores/players are lost when Render restarts)
3. Note your server address, e.g. https://squardgames-api.onrender.com

## B. Website on Firebase
1. Edit `public/config.js`:  window.SQ_API='https://squardgames-api.onrender.com';
2. Install once: `npm i -g firebase-tools`  then  `firebase login`
3. Create the project at https://console.firebase.google.com with Project ID **squardgames** (IDs are global - if taken, choose another, e.g. squardgames, edit `.firebaserc`, and your link becomes <id>.web.app; also update SITE_URL in android/app/build.gradle.kts and ALLOWED_ORIGINS).
4. In this folder run:  `firebase deploy --only hosting`
5. Open https://squardgames.web.app  - every later `firebase deploy --only hosting` updates the website AND the Android app.

## C. After going live
- Adsterra and Monetag: add the new domain (squardgames.web.app) in both dashboards.
- Then build the Android app: see android/README-ANDROID.md
