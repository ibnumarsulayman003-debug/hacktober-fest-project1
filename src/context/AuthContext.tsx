import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { api, setApiAuthToken } from '../services/api.ts';
import { UserProfile, HealthPreference } from '../types/index.ts';

interface AuthUser {
  uid: string;
  email: string;
  displayName?: string | null;
  photoUrl?: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  health: HealthPreference | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInDemoGuest: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileState: (profile: UserProfile, health: HealthPreference) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'nourishtrack_demo_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [health, setHealth] = useState<HealthPreference | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile after token is set
  const syncAndLoadUser = async () => {
    try {
      await api.syncUser();
      const res = await api.getProfile();
      setProfile(res.profile);
      setHealth(res.health);
    } catch (err) {
      console.error('Error syncing user profile:', err);
    }
  };

  useEffect(() => {
    // Check if there was an active demo session saved in sessionStorage
    const savedDemo = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setApiAuthToken(parsed.token);
        setUser(parsed.user);
        syncAndLoadUser().finally(() => setLoading(false));
        return;
      } catch (e) {
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
      }
    }

    const unsubscribe = auth.onAuthStateChanged(async (fbUser: User | null) => {
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          setApiAuthToken(token);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'NourishTrack Member',
            photoUrl: fbUser.photoURL,
            isDemo: false,
          });
          await syncAndLoadUser();
        } catch (error) {
          console.error('Error establishing Firebase session:', error);
        }
      } else if (!sessionStorage.getItem(DEMO_STORAGE_KEY)) {
        setApiAuthToken(null);
        setUser(null);
        setProfile(null);
        setHealth(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      setApiAuthToken(token);
      setUser({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName,
        photoUrl: result.user.photoURL,
        isDemo: false,
      });
      await syncAndLoadUser();
    } catch (err: any) {
      console.error('Sign in with Google error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInDemoGuest = async () => {
    setLoading(true);
    try {
      const demoId = Math.random().toString(36).substring(2, 9);
      const demoToken = `demo-session-${demoId}`;
      const demoUser: AuthUser = {
        uid: `demo_${demoId}`,
        email: `guest_${demoId}@nourishtrack.app`,
        displayName: 'Guest Explorer',
        photoUrl: null,
        isDemo: true,
      };

      setApiAuthToken(demoToken);
      sessionStorage.setItem(
        DEMO_STORAGE_KEY,
        JSON.stringify({ token: demoToken, user: demoUser })
      );
      setUser(demoUser);
      await syncAndLoadUser();
    } catch (err: any) {
      console.error('Demo sign in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
    setApiAuthToken(null);
    setUser(null);
    setProfile(null);
    setHealth(null);
    try {
      await fbSignOut(auth);
    } catch (err) {
      // ignore
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const res = await api.getProfile();
      setProfile(res.profile);
      setHealth(res.health);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateProfileState = (newProfile: UserProfile, newHealth: HealthPreference) => {
    setProfile(newProfile);
    setHealth(newHealth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        health,
        loading,
        signInWithGoogle,
        signInDemoGuest,
        logout,
        refreshProfile,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
