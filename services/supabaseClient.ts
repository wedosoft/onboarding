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
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// 인증된 사용자 타입
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

// Supabase User를 AuthUser로 변환
function toAuthUser(user: User): AuthUser {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || null,
    name: metadata.full_name || metadata.name || null,
    picture: metadata.avatar_url || metadata.picture || null,
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

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
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
