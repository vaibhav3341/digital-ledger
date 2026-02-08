import {
  ApplicationVerifier,
  ConfirmationResult,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

export async function sendOtp(
  phoneNumber: string,
  verifier: ApplicationVerifier,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
}

export async function confirmOtp(confirmation: ConfirmationResult, code: string) {
  return confirmation.confirm(code);
}

export function signOut() {
  return auth.signOut();
}

export async function signInOrSignUpWithEmail(
  email: string,
  password: string,
) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'auth/user-not-found') {
      return createUserWithEmailAndPassword(auth, email, password);
    }
    throw error;
  }
}
