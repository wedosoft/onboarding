-- ====================================================
-- 온보딩 시스템 데이터 초기화 스크립트
-- ====================================================
--
-- 실행 순서: 외래 키 제약 조건이 있는 자식 테이블부터 삭제
--
-- 주의: 이 스크립트는 모든 학습 진행 기록을 삭제합니다.
-- 실행 전 반드시 백업하세요.
-- ====================================================

-- 1. 모듈 진행도 삭제 (커리큘럼 학습 진도, 외래 키 있음)
DELETE FROM onboarding.module_progress;

-- 2. 시나리오 진행도 삭제 (온보딩 시나리오 진도)
DELETE FROM onboarding.onboarding_progress;

-- 3. 온보딩 세션 삭제 (메인 세션 테이블)
DELETE FROM onboarding.onboarding_sessions;

-- ====================================================
-- 확인 쿼리 (삭제 후 실행하여 결과 확인)
-- ====================================================

-- 각 테이블의 레코드 수 확인
SELECT
  'module_progress' as table_name,
  COUNT(*) as count
FROM onboarding.module_progress

UNION ALL

SELECT
  'onboarding_progress' as table_name,
  COUNT(*) as count
FROM onboarding.onboarding_progress

UNION ALL

SELECT
  'onboarding_sessions' as table_name,
  COUNT(*) as count
FROM onboarding.onboarding_sessions;

-- ====================================================
-- 주의사항
-- ====================================================
--
-- 1. 이 스크립트는 TRUNCATE 대신 DELETE를 사용합니다
--    (외래 키 제약 조건 때문)
--
-- 2. 삭제된 데이터는 복구할 수 없습니다
--
-- 3. 삭제 후 프론트엔드의 localStorage도 초기화해야 합니다:
--    브라우저 개발자 도구 > Application > Local Storage >
--    'onboarding_session_id' 항목 삭제
--
-- 4. 백엔드 서버 재시작 권장 (캐시 초기화)
-- ====================================================
