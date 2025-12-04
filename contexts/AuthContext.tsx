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
        // OAuth 리다이렉트인지 확인
        const hasAuthHash = window.location.hash.includes('access_token');

        if (hasAuthHash) {
          console.log('OAuth callback detected, processing session...');
          // OAuth 콜백 처리를 위해 약간의 지연
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 먼저 사용자 정보를 가져옴 (Supabase가 해시에서 세션을 자동으로 설정)
        const currentUser = await getCurrentUser();
        console.log('Current user:', currentUser);
        setUser(currentUser);

        // 세션이 설정된 후 URL 해시 정리
        if (hasAuthHash) {
          console.log('Cleaning up URL hash');
          window.history.replaceState(null, '', window.location.pathname);
        }
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
