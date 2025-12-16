-- ====================================================
-- 모든 스키마의 테이블 확인
-- ====================================================

-- 1. 모든 스키마 목록 조회
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
ORDER BY schema_name;

-- 2. onboarding 스키마의 테이블 확인
SELECT
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'onboarding'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. onboarding 스키마의 진행도 관련 테이블
SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = 'onboarding'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
