/**
 * 인증 컨텍스트
 * Google OAuth 로그인 상태 관리
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import {
  AuthUser,
  signInWithGoogle,
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
  isAuthEnabled,
  getAccessToken,
} from '../services/supabaseClient';
import { createSession } from '../services/apiClient';

const SESSION_STORAGE_KEY = 'onboarding_session_id';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthEnabled: boolean;
  sessionId: string | null;
  isSessionReady: boolean;
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
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_STORAGE_KEY));
  const [isSessionReady, setIsSessionReady] = useState(() => !!localStorage.getItem(SESSION_STORAGE_KEY));
  const sessionInitRef = useRef(false); // 세션 초기화 진행 중 플래그
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

  // 사용자 로그인 시 세션 생성
  useEffect(() => {
    const initSession = async () => {
      // 로그아웃한 경우
      if (!user) {
        const existingSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (existingSession) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          setSessionId(null);
          setIsSessionReady(false);
        }
        sessionInitRef.current = false;
        return;
      }

      // 이미 세션이 존재하면 스킵
      const existingSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (existingSession) {
        if (!sessionId || !isSessionReady) {
          setSessionId(existingSession);
          setIsSessionReady(true);
        }
        return;
      }

      // 이미 초기화 진행 중이면 스킵
      if (sessionInitRef.current) {
        return;
      }

      // 새 세션 생성
      sessionInitRef.current = true;
      try {
        const userName = user.name || user.email?.split('@')[0] || '신입사원';
        console.log('[AuthContext] Creating new session for:', userName);
        const response = await createSession(userName);
        localStorage.setItem(SESSION_STORAGE_KEY, response.sessionId);
        setSessionId(response.sessionId);
        setIsSessionReady(true);
        console.log('[AuthContext] Session created:', response.sessionId);
      } catch (error) {
        console.error('[AuthContext] Failed to create session:', error);
        // 폴백: 로컬 세션 ID 생성
        const fallbackId = `local-${user.id}-${Date.now()}`;
        localStorage.setItem(SESSION_STORAGE_KEY, fallbackId);
        setSessionId(fallbackId);
        setIsSessionReady(true);
        console.log('[AuthContext] Fallback session created:', fallbackId);
      }
    };

    initSession();
  }, [user]); // user만 의존성으로 - sessionId/isSessionReady 제거

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
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    if (!authEnabled) {
      return;
    }

    try {
      await supabaseSignOut();
      setUser(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
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
        sessionId,
        isSessionReady,
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
