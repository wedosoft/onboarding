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
  const e2eAutoLogin = import.meta.env.VITE_E2E_AUTO_LOGIN === 'true';
  const e2eUser: AuthUser | null = e2eAutoLogin
    ? {
        id: import.meta.env.VITE_E2E_TEST_USER_ID || 'e2e-user',
        email: import.meta.env.VITE_E2E_TEST_USER_EMAIL || 'playwright@wedosoft.net',
        name: import.meta.env.VITE_E2E_TEST_USER_NAME || 'Playwright Reviewer',
        avatar: import.meta.env.VITE_E2E_TEST_USER_AVATAR || null,
      }
    : null;
  const e2eToken = e2eAutoLogin ? (import.meta.env.VITE_E2E_TEST_TOKEN || 'e2e-test-token') : null;

  // 초기 사용자 로드
  useEffect(() => {
    if (e2eAutoLogin && e2eUser) {
      setUser(e2eUser);
      setIsLoading(false);
      return;
    }

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
  }, [authEnabled, e2eAutoLogin, e2eUser]);

  // 인증 상태 변경 리스너
  useEffect(() => {
    if (e2eAutoLogin || !authEnabled) {
      return;
    }

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [authEnabled, e2eAutoLogin]);

  const signIn = useCallback(async () => {
    if (e2eAutoLogin) {
      setUser(e2eUser);
      setIsLoading(false);
      return;
    }

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
  }, [authEnabled, e2eAutoLogin, e2eUser]);

  const signOut = useCallback(async () => {
    if (e2eAutoLogin) {
      setUser(null);
      return;
    }

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
  }, [authEnabled, e2eAutoLogin]);

  const getToken = useCallback(async () => {
    if (e2eAutoLogin) {
      return e2eToken;
    }

    if (!authEnabled || !user) {
      return null;
    }
    return getAccessToken();
  }, [authEnabled, user, e2eAutoLogin, e2eToken]);

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
