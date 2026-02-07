# Shared Ledger App (React Native + Firebase)

A simple Android-first shared ledger app for small business payments. Owners can create coworkers, record payments, and see running balances. Coworkers can view their own ledger in near real-time. Firestore provides real-time sync and offline-first support.

## Quick Summary
- Roles: `OWNER`, `COWORKER`
- Firebase Auth: Phone OTP (minimal, Android-friendly)
- Firestore: realtime ledger sync + offline support
- Idempotent transactions: UUID `txnId` used as Firestore doc ID

## Project Structure
```
.
├── App.tsx
├── README.md
├── babel.config.js
├── firestore.indexes.json
├── firestore.rules
├── package.json
├── tsconfig.json
└── src
    ├── components
    │   ├── Button.tsx
    │   ├── CoworkerCard.tsx
    │   ├── EmptyState.tsx
    │   ├── Input.tsx
    │   └── LedgerItem.tsx
    ├── hooks
    │   ├── useAuth.ts
    │   ├── useCoworkers.ts
    │   ├── useOwnerBalances.ts
    │   └── useTransactions.ts
    ├── models
    │   └── types.ts
    ├── navigation
    │   └── RootNavigator.tsx
    ├── screens
    │   ├── AddEditTransactionScreen.tsx
    │   ├── AuthScreen.tsx
    │   ├── CoworkerDetailScreen.tsx
    │   ├── CoworkerLedgerScreen.tsx
    │   ├── InviteCoworkerScreen.tsx
    │   ├── JoinInviteScreen.tsx
    │   ├── LoadingScreen.tsx
    │   └── RoleSelectScreen.tsx
    ├── services
    │   ├── auth.ts
    │   ├── firestore.ts
    │   └── invites.ts
    ├── theme
    │   ├── colors.ts
    │   ├── spacing.ts
    │   └── typography.ts
    └── utils
        ├── balance.ts
        ├── format.ts
        └── uuid.ts
```

## Firestore Schema (MVP)

### `users/{uid}`
```
{
  uid: string,
  role: 'OWNER' | 'COWORKER',
  ownerId?: string,
  coworkerId?: string,
  name?: string,
  phone?: string,
  createdAt: Timestamp
}
```

### `owners/{ownerId}`
```
{
  ownerId: string,
  name: string,
  phone?: string,
  createdAt: Timestamp
}
```

### `coworkers/{coworkerId}`
```
{
  ownerId: string,
  coworkerUserId?: string | null,
  name: string,
  phone?: string,
  status: 'ACTIVE' | 'INACTIVE',
  createdAt: Timestamp
}
```

### `coworkers/{coworkerId}/transactions/{txnId}`
```
{
  txnId: string,
  ownerId: string,
  coworkerId: string,
  createdBy: string,
  timestamp: Timestamp,
  updatedAt?: Timestamp,
  amount: number,
  type: 'PAID_TO_COWORKER' | 'RECEIVED_FROM_COWORKER',
  note?: string,
  paymentMode?: string,
  referenceId?: string,
  isDeleted?: boolean
}
```

### `invites/{code}`
```
{
  code: string,
  ownerId: string,
  coworkerId: string,
  createdAt: Timestamp,
  status: 'ACTIVE' | 'USED' | 'EXPIRED',
  usedBy?: string,
  usedAt?: Timestamp
}
```

## Balance Rule
`balance = total_paid_to_coworker - total_received_from_coworker`

Balances are computed on the client by summing transactions, keeping the system idempotent and offline-safe. This is sufficient for small ledgers and avoids server complexity.

## Key Screens (React Native components)
- `AuthScreen`: Phone OTP login
- `RoleSelectScreen`: Choose Owner or Coworker
- `JoinInviteScreen`: Enter invite code
- `OwnerHomeScreen`: Coworker list + balances
- `CoworkerDetailScreen`: Owner ledger view + add/edit
- `AddEditTransactionScreen`: Add/edit/delete transactions
- `CoworkerLedgerScreen`: Coworker view-only ledger

## Firebase Security Rules
See `firestore.rules` in the repo. The rules enforce:
- Users can read/write their own profile
- Owner can read/write all their coworkers and transactions
- Coworker can read only their own ledger
- Coworker can claim invite only once

## Offline Support
Firestore on React Native (native SDK) provides offline persistence automatically. Writes queue when offline and sync when connectivity returns. The app uses realtime listeners (`onSnapshot`) for near-instant reflection.

## Idempotent Transaction Creation
Transactions use a UUID `txnId` as the Firestore document ID. Replays with the same `txnId` overwrite the same doc instead of creating duplicates.

## Setup (Recommended)
1. Create a Firebase project and enable **Authentication** (Phone).
2. Create a Firestore database in **production** mode.
3. Add your Android app and download `google-services.json`.
4. If you generate a new React Native project, copy this repo's `src/` and `App.tsx` into it and install dependencies from `package.json`.
5. Apply `firestore.rules` and `firestore.indexes.json` in the Firebase console.

Note: This repo provides the app source and Firebase rules. Native Android/iOS files should be generated using React Native CLI or Expo prebuild depending on your workflow.

## Optional Improvements (Later)
- Cached balance with Cloud Function
- Push notifications for new transactions
- Export to CSV/PDF
- Coworker confirmation flow
