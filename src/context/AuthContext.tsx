"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile, getUserProfile, signIn, signUp, signOut, clearProfileCache } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  register: (email: string, password: string, metadata?: any) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: any }>;
  refreshProfile: (currentUser?: User | null, skipCache?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simplified storage helpers
const STORAGE_KEY = 'zb_auth_state';

const getStoredAuthState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    
    // Check if stored data is still valid (24 hours)
    const age = Date.now() - parsed.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed.profile;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const setStoredAuthState = (profile: UserProfile | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profile,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to store auth state:', error);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializingRef = useRef(false);

  const isAuthenticated = !!user;
  const isAdmin = userProfile?.role === 'admin';

  // Simplified profile refresh
  const refreshProfile = async (currentUser?: User | null, skipCache = false) => {
    const userToCheck = currentUser ?? user;
    if (!userToCheck) {
      setUserProfile(null);
      setStoredAuthState(null);
      return;
    }

    try {
      const profile = await getUserProfile(userToCheck.id, !skipCache);
      setUserProfile(profile);
      setStoredAuthState(profile);
    } catch (error) {
      console.error('Profile refresh failed:', error);
      // Try to use stored profile as fallback
      const stored = getStoredAuthState();
      if (stored && stored.id === userToCheck.id) {
        setUserProfile(stored);
      }
    }
  };

  // Initialize authentication state
  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    const initialize = async () => {
      try {
        // Load stored profile immediately for quick UI feedback
        const storedProfile = getStoredAuthState();
        if (storedProfile) {
          setUserProfile(storedProfile);
        }

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setStoredAuthState(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Refresh profile in background, but use stored one for immediate display
          await refreshProfile(session.user, false);
        } else {
          setUserProfile(null);
          setStoredAuthState(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);
      
      setSession(session);
      setUser(session?.user ?? null);

      switch (event) {
        case 'SIGNED_OUT':
          clearProfileCache();
          setStoredAuthState(null);
          setUserProfile(null);
          break;
          
        case 'SIGNED_IN':
          if (session?.user) {
            await refreshProfile(session.user, true);
          }
          break;
          
        case 'TOKEN_REFRESHED':
          // Only refresh profile if user changed
          if (session?.user && (!userProfile || userProfile.id !== session.user.id)) {
            await refreshProfile(session.user, false);
          }
          break;
          
        default:
          if (session?.user) {
            await refreshProfile(session.user, false);
          } else {
            setUserProfile(null);
            setStoredAuthState(null);
          }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const register = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await signUp(email, password, metadata);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    try {
      // Clear all local state first
      setLoading(true);
      clearProfileCache();
      setStoredAuthState(null);
      setUserProfile(null);
      
      // Then sign out from Supabase
      await signOut();
      
      // Force clear all state
      setUser(null);
      setSession(null);
      
      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        clearProfileCache(user.id);
        await refreshProfile(user, true);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    isAdmin,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 