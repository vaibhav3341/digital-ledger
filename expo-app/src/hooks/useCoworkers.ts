import { useEffect, useState } from 'react';
import { Coworker } from '../models/types';
import { listenCoworkers } from '../services/firestore';

export default function useCoworkers(ownerId?: string) {
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) {
      setCoworkers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenCoworkers(
      ownerId,
      (items) => {
        setCoworkers(items);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, [ownerId]);

  return { coworkers, loading };
}
