import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  onSnapshot,
  disableNetwork,
  handleFirestoreError,
  OperationType,
  User,
} from '../lib/firebase';

export interface SyncedUserData {
  keyTickers: string[];
  activeProfileId: string;
  customPrices: Record<string, { price: string; change: string; isPositive: boolean }>;
  customProfiles?: Array<{
    id: string;
    name: string;
    description: string;
    ownerLabel: string;
    accentColor: string;
    assetTickers: string[];
    telegramConfig?: { target: string };
  }>;
}

const getTodayUtcString = () => new Date().toISOString().slice(0, 10);

const getCachedCloudData = (uid: string): SyncedUserData | null => {
  try {
    const saved = localStorage.getItem(`marketsense_cached_cloud_data_${uid}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const setCachedCloudData = (uid: string, data: Partial<SyncedUserData>) => {
  try {
    const current = getCachedCloudData(uid) || { keyTickers: [], activeProfileId: 'user-main', customPrices: {} };
    const updated = { ...current, ...data };
    localStorage.setItem(`marketsense_cached_cloud_data_${uid}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to cache cloud data locally', e);
  }
};

interface AuthContextType {
  currentUser: (User | { uid: string; displayName: string | null; email: string | null; photoURL: string | null }) | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  authError: string | null;
  authErrorCode: string | null;
  clearAuthError: () => void;
  cloudSynced: boolean;
  loginWithGoogle: () => Promise<void>;
  enableLocalProfile: (name?: string) => void;
  logout: () => Promise<void>;
  saveUserDataToCloud: (data: Partial<SyncedUserData>) => Promise<void>;
  cloudData: SyncedUserData | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<(User | { uid: string; displayName: string | null; email: string | null; photoURL: string | null }) | null>(() => {
    try {
      const savedLocal = localStorage.getItem('marketsense_local_user');
      return savedLocal ? JSON.parse(savedLocal) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [cloudData, setCloudData] = useState<SyncedUserData | null>(null);

  const isQuotaExceededRef = useRef<boolean>(false);
  const lastSavedPayloadRef = useRef<string>('');
  const saveDebounceTimeoutRef = useRef<any>(null);

  useEffect(() => {
    try {
      const today = getTodayUtcString();
      if (localStorage.getItem('marketsense_fs_quota_day') === today) {
        isQuotaExceededRef.current = true;
        disableNetwork(db).catch(() => {});
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.removeItem('marketsense_local_user');
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore changes in real-time when user is logged in with real Firebase Auth
  useEffect(() => {
    if (!currentUser || currentUser.uid.startsWith('local-')) {
      if (!currentUser) {
        setCloudData(null);
        setCloudSynced(false);
      }
      return;
    }

    // Always immediately load cached data so the UI is responsive and data is preserved
    const cached = getCachedCloudData(currentUser.uid);
    if (cached) {
      setCloudData(cached);
      setCloudSynced(true);
    }

    // If quota was already marked as exceeded today, skip onSnapshot and disable network
    // to prevent continuous retry backoff loops
    const today = getTodayUtcString();
    if (isQuotaExceededRef.current || localStorage.getItem('marketsense_fs_quota_day') === today) {
      isQuotaExceededRef.current = true;
      disableNetwork(db).catch(() => {});
      setCloudSynced(true);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    let isUnsubscribed = false;
    let unsubscribeSnapshot: (() => void) | null = null;

    try {
      unsubscribeSnapshot = onSnapshot(
        userDocRef,
        (snapshot) => {
          if (isUnsubscribed) return;
          if (snapshot.exists()) {
            const data = snapshot.data() as SyncedUserData;
            setCloudData(data);
            setCachedCloudData(currentUser.uid, data);
            setCloudSynced(true);
          } else {
            setCloudSynced(true);
          }
        },
        (error: any) => {
          if (isUnsubscribed) return;
          const errCode = error?.code || '';
          const errMsg = error?.message || '';
          if (errCode === 'resource-exhausted' || errMsg.includes('Quota limit exceeded')) {
            try {
              localStorage.setItem('marketsense_fs_quota_day', getTodayUtcString());
            } catch {
              // Ignore
            }
            isQuotaExceededRef.current = true;
            isUnsubscribed = true;
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            disableNetwork(db).catch(() => {});
            setCloudSynced(true);
            return;
          }
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          setCloudSynced(false);
        }
      );
    } catch {
      setCloudSynced(true);
    }

    return () => {
      isUnsubscribed = true;
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [currentUser]);

  const clearAuthError = () => {
    setAuthError(null);
    setAuthErrorCode(null);
  };

  const enableLocalProfile = (customName?: string) => {
    const localUser = {
      uid: `local-${Date.now()}`,
      displayName: customName || 'Mi Cartera',
      email: null,
      photoURL: null,
    };
    setCurrentUser(localUser);
    localStorage.setItem('marketsense_local_user', JSON.stringify(localUser));
    clearAuthError();
  };

  const loginWithGoogle = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    setAuthErrorCode(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Firebase Auth Sign-In Error:', error);
      const code = error?.code || '';
      setAuthErrorCode(code);
      let friendlyMessage = 'No se pudo iniciar sesión con Google.';
      
      if (code === 'auth/unauthorized-domain') {
        friendlyMessage = 'Dominio web no autorizado en Firebase. Para habilitar el inicio de sesión en este dominio, debes añadirlo en Firebase Console -> Authentication -> Settings -> Authorized Domains.';
      } else if (code === 'auth/popup-blocked') {
        friendlyMessage = 'El navegador bloqueó la ventana emergente de Google. Pulsa en la barra de direcciones de tu navegador para permitir las ventanas emergentes (pop-ups) e inténtalo de nuevo.';
      } else if (code === 'auth/popup-closed-by-user') {
        friendlyMessage = 'La ventana de inicio de sesión fue cerrada antes de completar la verificación.';
      } else if (code === 'auth/cancelled-popup-request') {
        friendlyMessage = 'Ya hay una solicitud de inicio de sesión en curso en este momento.';
      } else if (error?.message) {
        friendlyMessage = `Aviso de Google: ${error.message}`;
      }

      setAuthError(friendlyMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('marketsense_local_user');
      if (auth.currentUser) {
        await signOut(auth);
      }
      setCurrentUser(null);
      setCloudData(null);
      setCloudSynced(false);
    } catch (error) {
      console.warn('Error during sign-out:', error);
    }
  };

  const saveUserDataToCloud = async (data: Partial<SyncedUserData>) => {
    if (!currentUser) return;

    // 1. Immediately cache in local storage to guarantee data permanence
    setCachedCloudData(currentUser.uid, data);

    // 2. Prevent redundant writes of unchanged payloads
    const payloadKey = JSON.stringify(data);
    if (lastSavedPayloadRef.current === payloadKey) {
      return;
    }
    lastSavedPayloadRef.current = payloadKey;

    // 3. If local user or quota was marked exceeded today, maintain local sync smoothly
    const today = getTodayUtcString();
    if (
      currentUser.uid.startsWith('local-') ||
      isQuotaExceededRef.current ||
      localStorage.getItem('marketsense_fs_quota_day') === today
    ) {
      setCloudSynced(true);
      return;
    }

    // 4. Debounce write to Firestore by 400ms to consolidate rapid state changes
    if (saveDebounceTimeoutRef.current) {
      clearTimeout(saveDebounceTimeoutRef.current);
    }

    saveDebounceTimeoutRef.current = setTimeout(async () => {
      const path = `users/${currentUser.uid}`;
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          {
            ...data,
            userId: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        setCloudSynced(true);
      } catch (error: any) {
        const errCode = error?.code || '';
        const errMsg = error?.message || '';
        if (errCode === 'resource-exhausted' || errMsg.includes('Quota limit exceeded')) {
          try {
            localStorage.setItem('marketsense_fs_quota_day', getTodayUtcString());
          } catch {
            // Ignore
          }
          isQuotaExceededRef.current = true;
          disableNetwork(db).catch(() => {});
          setCloudSynced(true);
          return;
        }
        handleFirestoreError(error, OperationType.WRITE, path);
        setCloudSynced(false);
      }
    }, 400);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isLoggingIn,
        authError,
        authErrorCode,
        clearAuthError,
        cloudSynced,
        loginWithGoogle,
        enableLocalProfile,
        logout,
        saveUserDataToCloud,
        cloudData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
