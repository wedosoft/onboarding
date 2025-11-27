/**
 * 인증 컨텍스트
 * Google OAuth 로그인 상태 관리
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  AuthUser,
  signInWithGoogle,
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
  isAuthEnabled,
  getAccessToken,
} from '../services/supabaseClient';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthEnabled: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authEnabled = isAuthEnabled();

  // 초기 사용자 로드
  useEffect(() => {
    const loadUser = async () => {
      if (!authEnabled) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [authEnabled]);

  // 인증 상태 변경 리스너
  useEffect(() => {
    if (!authEnabled) {
      return;
    }

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [authEnabled]);

  const signIn = useCallback(async () => {
    if (!authEnabled) {
      console.warn('Auth is not enabled');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsLoading(false);
      throw error;
    }
  }, [authEnabled]);

  const signOut = useCallback(async () => {
    if (!authEnabled) {
      return;
    }

    try {
      await supabaseSignOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }, [authEnabled]);

  const getToken = useCallback(async () => {
    if (!authEnabled || !user) {
      return null;
    }
    return getAccessToken();
  }, [authEnabled, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthEnabled: authEnabled,
        signIn,
        signOut,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
