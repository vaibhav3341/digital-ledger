import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, firebaseEnabled } from './env';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (firebaseEnabled && firebaseConfig) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  // Expo Go + Firebase JS SDK: keep auth init simple to avoid platform-specific modules.
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
