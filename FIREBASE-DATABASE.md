# Keep ALL data in Firebase (Firestore) - players, scores, claims, messages, winners

## 1. Create the database (once)
Firebase console -> your project squardgames -> Build -> **Firestore Database** -> Create database
-> Standard / production mode -> location: asia-south1 (Mumbai) -> Enable.

## 2. Get the key file (once)
Project settings (gear icon) -> **Service accounts** -> Generate new private key -> a .json file downloads.
NEVER upload this file to GitHub. Keep it only on your computer.

## 3. Turn the key into one line (Windows PowerShell)
    [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\your-key.json")) | Set-Clipboard
(the text is now copied)

## 4. Give it to Render
Render -> your service -> Environment -> add   FIREBASE_SA = (paste)   -> Save. Render redeploys.

## 5. Check
Render -> Logs must say:   Storage: Firestore. Loaded players: ...
Free Spark plan limits (50k reads / 20k writes per day) are enough for this design:
the server loads data once at start and saves in the background every ~20 seconds when something changed.
