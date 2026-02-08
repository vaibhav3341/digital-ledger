import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { Coworker, Transaction, TransactionType } from '../models/types';
import { createUuid } from '../utils/uuid';
import { generateInviteCode } from './invites';
import { db } from './firebase';

function requireDb() {
  if (!db) {
    throw new Error('Firebase not configured.');
  }
  return db;
}

export async function createOwnerProfile(params: {
  uid: string;
  name: string;
  phone?: string;
}) {
  const dbx = requireDb();
  const { uid, name, phone } = params;
  const now = serverTimestamp();

  const batch = writeBatch(dbx);
  const userRef = doc(dbx, 'users', uid);
  const ownerRef = doc(dbx, 'owners', uid);

  batch.set(userRef, {
    uid,
    role: 'OWNER',
    name,
    phone: phone || null,
    createdAt: now,
  });

  batch.set(ownerRef, {
    ownerId: uid,
    name,
    phone: phone || null,
    createdAt: now,
  });

  await batch.commit();
}

export async function createCoworker(params: {
  ownerId: string;
  name: string;
  phone?: string;
}) {
  const dbx = requireDb();
  const { ownerId, name, phone } = params;
  const now = serverTimestamp();
  const coworkerRef = doc(collection(dbx, 'coworkers'));
  const coworkerId = coworkerRef.id;
  const inviteCode = generateInviteCode();
  const inviteRef = doc(dbx, 'invites', inviteCode);

  const batch = writeBatch(dbx);
  batch.set(coworkerRef, {
    ownerId,
    name,
    phone: phone || null,
    status: 'ACTIVE',
    coworkerUserId: null,
    createdAt: now,
  });

  batch.set(inviteRef, {
    code: inviteCode,
    ownerId,
    coworkerId,
    createdAt: now,
    status: 'ACTIVE',
  });

  await batch.commit();

  return { coworkerId, inviteCode };
}

export async function claimInvite(params: {
  code: string;
  uid: string;
  name: string;
  phone?: string;
}) {
  const dbx = requireDb();
  const { code, uid, name, phone } = params;
  const inviteRef = doc(dbx, 'invites', code);
  const inviteSnap = await getDoc(inviteRef);

  if (!inviteSnap.exists()) {
    throw new Error('Invite code not found.');
  }

  const invite = inviteSnap.data();
  if (!invite || invite.status !== 'ACTIVE' || invite.usedBy) {
    throw new Error('Invite code is no longer active.');
  }

  const coworkerRef = doc(dbx, 'coworkers', invite.coworkerId);
  const userRef = doc(dbx, 'users', uid);
  const now = serverTimestamp();

  const batch = writeBatch(dbx);
  batch.update(inviteRef, {
    status: 'USED',
    usedBy: uid,
    usedAt: now,
  });
  batch.update(coworkerRef, {
    coworkerUserId: uid,
  });
  batch.set(userRef, {
    uid,
    role: 'COWORKER',
    ownerId: invite.ownerId,
    coworkerId: invite.coworkerId,
    name,
    phone: phone || null,
    createdAt: now,
  });

  await batch.commit();
}

export async function createTransaction(params: {
  ownerId: string;
  coworkerId: string;
  createdBy: string;
  amount: number;
  type: TransactionType;
  note?: string;
  paymentMode?: string;
  referenceId?: string;
  timestamp?: Date;
  txnId?: string;
}) {
  requireDb();
  const {
    ownerId,
    coworkerId,
    createdBy,
    amount,
    type,
    note,
    paymentMode,
    referenceId,
    timestamp,
    txnId,
  } = params;

  const id = txnId || createUuid();
  const ref = doc(requireDb(), 'coworkers', coworkerId, 'transactions', id);

  const payload: Transaction = {
    txnId: id,
    ownerId,
    coworkerId,
    createdBy,
    timestamp: Timestamp.fromDate(timestamp || new Date()),
    amount,
    type,
    note: note || null,
    paymentMode: paymentMode || null,
    referenceId: referenceId || null,
    isDeleted: false,
  };

  await setDoc(ref, payload, { merge: false });
  return id;
}

export async function updateTransaction(params: {
  coworkerId: string;
  txnId: string;
  updates: Partial<Omit<Transaction, 'txnId' | 'ownerId' | 'coworkerId' | 'createdBy'>>;
}) {
  requireDb();
  const { coworkerId, txnId, updates } = params;
  const ref = doc(requireDb(), 'coworkers', coworkerId, 'transactions', txnId);

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTransaction(params: {
  coworkerId: string;
  txnId: string;
}) {
  requireDb();
  const { coworkerId, txnId } = params;
  const ref = doc(requireDb(), 'coworkers', coworkerId, 'transactions', txnId);

  await updateDoc(ref, {
    isDeleted: true,
    updatedAt: serverTimestamp(),
  });
}

export function listenCoworkers(
  ownerId: string,
  onChange: (data: Coworker[]) => void,
  onError: (error: Error) => void,
) {
  const dbx = requireDb();
  const q = query(
    collection(dbx, 'coworkers'),
    where('ownerId', '==', ownerId),
    orderBy('name'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Coworker, 'id'>),
      }));
      onChange(items);
    },
    (error) => onError(error),
  );
}

export function listenTransactions(
  coworkerId: string,
  onChange: (data: Transaction[]) => void,
  onError: (error: Error) => void,
) {
  const dbx = requireDb();
  const q = query(
    collection(dbx, 'coworkers', coworkerId, 'transactions'),
    orderBy('timestamp', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs
        .map((docSnap) => ({
          ...(docSnap.data() as Transaction),
          txnId: docSnap.id,
        }))
        .filter((txn) => !txn.isDeleted);
      onChange(items);
    },
    (error) => onError(error),
  );
}

export function listenOwnerBalances(
  ownerId: string,
  onChange: (data: Record<string, { balance: number; lastActivity: Date | null }>) => void,
  onError: (error: Error) => void,
) {
  const dbx = requireDb();
  const q = query(
    collectionGroup(dbx, 'transactions'),
    where('ownerId', '==', ownerId),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const next: Record<string, { balance: number; lastActivity: Date | null }> = {};
      snapshot.docs.forEach((docSnap) => {
        const txn = docSnap.data() as Transaction;
        if (txn.isDeleted) {
          return;
        }
        const delta = txn.type === 'PAID_TO_COWORKER' ? txn.amount : -txn.amount;
        const existing = next[txn.coworkerId] || { balance: 0, lastActivity: null };
        const ts = txn.timestamp?.toDate ? txn.timestamp.toDate() : null;
        const lastActivity =
          ts && (!existing.lastActivity || ts > existing.lastActivity)
            ? ts
            : existing.lastActivity;
        next[txn.coworkerId] = {
          balance: existing.balance + delta,
          lastActivity,
        };
      });
      onChange(next);
    },
    (error) => onError(error),
  );
}
