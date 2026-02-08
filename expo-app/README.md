# Shared Ledger App (Expo + Firebase Web SDK)

This folder contains an Expo-compatible version of the Shared Ledger app. It runs in Expo Go without native installs and uses the Firebase Web SDK.

## Quick Start (Codespace)
```bash
cd expo-app
npm install
npx expo start --tunnel
```
Then open **Expo Go** on your phone and scan the QR code from the terminal.

## Configure Firebase
1. Create a Firebase project.
2. Enable **Authentication → Phone** (and optionally Email/Password as a fallback).
3. Create a **Firestore** database.
4. Copy your Firebase Web config into `expo-app/app.json` under `expo.extra.firebase`.

Example:
```json
"extra": {
  "firebase": {
    "apiKey": "...",
    "authDomain": "...",
    "projectId": "...",
    "storageBucket": "...",
    "messagingSenderId": "...",
    "appId": "..."
  }
}
```

## Firestore Rules
Use the rules in the repo root at `firestore.rules`.

## Notes About Offline
The Firebase Web SDK in Expo Go does not provide full offline persistence like the native SDK. Writes will sync when online, but they are not guaranteed to survive app restarts. If you need **full offline persistence**, use a custom Expo development build with React Native Firebase (native modules), or add an offline persistence polyfill.

## Phone Auth Note
Firebase's JS SDK does not officially support phone auth in React Native, so OTP may be unreliable in some environments. This app includes an **Email/Password fallback** on the login screen to keep you moving if OTP fails.

## Screens
- Owner: coworker list, ledger detail, add/edit/delete
- Coworker: view-only ledger
- Invite flow: owner generates code, coworker joins
