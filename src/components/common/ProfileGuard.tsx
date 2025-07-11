"use client";
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useEffect, useState } from 'react';

interface ProfileGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ 
  children, 
  requireAuth = false, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, userProfile, isAdmin, loading } = useAuth();
  const authModal = useAuthModal();
  const [isReady, setIsReady] = useState(false);
  const [shouldShowAccessDenied, setShouldShowAccessDenied] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (!loading) {
      // Give additional time to ensure profile is fully loaded
      const timeoutId = setTimeout(() => {
        setIsReady(true);
        
        // Only show access denied if we're sure the user doesn't have admin access
        // and we've waited enough time for the profile to load
        if (requireAdmin && isAuthenticated && userProfile && !isAdmin) {
          console.log('ProfileGuard: Admin access denied after profile loaded', { 
            isAuthenticated, 
            userProfile: userProfile?.role,
            isAdmin 
          });
          setShouldShowAccessDenied(true);
        }
      }, 500); // Increased delay to ensure profile is fully loaded

      return () => clearTimeout(timeoutId);
    }
  }, [loading, isAuthenticated, userProfile, isAdmin, requireAuth, requireAdmin]);

  // Show loading while auth is being determined or while we're waiting for profile
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Handle authentication requirement
  if (requireAuth && !isAuthenticated) {
    authModal.openLogin();
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-300 mb-6">
            Please sign in to access this page.
          </p>
          <button
            onClick={authModal.openLogin}
            className="bg-white text-black px-6 py-3 rounded-md hover:bg-gray-200 transition font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Handle admin requirement - only deny if we're absolutely sure
  if (requireAdmin && isAuthenticated && shouldShowAccessDenied) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
          <div className="mt-4">
            <a
              href="/admin-setup"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Diagnose Admin Access
            </a>
          </div>
        </div>
      </div>
    );
  }

  // For admin-required pages, ensure we have a profile before proceeding
  if (requireAdmin && isAuthenticated && !userProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProfileGuard; 