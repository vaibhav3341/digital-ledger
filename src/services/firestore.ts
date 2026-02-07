import firestore from '@react-native-firebase/firestore';
import { Transaction, TransactionType } from '../models/types';
import { createUuid } from '../utils/uuid';
import { generateInviteCode } from './invites';

const db = firestore();

export async function createOwnerProfile(params: {
  uid: string;
  name: string;
  phone?: string;
}) {
  const { uid, name, phone } = params;
  const now = firestore.FieldValue.serverTimestamp();
  const batch = db.batch();

  const userRef = db.collection('users').doc(uid);
  const ownerRef = db.collection('owners').doc(uid);

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
  const { ownerId, name, phone } = params;
  const now = firestore.FieldValue.serverTimestamp();
  const coworkerRef = db.collection('coworkers').doc();
  const coworkerId = coworkerRef.id;
  const inviteCode = generateInviteCode();
  const inviteRef = db.collection('invites').doc(inviteCode);

  const batch = db.batch();
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
  const { code, uid, name, phone } = params;
  const inviteRef = db.collection('invites').doc(code);
  const inviteSnap = await inviteRef.get();

  if (!inviteSnap.exists) {
    throw new Error('Invite code not found.');
  }

  const invite = inviteSnap.data();
  if (!invite || invite.status !== 'ACTIVE' || invite.usedBy) {
    throw new Error('Invite code is no longer active.');
  }

  const coworkerRef = db.collection('coworkers').doc(invite.coworkerId);
  const userRef = db.collection('users').doc(uid);
  const now = firestore.FieldValue.serverTimestamp();

  const batch = db.batch();
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
  const ref = db
    .collection('coworkers')
    .doc(coworkerId)
    .collection('transactions')
    .doc(id);

  const payload: Transaction = {
    txnId: id,
    ownerId,
    coworkerId,
    createdBy,
    timestamp: firestore.Timestamp.fromDate(timestamp || new Date()),
    amount,
    type,
    note: note || null,
    paymentMode: paymentMode || null,
    referenceId: referenceId || null,
    isDeleted: false,
  };

  await ref.set(payload, { merge: false });
  return id;
}

export async function updateTransaction(params: {
  coworkerId: string;
  txnId: string;
  updates: Partial<Omit<Transaction, 'txnId' | 'ownerId' | 'coworkerId' | 'createdBy'>>;
}) {
  const { coworkerId, txnId, updates } = params;
  const ref = db
    .collection('coworkers')
    .doc(coworkerId)
    .collection('transactions')
    .doc(txnId);

  await ref.update({
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function deleteTransaction(params: {
  coworkerId: string;
  txnId: string;
}) {
  const { coworkerId, txnId } = params;
  const ref = db
    .collection('coworkers')
    .doc(coworkerId)
    .collection('transactions')
    .doc(txnId);

  await ref.update({
    isDeleted: true,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}
