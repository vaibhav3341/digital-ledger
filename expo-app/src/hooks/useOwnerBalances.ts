import { useEffect, useMemo, useState } from 'react';
import { listenOwnerBalances } from '../services/firestore';

interface BalanceInfo {
  balance: number;
  lastActivity?: Date | null;
}

export default function useOwnerBalances(ownerId?: string) {
  const [balances, setBalances] = useState<Record<string, BalanceInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) {
      setBalances({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenOwnerBalances(
      ownerId,
      (next) => {
        setBalances(next);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, [ownerId]);

  return useMemo(() => ({ balances, loading }), [balances, loading]);
}
