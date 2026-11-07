# SquardGames
Run: `node server.js` -> http://localhost:3000 (Node 18+, no npm install).
Render: Web Service, Build empty, Start `node server.js`. Env: TZ_OFFSET=5, DATA_DIR=/data (attach a Render Disk, or scores reset on redeploy).

## Add new quiz questions (anytime)
1. Open `new-questions.txt`, add lines:  question|correct|wrong1|wrong2|wrong3|difficulty(1-3)
2. Terminal: `npm run add-questions -- new-questions.txt`   (check total: `npm run count-questions`)
3. A running local server loads them in a few seconds. On Render: push/redeploy so data/questions.json goes live.
Duplicates are skipped automatically. .json files with {q,a,w:[3 wrong],d} also work.

Ads: public/ads.js. Prize/support mail: MAIL in public/app.js.

## Direct e-mail for Claim Prize + Support (needs one-time setup on the server)
Use a Gmail account with 2-step verification, create an "App password", then set env vars:
SMTP_USER=yourgmail@gmail.com   SMTP_PASS=<16-letter app password>   (optional MAIL_TO, default suatmete9@gmail.com)
Locally (PowerShell): `$env:SMTP_USER="you@gmail.com"; $env:SMTP_PASS="xxxx"; node server.js`
Without these, requests are still saved on the server and the player gets a "send by Gmail" link.
Read saved requests: set ADMIN_KEY=secret, then open /api/admin?key=secret
## Video break
public/ads.js -> ADS.VIDEO_SRC = "https://.../video.mp4" (optional). Schedule is in the bottom of public/app.js.
