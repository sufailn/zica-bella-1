"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
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
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple storage helpers
const STORAGE_KEY = 'zb_auth_profile';

const getStoredProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    
    // Check if stored data is still valid (6 hours)
    const age = Date.now() - parsed.timestamp;
    if (age > 6 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed.profile;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const setStoredProfile = (profile: UserProfile | null) => {
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
    console.warn('Failed to store profile:', error);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);
  const refreshingRef = useRef(false);

  const isAuthenticated = !!user;
  const isAdmin = userProfile?.role === 'admin';

  // Optimized profile refresh
  const refreshProfile = useCallback(async () => {
    if (!user || refreshingRef.current) return;
    
    refreshingRef.current = true;
    try {
      const profile = await getUserProfile(user.id, false);
      setUserProfile(profile);
      setStoredProfile(profile);
    } catch (error) {
      console.error('Profile refresh failed:', error);
      // Use stored profile as fallback
      const stored = getStoredProfile();
      if (stored && stored.id === user.id) {
        setUserProfile(stored);
      }
    } finally {
      refreshingRef.current = false;
    }
  }, [user]);

  // Initialize authentication state
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initialize = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Try to use stored profile for immediate display
          const stored = getStoredProfile();
          if (stored && stored.id === currentSession.user.id) {
            setUserProfile(stored);
          }
          
          // Refresh profile in background
          try {
            const profile = await getUserProfile(currentSession.user.id, false);
            setUserProfile(profile);
            setStoredProfile(profile);
          } catch (error) {
            console.error('Profile fetch failed:', error);
          }
        } else {
          setUserProfile(null);
          setStoredProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state change:', event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_OUT') {
        clearProfileCache();
        setStoredProfile(null);
        setUserProfile(null);
      } else if (event === 'SIGNED_IN' && newSession?.user) {
        // Clear any existing profile data
        setUserProfile(null);
        
        // Load new profile
        try {
          const profile = await getUserProfile(newSession.user.id, true);
          setUserProfile(profile);
          setStoredProfile(profile);
        } catch (error) {
          console.error('Profile load failed on sign in:', error);
        }
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        // Only refresh if we don't have a profile or user changed
        if (!userProfile || userProfile.id !== newSession.user.id) {
          await refreshProfile();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshProfile, userProfile]);

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
      setLoading(true);
      
      // Clear local state
      clearProfileCache();
      setStoredProfile(null);
      setUserProfile(null);
      
      // Sign out
      await signOut();
      
      // Reset state
      setUser(null);
      setSession(null);
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
        await refreshProfile();
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