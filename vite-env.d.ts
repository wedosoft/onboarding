/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GEMINI_API_KEY?: string;
  // Supabase Auth (Google OAuth)
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  // Optional: override Supabase OAuth redirectTo (absolute URL or path like "/login")
  readonly VITE_AUTH_REDIRECT_TO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
