"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile, getUserProfile, signIn, signUp, signOut } from '@/lib/supabase';

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
  refreshProfile: (currentUser?: User | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = userProfile?.role === 'admin';

  // Fetch user profile when user changes
  const refreshProfile = async (currentUser?: User | null) => {
    const userToCheck = currentUser ?? user;
    if (userToCheck) {
      console.log('Refreshing profile for user:', userToCheck.id);
      const profile = await getUserProfile(userToCheck.id);
      console.log('Got profile:', profile);
      setUserProfile(profile);
    } else {
      console.log('No user, clearing profile');
      setUserProfile(null);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Initial session result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        email: session?.user?.email,
        sessionValid: session ? !session.expires_at || new Date(session.expires_at * 1000) > new Date() : false,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        error
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await refreshProfile(session.user);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email, {
        hasSession: !!session,
        hasUser: !!session?.user,
        sessionValid: session ? !session.expires_at || new Date(session.expires_at * 1000) > new Date() : false,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await refreshProfile(session.user);
      } else {
        console.log('No session or user in auth change, clearing profile');
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // Removed user?.id dependency to prevent unnecessary re-runs

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await signIn(email, password);
    
    if (!error && data.user) {
      // Profile will be fetched by the auth state change listener
    }
    
    setLoading(false);
    return { error };
  };

  const register = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    const { data, error } = await signUp(email, password, metadata);
    
    // If signup was successful, try to refresh the profile
    if (!error && data.user) {
      // Wait a bit for the trigger to fire
      setTimeout(() => {
        refreshProfile(data.user);
      }, 1000);
    }
    
    setLoading(false);
    return { error };
  };

  const logout = async () => {
    setLoading(true);
    await signOut();
    setUser(null);
    setUserProfile(null);
    setSession(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      await refreshProfile(user);
    }

    return { error };
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