// DEPRECATED: This hook is deprecated. Use useProfile() from ProfileContext instead.
// This file is kept for backward compatibility but will be removed in a future version.

import { useProfile } from '@/context/ProfileContext';

/**
 * @deprecated Use useProfile() from ProfileContext instead.
 * This provides the same functionality but with better performance and caching.
 */
export const useProfileData = () => {
  console.warn('useProfileData is deprecated. Use useProfile() from ProfileContext instead.');
  return useProfile();
}; 