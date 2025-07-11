"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { IoCheckmarkCircle, IoWarning, IoInformation, IoRefresh, IoShield } from 'react-icons/io5';

const AdminSetupPage = () => {
  const { user, userProfile, isAuthenticated, isAdmin, loading, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [checking, setChecking] = useState(false);
  const [makingAdmin, setMakingAdmin] = useState(false);
  const [dbCheckResult, setDbCheckResult] = useState<any>(null);

  const checkDatabaseRole = async () => {
    if (!user?.email) {
      showToast('No user email found', 'error');
      return;
    }

    setChecking(true);
    try {
      const response = await fetch('/api/debug/check-admin-by-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      setDbCheckResult(data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check database role');
      }

    } catch (error) {
      console.error('Error checking database role:', error);
      showToast('Failed to check database role', 'error');
    } finally {
      setChecking(false);
    }
  };

  const makeUserAdmin = async () => {
    if (!user?.email) {
      showToast('No user email found', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to make ${user.email} an admin? This will grant full administrative access.`)) {
      return;
    }

    setMakingAdmin(true);
    try {
      const response = await fetch('/api/debug/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          confirm: 'YES_MAKE_ADMIN'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to make user admin');
      }

      showToast('User has been made admin successfully!', 'success');
      
      // Refresh user profile and database check
      await refreshProfile();
      await checkDatabaseRole();
      
    } catch (error) {
      console.error('Error making user admin:', error);
      showToast(error instanceof Error ? error.message : 'Failed to make user admin', 'error');
    } finally {
      setMakingAdmin(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      checkDatabaseRole();
    }
  }, [isAuthenticated, user?.email]);

  const getStatusIcon = (isAdmin: boolean, hasProfile: boolean) => {
    if (isAdmin) return <IoCheckmarkCircle className="text-green-500" size={24} />;
    if (hasProfile) return <IoWarning className="text-yellow-500" size={24} />;
    return <IoWarning className="text-red-500" size={24} />;
  };

  const getStatusMessage = () => {
    if (!isAuthenticated) {
      return { type: 'error', message: 'You are not authenticated. Please sign in first.' };
    }
    
    if (!userProfile) {
      return { type: 'error', message: 'No user profile found. This may be a database issue.' };
    }
    
    if (isAdmin) {
      return { type: 'success', message: 'You have admin access! You can now access the admin dashboard.' };
    }
    
    return { type: 'warning', message: `You are authenticated but not an admin. Current role: ${userProfile.role}` };
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar isHome={false} />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <IoShield size={64} className="mx-auto text-blue-400 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Admin Access Setup</h1>
            <p className="text-gray-400">
              Diagnose and fix admin access issues
            </p>
          </div>

          {/* Current Status */}
          <div className="bg-gray-900 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Status</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    refreshProfile();
                    if (user?.email) checkDatabaseRole();
                  }}
                  disabled={loading || checking}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <IoRefresh className={loading || checking ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Summary */}
                <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                  {getStatusIcon(isAdmin, !!userProfile)}
                  <div className="flex-1">
                    <p className="font-medium">{getStatusMessage().message}</p>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <IoInformation className="text-blue-400" />
                      Client-Side Authentication
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                        {isAuthenticated ? 'Yes' : 'No'}
                      </span></p>
                      {user && (
                        <>
                          <p>Email: <span className="text-gray-300">{user.email}</span></p>
                          <p>User ID: <span className="text-gray-400 font-mono text-xs">{user.id}</span></p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <IoShield className="text-purple-400" />
                      Profile & Role
                    </h3>
                    <div className="space-y-1 text-sm">
                      {userProfile ? (
                        <>
                          <p>Profile: <span className="text-green-400">Found</span></p>
                          <p>Role: <span className={isAdmin ? 'text-green-400' : 'text-yellow-400'}>
                            {userProfile.role}
                          </span></p>
                          <p>Name: <span className="text-gray-300">
                            {userProfile.first_name} {userProfile.last_name}
                          </span></p>
                          <p>Admin Access: <span className={isAdmin ? 'text-green-400' : 'text-red-400'}>
                            {isAdmin ? 'Yes' : 'No'}
                          </span></p>
                        </>
                      ) : (
                        <p>Profile: <span className="text-red-400">Not Found</span></p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Database Check Results */}
                {dbCheckResult && (
                  <div className="bg-purple-900/50 border border-purple-600 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-400 mb-2">Database Check Results</h3>
                    <div className="space-y-2 text-sm">
                      <p>Email: <span className="text-gray-300">{dbCheckResult.email}</span></p>
                      <p>Profile Found: <span className={dbCheckResult.found ? 'text-green-400' : 'text-red-400'}>
                        {dbCheckResult.found ? 'Yes' : 'No'}
                      </span></p>
                      {dbCheckResult.found && (
                        <>
                          <p>Role in DB: <span className={dbCheckResult.isAdmin ? 'text-green-400' : 'text-yellow-400'}>
                            {dbCheckResult.role}
                          </span></p>
                          <p>Is Admin: <span className={dbCheckResult.isAdmin ? 'text-green-400' : 'text-red-400'}>
                            {dbCheckResult.isAdmin ? 'Yes' : 'No'}
                          </span></p>
                        </>
                      )}
                      {dbCheckResult.error && (
                        <p className="text-red-400">Error: {dbCheckResult.error}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                {isAuthenticated && userProfile && !isAdmin && (
                  <div className="bg-yellow-900/50 border border-yellow-600 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-400 mb-2">Grant Admin Access</h3>
                    <p className="text-yellow-200 text-sm mb-4">
                      Click the button below to grant admin privileges to your account. This will allow you to access the admin dashboard and manage orders.
                    </p>
                    <button
                      onClick={makeUserAdmin}
                      disabled={makingAdmin}
                      className="bg-yellow-600 text-black px-6 py-2 rounded-md hover:bg-yellow-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {makingAdmin && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      )}
                      Make Me Admin
                    </button>
                  </div>
                )}

                {/* Success Actions */}
                {isAdmin && (
                  <div className="bg-green-900/50 border border-green-600 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-400 mb-2">Admin Access Granted!</h3>
                    <p className="text-green-200 text-sm mb-4">
                      You now have admin access. You can access the admin dashboard and manage orders.
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="/admin"
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition font-medium"
                      >
                        Go to Admin Dashboard
                      </a>
                      <a
                        href="/admin/orders"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium"
                      >
                        Advanced Order Management
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-white mb-2">1. If you're not authenticated:</h3>
                <p className="text-gray-400">Sign in with your account first, then come back to this page.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-2">2. If your profile is not found:</h3>
                <p className="text-gray-400">This may indicate a database issue. Check your Supabase setup and migrations.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-2">3. If you're not an admin:</h3>
                <p className="text-gray-400">Use the "Make Me Admin" button above to grant yourself admin privileges.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-2">4. Alternative manual method:</h3>
                <p className="text-gray-400">You can also update your role directly in Supabase:</p>
                <code className="block bg-gray-800 p-2 rounded mt-2 text-xs">
                  UPDATE user_profiles SET role = 'admin' WHERE email = 'your@email.com';
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminSetupPage; 