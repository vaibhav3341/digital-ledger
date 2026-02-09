import React, { createContext, useContext, useMemo, useState } from 'react';
import { Transaction, TransactionType, UserRole } from '../models/types';
import { createUuid } from '../utils/uuid';
import { Timestamp } from 'firebase/firestore';

type DemoUser = {
  uid: string;
  role: UserRole;
  coworkerId?: string;
};

type DemoCoworker = {
  id: string;
  name: string;
};

type DemoState = {
  user: DemoUser | null;
  setRole: (role: UserRole) => void;
  signOut: () => void;

  coworkers: DemoCoworker[];
  transactionsByCoworker: Record<string, Transaction[]>;

  addTransaction: (params: {
    coworkerId: string;
    amount: number;
    type: TransactionType;
    note?: string;
    paymentMode?: string;
    referenceId?: string;
    txnId?: string;
  }) => string;

  updateTransaction: (params: {
    coworkerId: string;
    txnId: string;
    updates: Partial<Pick<Transaction, 'amount' | 'type' | 'note' | 'paymentMode' | 'referenceId'>>;
  }) => void;

  deleteTransaction: (params: { coworkerId: string; txnId: string }) => void;
};

const DemoContext = createContext<DemoState | null>(null);

function seedData(): { coworkers: DemoCoworker[]; transactionsByCoworker: Record<string, Transaction[]> } {
  const ownerId = 'demo-owner';
  const coworkers: DemoCoworker[] = [
    { id: 'c1', name: 'Rahul' },
    { id: 'c2', name: 'Sana' },
  ];

  const mkTxn = (coworkerId: string, params: { amount: number; type: TransactionType; note?: string }) => {
    const id = createUuid();
    return {
      txnId: id,
      ownerId,
      coworkerId,
      createdBy: ownerId,
      timestamp: Timestamp.fromDate(new Date(Date.now() - Math.floor(Math.random() * 6) * 24 * 3600 * 1000)),
      amount: params.amount,
      type: params.type,
      note: params.note || null,
      paymentMode: null,
      referenceId: null,
      isDeleted: false,
    } as Transaction;
  };

  const transactionsByCoworker: Record<string, Transaction[]> = {
    c1: [mkTxn('c1', { amount: 500, type: 'PAID_TO_COWORKER', note: 'Advance' })],
    c2: [
      mkTxn('c2', { amount: 300, type: 'PAID_TO_COWORKER', note: 'Tools' }),
      mkTxn('c2', { amount: 100, type: 'RECEIVED_FROM_COWORKER', note: 'Returned' }),
    ],
  };

  return { coworkers, transactionsByCoworker };
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const seed = useMemo(() => seedData(), []);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [coworkers] = useState(seed.coworkers);
  const [transactionsByCoworker, setTransactionsByCoworker] = useState<Record<string, Transaction[]>>(
    seed.transactionsByCoworker,
  );

  const setRole = (role: UserRole) => {
    if (role === 'OWNER') {
      setUser({ uid: 'demo-owner', role: 'OWNER' });
    } else {
      setUser({ uid: 'demo-coworker', role: 'COWORKER', coworkerId: 'c1' });
    }
  };

  const signOut = () => setUser(null);

  const addTransaction: DemoState['addTransaction'] = (params) => {
    const ownerId = 'demo-owner';
    const txnId = params.txnId || createUuid();
    const nextTxn: Transaction = {
      txnId,
      ownerId,
      coworkerId: params.coworkerId,
      createdBy: ownerId,
      timestamp: Timestamp.fromDate(new Date()),
      amount: params.amount,
      type: params.type,
      note: params.note || null,
      paymentMode: params.paymentMode || null,
      referenceId: params.referenceId || null,
      isDeleted: false,
    };

    setTransactionsByCoworker((prev) => {
      const prevList = prev[params.coworkerId] || [];
      return {
        ...prev,
        [params.coworkerId]: [nextTxn, ...prevList],
      };
    });

    return txnId;
  };

  const updateTransaction: DemoState['updateTransaction'] = ({ coworkerId, txnId, updates }) => {
    setTransactionsByCoworker((prev) => {
      const list = prev[coworkerId] || [];
      return {
        ...prev,
        [coworkerId]: list.map((t) => (t.txnId === txnId ? { ...t, ...updates } : t)),
      };
    });
  };

  const deleteTransaction: DemoState['deleteTransaction'] = ({ coworkerId, txnId }) => {
    setTransactionsByCoworker((prev) => {
      const list = prev[coworkerId] || [];
      return {
        ...prev,
        [coworkerId]: list.filter((t) => t.txnId !== txnId),
      };
    });
  };

  const value: DemoState = {
    user,
    setRole,
    signOut,
    coworkers,
    transactionsByCoworker,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error(
      'useDemo must be used within DemoProvider. ' +
        'This usually means Expo is not running from the expo-app/ folder or you are seeing a cached bundle. ' +
        'Fix: stop Expo, run `cd expo-app && npx expo start --tunnel --clear`, then reload the app in Expo Go.',
    );
  }
  return ctx;
}
