import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, disableNetwork, enableNetwork } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without providing firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// If daily quota was already reached today, switch immediately to offline cache mode
// to prevent initial connection attempts from triggering quota-exhausted errors
if (typeof window !== 'undefined') {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('marketsense_fs_quota_day') === today) {
      disableNetwork(db).catch(() => {});
    }
  } catch {
    // Ignore
  }
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errCode = (error as any)?.code || '';
  const errMsg = error instanceof Error ? error.message : String(error);
  const isQuota = errCode === 'resource-exhausted' || errMsg.includes('Quota limit exceeded');

  const errInfo: FirestoreErrorInfo = {
    error: isQuota 
      ? 'Firestore free tier daily quota reached. Switched gracefully to local storage offline mode.'
      : (error instanceof Error ? error.message : String(error)),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  if (isQuota) {
    console.info('Firestore Notice: Free tier quota reached. Using local storage cache.');
  } else {
    console.warn('Firestore Notice: ', JSON.stringify(errInfo));
  }
  return errInfo;
}

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  disableNetwork,
  enableNetwork
};
export type { User };
