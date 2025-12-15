/**
 * Supabase 클라이언트 설정
 * Google OAuth 인증에 사용
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 로드
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Auth features will be disabled.');
}

// Supabase 클라이언트 인스턴스
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        db: {
          schema: 'onboarding',
        },
      })
    : null;

// 인증된 사용자 타입
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
}

// Supabase User를 AuthUser로 변환
function toAuthUser(user: User): AuthUser {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || null,
    name: metadata.full_name || metadata.name || null,
    avatar: metadata.avatar_url || metadata.picture || null,
  };
}

// ============================================
// 인증 함수들
// ============================================

/**
 * Google OAuth 로그인
 */
export async function signInWithGoogle(): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Supabase는 보안상 허용된 URL로만 redirectTo를 받아줍니다.
  // 로컬 개발 시 서버(Site URL)로 튀는 경우, Supabase Dashboard의 URL allowlist에
  // http://localhost:5173 (및 필요한 경로)를 추가해야 합니다.
  const envRedirectTo = import.meta.env.VITE_AUTH_REDIRECT_TO;
  const redirectTo = (() => {
    if (envRedirectTo && envRedirectTo.trim().length > 0) {
      // env 값이 절대 URL이면 그대로, 상대 경로면 현재 origin 기준으로 보정
      const value = envRedirectTo.trim();
      if (/^https?:\/\//i.test(value)) {
        return value;
      }
      return new URL(value.startsWith('/') ? value : `/${value}`, window.location.origin).toString();
    }

    // 기본값: 로그인 시작 페이지(현재 pathname)로 복귀
    // (hash/query는 OAuth 과정에서 오염될 수 있어 pathname만 사용)
    const path = window.location.pathname && window.location.pathname.length > 0
      ? window.location.pathname
      : '/';
    return new URL(path, window.location.origin).toString();
  })();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<void> {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * 현재 세션 가져오기
 */
export async function getSession(): Promise<Session | null> {
  if (!supabase) {
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * 현재 사용자 가져오기
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user ? toAuthUser(user) : null;
}

/**
 * 액세스 토큰 가져오기 (API 호출용)
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token || null;
}

/**
 * 인증 상태 변경 리스너 등록
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
): (() => void) | undefined {
  if (!supabase) {
    return undefined;
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      const user = session?.user;
      callback(user ? toAuthUser(user) : null);
    }
  );

  return () => subscription.unsubscribe();
}

/**
 * Supabase가 설정되었는지 확인
 */
export function isAuthEnabled(): boolean {
  return supabase !== null;
}
