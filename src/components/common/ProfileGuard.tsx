"use client";
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProfileGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

const LoadingSpinner = ({ message, isDelayed = false }: { message: string; isDelayed?: boolean }) => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <motion.div
        className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p 
        className="text-white text-lg"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      >
        {message}
      </motion.p>
      <p className="text-gray-400 text-sm mt-2">
        {isDelayed 
          ? 'If this takes too long, try refreshing the page...' 
          : 'This may take a moment on first load'
        }
      </p>
      {isDelayed && (
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition text-sm"
        >
          Refresh Page
        </button>
      )}
    </div>
  </div>
);

const AccessDenied = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <motion.div 
      className="text-center max-w-md mx-auto p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-red-500 text-6xl mb-4">🚫</div>
      <h1 className="text-white text-2xl font-bold mb-4">Access Denied</h1>
      <p className="text-gray-400 mb-6">{message}</p>
      <motion.button
        onClick={() => window.location.href = '/'}
        className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Go Home
      </motion.button>
    </motion.div>
  </div>
);

const ProfileGuard: React.FC<ProfileGuardProps> = ({ 
  children, 
  requireAuth = false, 
  requireAdmin = false,
  fallback 
}) => {
  const { user, userProfile, loading, isAuthenticated, isAdmin } = useAuth();
  const [showDelayedLoading, setShowDelayedLoading] = useState(false);
  const [forceComplete, setForceComplete] = useState(false);

  // Show a different message if loading takes too long
  useEffect(() => {
    if (loading && !forceComplete) {
      const delayTimer = setTimeout(() => {
        setShowDelayedLoading(true);
      }, 5000); // Show "taking longer" message after 5 seconds

      const forceTimer = setTimeout(() => {
        console.warn('ProfileGuard: Force completing after 15 seconds');
        setForceComplete(true);
      }, 15000); // Force complete after 15 seconds

      return () => {
        clearTimeout(delayTimer);
        clearTimeout(forceTimer);
      };
    } else {
      setShowDelayedLoading(false);
    }
  }, [loading, forceComplete]);

  // Debug logging
  useEffect(() => {
    console.log('ProfileGuard state:', {
      loading,
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!userProfile,
      isAdmin,
      requireAuth,
      requireAdmin,
      forceComplete
    });
  }, [loading, isAuthenticated, user, userProfile, isAdmin, requireAuth, requireAdmin, forceComplete]);

  // Show loading state
  if (loading && !forceComplete) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <LoadingSpinner 
        message={showDelayedLoading ? 'Still loading your profile...' : 'Loading your profile...'}
        isDelayed={showDelayedLoading}
      />
    );
  }

  // If we forced completion but still no auth data, show error
  if (forceComplete && requireAuth && !isAuthenticated) {
    return (
      <AccessDenied message="Authentication failed to load. Please sign in again." />
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return (
      <AccessDenied message="You need to be signed in to access this page. Please log in to continue." />
    );
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    if (!isAuthenticated) {
      return (
        <AccessDenied message="You need to be signed in as an administrator to access this page." />
      );
    }
    
    return (
      <AccessDenied message="You need administrator privileges to access this page. Contact support if you believe this is an error." />
    );
  }

  // Additional check: if auth is required but profile is missing, show loading or error
  if (requireAuth && isAuthenticated && !userProfile && !forceComplete) {
    return (
      <LoadingSpinner 
        message="Loading profile data..."
        isDelayed={showDelayedLoading}
      />
    );
  }

  // If we forced completion and need profile but don't have it, show error
  if (forceComplete && requireAuth && isAuthenticated && !userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Profile Error</h1>
          <p className="text-gray-400 mb-6">Your profile data couldn't be loaded. This might be a temporary issue.</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition font-medium"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProfileGuard; 