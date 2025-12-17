import { supabase } from './supabaseClient';
import { requireEnv } from './env';

export type StoredObjectRef = {
  bucket: string;
  path: string;
};

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다. (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 확인)');
  }
  return supabase;
}

function getKnowledgeBucket(): string {
  return requireEnv('VITE_KNOWLEDGE_BUCKET');
}

function getSignedUrlExpiresIn(): number {
  const raw = requireEnv('VITE_KNOWLEDGE_SIGNED_URL_EXPIRES_IN');
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`환경 변수 형식 오류: VITE_KNOWLEDGE_SIGNED_URL_EXPIRES_IN=${raw}`);
  }
  return value;
}

function sanitizeFilename(filename: string): string {
  const trimmed = filename.trim();
  const dotIdx = trimmed.lastIndexOf('.');
  const hasExt = dotIdx > 0 && dotIdx < trimmed.length - 1;
  const base = hasExt ? trimmed.slice(0, dotIdx) : trimmed;
  const ext = hasExt ? trimmed.slice(dotIdx + 1) : '';

  const normalizedBase = base.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const normalizedExt = ext.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  const safeBase = normalizedBase
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  const safeExt = normalizedExt
    .replace(/\s+/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toLowerCase();

  const finalBase = safeBase.length > 0 ? safeBase : 'file';
  const finalName = safeExt.length > 0 ? `${finalBase}.${safeExt}` : finalBase;

  // Supabase Storage 키 길이/URL 안정성을 위해 과도하게 긴 파일명은 제한
  return finalName.length > 140 ? finalName.slice(0, 140) : finalName;
}

function buildObjectPath(userId: string, filename: string): string {
  const safeName = sanitizeFilename(filename);
  const uuid = crypto.randomUUID();
  return `knowledge/${userId}/${uuid}-${safeName}`;
}

export async function uploadKnowledgeObject(file: File, userId: string): Promise<StoredObjectRef> {
  const client = requireSupabase();
  const bucket = getKnowledgeBucket();
  const path = buildObjectPath(userId, file.name);

  const { error } = await client.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) {
    throw new Error(
      `파일 업로드 실패: ${error.message} (bucket=${bucket}, path=${path})`
    );
  }

  return { bucket, path };
}

export async function createSignedUrl(ref: StoredObjectRef): Promise<string> {
  const client = requireSupabase();
  const expiresIn = getSignedUrlExpiresIn();

  const { data, error } = await client.storage.from(ref.bucket).createSignedUrl(ref.path, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(`서명 URL 생성 실패: ${error?.message || 'unknown error'}`);
  }
  return data.signedUrl;
}

export function tryParseSupabaseSignedObjectUrl(url: string): StoredObjectRef | null {
  try {
    const parsed = new URL(url);
    const marker = '/storage/v1/object/sign/';
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;

    const tail = parsed.pathname.slice(idx + marker.length);
    const [bucket, ...rest] = tail.split('/');
    if (!bucket || rest.length === 0) return null;

    const path = decodeURIComponent(rest.join('/'));
    return { bucket: decodeURIComponent(bucket), path };
  } catch {
    return null;
  }
}
