import { Timestamp } from 'firebase/firestore';

export type UserRole = 'OWNER' | 'COWORKER';

export type TransactionType = 'PAID_TO_COWORKER' | 'RECEIVED_FROM_COWORKER';

export type CoworkerStatus = 'ACTIVE' | 'INACTIVE';

export interface UserProfile {
  uid: string;
  role: UserRole;
  ownerId?: string;
  coworkerId?: string;
  name?: string;
  phone?: string | null;
  createdAt: Timestamp;
}

export interface Coworker {
  id: string;
  ownerId: string;
  coworkerUserId?: string | null;
  name: string;
  phone?: string | null;
  status: CoworkerStatus;
  createdAt: Timestamp;
}

export interface Transaction {
  txnId: string;
  ownerId: string;
  coworkerId: string;
  createdBy: string;
  timestamp: Timestamp;
  updatedAt?: Timestamp;
  amount: number;
  type: TransactionType;
  note?: string | null;
  paymentMode?: string | null;
  referenceId?: string | null;
  isDeleted?: boolean;
}

export interface Invite {
  code: string;
  ownerId: string;
  coworkerId: string;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  usedBy?: string;
  usedAt?: Timestamp;
}
