import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, firebaseEnabled } from './env';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (firebaseEnabled && firebaseConfig) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (_error) {
    auth = getAuth(app);
  }

  db = getFirestore(app);
}

export { app, auth, db };
