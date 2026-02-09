import Constants from 'expo-constants';

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

export const firebaseConfig =
  (Constants.expoConfig?.extra?.firebase as FirebaseWebConfig | undefined) ||
  (Constants.manifest?.extra?.firebase as FirebaseWebConfig | undefined);

const isPlaceholder = (value?: string) =>
  !value || value.startsWith('YOUR_') || value.includes('YOUR_PROJECT');

export const firebaseEnabled = Boolean(
  firebaseConfig?.apiKey &&
    firebaseConfig?.projectId &&
    !isPlaceholder(firebaseConfig.apiKey) &&
    !isPlaceholder(firebaseConfig.projectId),
);
