"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/lib/supabase';

const ProfileDebugPage = () => {
  const { user, userProfile, session, loading, isAuthenticated, isAdmin, refreshProfile } = useAuth();
  const { clearCache } = useProfile();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const gatherDebugInfo = () => {
      const info = {
        // Auth state
        hasUser: !!user,
        hasSession: !!session,
        hasProfile: !!userProfile,
        isLoading: loading,
        isAuthenticated,
        isAdmin,
        
        // User details
        userId: user?.id,
        userEmail: user?.email,
        sessionValid: session ? !session.expires_at || new Date(session.expires_at * 1000) > new Date() : false,
        sessionExpiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        
        // Profile details
        profileId: userProfile?.id,
        profileEmail: userProfile?.email,
        profileRole: userProfile?.role,
        
        // LocalStorage check
        hasStoredProfile: !!localStorage.getItem('zb_auth_profile'),
        storedProfile: localStorage.getItem('zb_auth_profile') ? 'Present' : 'Missing',
        
        // Environment
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      
      setDebugInfo(info);
      addLog('Debug info gathered');
    };

    gatherDebugInfo();
  }, [user, userProfile, session, loading, isAuthenticated, isAdmin]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    addLog('Starting manual profile refresh...');
    
    try {
      clearCache();
      addLog('Cache cleared');
      
      if (user) {
        addLog(`Refreshing profile for user ${user.id}...`);
        await refreshProfile();
        addLog(`Profile refresh completed`);
      } else {
        addLog('No user found for profile refresh');
      }
    } catch (error) {
      addLog(`Error during manual refresh: ${error}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem('zb_auth_profile');
    clearCache();
    addLog('LocalStorage and cache cleared');
    window.location.reload();
  };

  const handleTestSupabase = async () => {
    addLog('Testing Supabase connection...');
    
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) {
        addLog(`Supabase error: ${error.message}`);
      } else {
        addLog('Supabase connection successful');
      }
    } catch (error) {
      addLog(`Supabase connection failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Debug Tool</h1>
        
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${isAuthenticated ? 'bg-green-900' : 'bg-red-900'}`}>
            <h3 className="font-semibold">Authentication</h3>
            <p>{isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${userProfile ? 'bg-green-900' : 'bg-red-900'}`}>
            <h3 className="font-semibold">Profile</h3>
            <p>{userProfile ? '✅ Loaded' : '❌ Missing'}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${loading ? 'bg-yellow-900' : 'bg-green-900'}`}>
            <h3 className="font-semibold">Loading State</h3>
            <p>{loading ? '⏳ Loading...' : '✅ Complete'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Manual Profile Refresh'}
          </button>
          
          <button
            onClick={handleClearStorage}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition"
          >
            Clear Storage & Reload
          </button>
          
          <button
            onClick={handleTestSupabase}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
          >
            Test Supabase Connection
          </button>
        </div>

        {/* Debug Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Debug Info */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <pre className="text-sm overflow-auto max-h-96 bg-gray-800 p-4 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Current Profile */}
          {userProfile && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Current Profile Data</h2>
              <pre className="text-sm overflow-auto max-h-96 bg-gray-800 p-4 rounded">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="mt-8 bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
          <div className="bg-gray-800 p-4 rounded max-h-64 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How to Use This Tool</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check the status overview above to see what's working</li>
            <li>Review the debug information for detailed state</li>
            <li>Use "Manual Profile Refresh" to force a profile reload</li>
            <li>Use "Test Supabase Connection" to verify database connectivity</li>
            <li>Use "Clear Storage & Reload" if you suspect cache issues</li>
            <li>Check the activity logs for detailed timing information</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ProfileDebugPage; 