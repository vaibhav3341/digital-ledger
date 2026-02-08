import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../models/types';
import { firebaseEnabled } from '../services/env';

export default function useAuth() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setAuthUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (!user) {
        setProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    if (!db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, 'users', authUser.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [authUser]);

  return {
    authUser,
    profile,
    loading,
  };
}
