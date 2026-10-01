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
  currentUser: User | null;
  isLoading: boolean;
  cloudSynced: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveUserDataToCloud: (data: Partial<SyncedUserData>) => Promise<void>;
  cloudData: SyncedUserData | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [cloudData, setCloudData] = useState<SyncedUserData | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore changes in real-time when user is logged in
  useEffect(() => {
    if (!currentUser) {
      setCloudData(null);
      setCloudSynced(false);
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

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.warn('Google sign-in was cancelled or encountered an issue:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
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
        cloudSynced,
        loginWithGoogle,
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
