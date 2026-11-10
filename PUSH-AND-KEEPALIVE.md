# Keep Render awake
server.js pings its own public address every 10 minutes (RENDER_EXTERNAL_URL is set by Render automatically). Nothing to do.
Backup (recommended): free monitor at uptimerobot.com -> HTTP monitor -> https://quizarena-2r54.onrender.com/api/online -> every 5 minutes.
Note: Render gives 750 free hours per month for ALL your free services together. One always-on service uses about 744 hours.

# Push notifications (text + image) - optional, needs 3 values
1. Firebase console -> Project settings -> General -> "Your apps" -> add a Web app (</>) -> copy firebaseConfig.
2. Same page -> Cloud Messaging tab -> Web Push certificates -> Generate key pair -> copy the key.
3. Put them in public/config.js (SQ_FB: apiKey, messagingSenderId, appId, vapidKey), then: firebase deploy --only hosting
Players tap "Get notifications" on the home page. Send from the Admin panel -> "Send notification".
(Works in Chrome/Edge/Firefox and on an installed PWA. Not inside the Android WebView app.)
