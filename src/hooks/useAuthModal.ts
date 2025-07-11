"use client";
import { useState, useCallback } from 'react';

interface UseAuthModalReturn {
  isOpen: boolean;
  mode: 'login' | 'signup';
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
}

export const useAuthModal = (): UseAuthModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const openLogin = useCallback(() => {
    setMode('login');
    setIsOpen(true);
  }, []);

  const openSignup = useCallback(() => {
    setMode('signup');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    mode,
    openLogin,
    openSignup,
    close,
  };
}; 