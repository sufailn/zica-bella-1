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

// Local storage keys for persistence
const STORAGE_KEYS = {
  USER_PROFILE: 'zb_user_profile',
  USER_ID: 'zb_user_id',
  SESSION_TIMESTAMP: 'zb_session_timestamp',
} as const;

// Helper functions for local storage
const getStoredProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredProfile = (profile: UserProfile | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (profile) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.USER_ID, profile.id);
      localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    }
  } catch (error) {
    console.warn('Failed to update localStorage:', error);
  }
};

const isStoredProfileValid = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    if (!timestamp) return false;
    
    const age = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return age < maxAge;
  } catch {
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_LOADING_TIME = 15000; // 15 seconds maximum loading time

  const isAuthenticated = !!user;
  const isAdmin = userProfile?.role === 'admin';

  // Force stop loading after maximum time
  const forceStopLoading = () => {
    console.warn('Forcing stop loading after timeout');
    setLoading(false);
    
    // If we have stored profile data, try to use it
    if (isStoredProfileValid()) {
      const storedProfile = getStoredProfile();
      if (storedProfile) {
        console.log('Using stored profile as fallback after timeout');
        setUserProfile(storedProfile);
      }
    }
  };

  // Start loading timeout
  const startLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = setTimeout(forceStopLoading, MAX_LOADING_TIME);
  };

  // Clear loading timeout
  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  // Retry mechanism for profile fetching
  const fetchProfileWithRetry = async (userId: string, skipCache = false, retryCount = 0): Promise<UserProfile | null> => {
    try {
      const profile = await getUserProfile(userId, !skipCache);
      if (profile) {
        setStoredProfile(profile); // Store in localStorage
        return profile;
      }
      
      // If profile is null and we have retries left, try again
      if (retryCount < maxRetries) {
        console.log(`Profile fetch attempt ${retryCount + 1} returned null, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return await fetchProfileWithRetry(userId, true, retryCount + 1); // Skip cache on retry
      }
      
      console.warn(`Profile fetch failed after ${maxRetries + 1} attempts`);
      return null;
    } catch (error) {
      console.error(`Profile fetch attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return await fetchProfileWithRetry(userId, true, retryCount + 1);
      }
      
      return null;
    }
  };

  // Enhanced profile refresh with retry logic
  const refreshProfile = async (currentUser?: User | null, skipCache = false) => {
    const userToCheck = currentUser ?? user;
    if (!userToCheck) {
      setUserProfile(null);
      setStoredProfile(null);
      return;
    }

    console.log(`Refreshing profile for user ${userToCheck.id}, skipCache: ${skipCache}`);

    // Use stored profile immediately if valid and not skipping cache
    if (!skipCache && isStoredProfileValid()) {
      const storedProfile = getStoredProfile();
      if (storedProfile && storedProfile.id === userToCheck.id) {
        console.log('Using stored profile for immediate display');
        setUserProfile(storedProfile);
        
        // Still fetch fresh data in background
        fetchProfileWithRetry(userToCheck.id, true).then(freshProfile => {
          if (freshProfile && JSON.stringify(freshProfile) !== JSON.stringify(storedProfile)) {
            console.log('Updated profile with fresh data');
            setUserProfile(freshProfile);
          }
        }).catch(error => {
          console.warn('Background profile refresh failed:', error);
        });
        return;
      }
    }

    // Fetch fresh profile
    try {
      const profile = await fetchProfileWithRetry(userToCheck.id, skipCache);
      setUserProfile(profile);
      
      if (!profile) {
        console.error('Failed to fetch profile after all retries');
        // Try to use stored profile as last resort
        if (isStoredProfileValid()) {
          const fallbackProfile = getStoredProfile();
          if (fallbackProfile && fallbackProfile.id === userToCheck.id) {
            console.log('Using stored profile as final fallback');
            setUserProfile(fallbackProfile);
          }
        }
      }
    } catch (error) {
      console.error('Profile refresh failed:', error);
    }
  };

  // Enhanced session initialization with retry
  const initializeSession = async (retryCount = 0): Promise<void> => {
    try {
      console.log(`Initializing session, attempt ${retryCount + 1}`);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session fetch error:', error);
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return await initializeSession(retryCount + 1);
        }
        
        // If all retries failed, check if we have a stored profile to fall back to
        console.log('Session initialization failed, checking for stored profile...');
        if (isStoredProfileValid()) {
          const storedProfile = getStoredProfile();
          if (storedProfile) {
            setUserProfile(storedProfile);
            console.log('Using stored profile as fallback after session failure');
          }
        }
        
        clearLoadingTimeout();
        setLoading(false);
        return;
      }

      console.log('Session initialized successfully:', !!session);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await refreshProfile(session.user, false);
      } else {
        // No session, clear stored data
        setUserProfile(null);
        setStoredProfile(null);
      }

      clearLoadingTimeout();
      setLoading(false);
    } catch (error) {
      console.error('Session initialization error:', error);
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return await initializeSession(retryCount + 1);
      }
      
      clearLoadingTimeout();
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    retryCountRef.current = 0;

    // Start the loading timeout
    startLoadingTimeout();

    // Initialize with stored profile for immediate UI feedback
    if (isStoredProfileValid()) {
      const storedProfile = getStoredProfile();
      if (storedProfile) {
        setUserProfile(storedProfile);
        console.log('Initialized with stored profile');
      }
    }

    // Initialize session
    initializeSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event);
      
      // Clear any existing timeout when auth state changes
      clearLoadingTimeout();
      
      // Handle different auth events
      switch (event) {
        case 'SIGNED_OUT':
          clearProfileCache();
          setStoredProfile(null);
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          break;
          
        case 'SIGNED_IN':
          setLoading(true);
          startLoadingTimeout();
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await refreshProfile(session.user, true); // Skip cache for fresh login
          }
          setLoading(false);
          clearLoadingTimeout();
          break;
          
        case 'TOKEN_REFRESHED':
          setSession(session);
          setUser(session?.user ?? null);
          // Don't clear cache on token refresh, just update if needed
          if (session?.user && (!userProfile || userProfile.id !== session.user.id)) {
            setLoading(true);
            startLoadingTimeout();
            await refreshProfile(session.user, false);
            setLoading(false);
            clearLoadingTimeout();
          }
          break;
          
        case 'USER_UPDATED':
          setLoading(true);
          startLoadingTimeout();
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await refreshProfile(session.user, true); // Get fresh data on user update
          }
          setLoading(false);
          clearLoadingTimeout();
          break;
          
        default:
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            setLoading(true);
            startLoadingTimeout();
            await refreshProfile(session.user, false);
            setLoading(false);
            clearLoadingTimeout();
          } else {
            setUserProfile(null);
            setStoredProfile(null);
            setLoading(false);
          }
      }
    });

    return () => {
      mounted = false;
      clearLoadingTimeout();
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    startLoadingTimeout();
    try {
      const { data, error } = await signIn(email, password);
      return { error };
    } catch (error) {
      return { error };
    } finally {
      // Don't set loading to false here, let the auth state change handle it
    }
  };

  const register = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    startLoadingTimeout();
    try {
      const { data, error } = await signUp(email, password, metadata);
      return { error };
    } catch (error) {
      return { error };
    } finally {
      // Don't set loading to false here, let the auth state change handle it
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      clearProfileCache();
      setStoredProfile(null);
      await signOut();
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
      clearLoadingTimeout();
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
        // Clear cache and refresh profile after update
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