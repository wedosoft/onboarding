-- ====================================================
-- Supabase 실제 테이블 목록 확인
-- ====================================================

-- 1. 모든 테이블 목록 조회
SELECT
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. 온보딩/진행도 관련 테이블만 필터링
SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
    table_name LIKE '%progress%'
    OR table_name LIKE '%session%'
    OR table_name LIKE '%onboarding%'
    OR table_name LIKE '%module%'
  )
ORDER BY table_name;
