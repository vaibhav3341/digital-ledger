import { useEffect, useState } from 'react';
import { Transaction } from '../models/types';
import { listenTransactions } from '../services/firestore';

export default function useTransactions(coworkerId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coworkerId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenTransactions(
      coworkerId,
      (items) => {
        setTransactions(items);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, [coworkerId]);

  return { transactions, loading };
}
