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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializingRef = useRef(false);

  const isAuthenticated = !!user;
  const isAdmin = userProfile?.role === 'admin';

  // Force loading to false after timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('Auth loading timeout reached, forcing loading to false');
        setLoading(false);
      }, 10000); // 10 second timeout
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading]);

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
      // Prevent multiple simultaneous initializations
      if (initializingRef.current) {
        console.log('Auth: Initialization already in progress, skipping...');
        return;
      }
      
      initializingRef.current = true;
      try {
        console.log('Auth: Starting initialization...');
        
        // Get current session with more generous timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 15000)
        );
        
        const { data: { session: currentSession } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        console.log('Auth: Session obtained', { hasSession: !!currentSession });
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('Auth: User found, loading profile...');
          
          // Try to use stored profile for immediate display
          const stored = getStoredProfile();
          if (stored && stored.id === currentSession.user.id) {
            console.log('Auth: Using stored profile');
            setUserProfile(stored);
          }
          
          // Refresh profile in background with timeout
          try {
            const profilePromise = getUserProfile(currentSession.user.id, false);
            const profileTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
            );
            
            const profile = await Promise.race([
              profilePromise,
              profileTimeoutPromise
            ]) as UserProfile;
            
            console.log('Auth: Profile fetched successfully', { role: profile?.role });
            setUserProfile(profile);
            setStoredProfile(profile);
          } catch (error) {
            console.error('Auth: Profile fetch failed:', error);
            // If we have stored profile, keep using it
            if (!userProfile) {
              const stored = getStoredProfile();
              if (stored && stored.id === currentSession.user.id) {
                console.log('Auth: Falling back to stored profile');
                setUserProfile(stored);
              }
            }
          }
        } else {
          console.log('Auth: No user found');
          setUserProfile(null);
          setStoredProfile(null);
        }
      } catch (error) {
        console.error('Auth: Initialization error:', error);
        // On any error, try to use stored data if available
        const stored = getStoredProfile();
        if (stored) {
          console.log('Auth: Using stored profile after initialization error');
          setUserProfile(stored);
        }
      } finally {
        console.log('Auth: Initialization complete, setting loading to false');
        setLoading(false);
        initializingRef.current = false;
      }
    };

    // Add a small delay to ensure all contexts are ready
    setTimeout(initialize, 100);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth: State change:', event, { hasSession: !!newSession });
      
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_OUT') {
        console.log('Auth: User signed out');
        clearProfileCache();
        setStoredProfile(null);
        setUserProfile(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && newSession?.user) {
        console.log('Auth: User signed in');
        setLoading(true);
        
        // Clear any existing profile data
        setUserProfile(null);
        
        // Load new profile
        try {
          const profile = await getUserProfile(newSession.user.id, true);
          console.log('Auth: New profile loaded on sign in');
          setUserProfile(profile);
          setStoredProfile(profile);
        } catch (error) {
          console.error('Auth: Profile load failed on sign in:', error);
        } finally {
          setLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        // Only refresh if we don't have a profile or user changed
        if (!userProfile || userProfile.id !== newSession.user.id) {
          console.log('Auth: Refreshing profile after token refresh');
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