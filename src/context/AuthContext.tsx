import React, { createContext, useContext, useEffect, useState } from 'react';
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

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeSnapshot = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as SyncedUserData;
          setCloudData(data);
          setCloudSynced(true);
        } else {
          // Document does not exist yet on cloud, we keep cloudSynced true
          setCloudSynced(true);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        setCloudSynced(false);
      }
    );

    return () => unsubscribeSnapshot();
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
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      setCloudSynced(false);
    }
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
