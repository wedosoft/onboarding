-- ============================================
-- Quiz Questions 데이터 진단 SQL 스크립트
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. 테이블 구조 확인
-- ============================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'onboarding' 
  AND table_name = 'quiz_questions'
ORDER BY ordinal_position;

-- 2. 전체 quiz_questions 데이터 확인
-- ============================================
SELECT 
    id,
    module_id,
    difficulty,
    question_order,
    substring(question, 1, 100) as question_preview,
    (SELECT name_ko FROM onboarding.curriculum_modules WHERE id = quiz_questions.module_id) as module_name,
    is_active
FROM onboarding.quiz_questions
ORDER BY module_id, question_order
LIMIT 50;

-- 3. Module별 문제 개수 통계
-- ============================================
SELECT 
    module_id,
    COUNT(*) as question_count,
    COUNT(CASE WHEN difficulty = 'basic' THEN 1 END) as basic_count,
    COUNT(CASE WHEN difficulty = 'advanced' THEN 1 END) as advanced_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM onboarding.quiz_questions
GROUP BY module_id
ORDER BY module_id;

-- 4. 온보딩 관련 문제 찾기
-- ============================================
SELECT 
    id,
    module_id,
    substring(question, 1, 150) as question_preview,
    difficulty
FROM onboarding.quiz_questions
WHERE 
    question ILIKE '%온보딩%' 
    OR question ILIKE '%onboarding%'
    OR question ILIKE '%시나리오%'
    OR question ILIKE '%scenario%'
    OR module_id ILIKE '%onboarding%'
    OR module_id ILIKE '%scenario%';

-- 5. 특정 모듈의 문제 확인 (Automation 예시)
-- ============================================
SELECT 
    id,
    module_id,
    difficulty,
    question_order,
    question,
    context,
    kb_document_id,
    reference_url,
    is_active
FROM onboarding.quiz_questions
WHERE module_id = 'freshservice-automation'  -- 실제 moduleId로 교체
ORDER BY question_order;

-- 6. NULL 또는 빈 module_id 확인
-- ============================================
SELECT 
    id,
    module_id,
    substring(question, 1, 100) as question_preview,
    difficulty
FROM onboarding.quiz_questions
WHERE 
    module_id IS NULL 
    OR module_id = '' 
    OR module_id = 'null';

-- 7. 중복 문제 확인
-- ============================================
SELECT 
    question,
    COUNT(*) as duplicate_count,
    string_agg(DISTINCT module_id, ', ') as modules,
    string_agg(DISTINCT id, ', ') as question_ids
FROM onboarding.quiz_questions
GROUP BY question
HAVING COUNT(*) > 1;

-- 8. 잘못된 moduleId 패턴 찾기
-- ============================================
-- curriculum_modules에 없는 module_id를 사용하는 문제 찾기
SELECT 
    qq.id,
    qq.module_id as quiz_module_id,
    substring(qq.question, 1, 100) as question_preview
FROM onboarding.quiz_questions qq
LEFT JOIN onboarding.curriculum_modules cm ON qq.module_id = cm.id
WHERE cm.id IS NULL;

-- 9. 각 모듈의 실제 문제 예시 (처음 2개씩)
-- ============================================
WITH ranked_questions AS (
    SELECT 
        module_id,
        question,
        difficulty,
        ROW_NUMBER() OVER (PARTITION BY module_id ORDER BY question_order) as rn
    FROM onboarding.quiz_questions
    WHERE is_active = true
)
SELECT 
    module_id,
    difficulty,
    substring(question, 1, 120) as question_preview
FROM ranked_questions
WHERE rn <= 2
ORDER BY module_id, rn;

-- 10. 문제가 있는 데이터 찾기 (종합)
-- ============================================
SELECT 
    'Missing module_id' as issue_type,
    COUNT(*) as count
FROM onboarding.quiz_questions
WHERE module_id IS NULL OR module_id = ''

UNION ALL

SELECT 
    'Orphaned questions (no matching module)' as issue_type,
    COUNT(*) as count
FROM onboarding.quiz_questions qq
LEFT JOIN onboarding.curriculum_modules cm ON qq.module_id = cm.id
WHERE cm.id IS NULL

UNION ALL

SELECT 
    'Onboarding-related questions' as issue_type,
    COUNT(*) as count
FROM onboarding.quiz_questions
WHERE 
    question ILIKE '%온보딩%' 
    OR question ILIKE '%onboarding%'
    OR module_id ILIKE '%onboarding%'

UNION ALL

SELECT 
    'Inactive questions' as issue_type,
    COUNT(*) as count
FROM onboarding.quiz_questions
WHERE is_active = false;

-- ============================================
-- 수정 스크립트 템플릿
-- ============================================

-- 예시 1: 잘못된 module_id 수정
/*
UPDATE onboarding.quiz_questions
SET module_id = 'freshservice-automation'  -- 올바른 module ID
WHERE id IN ('question_id_1', 'question_id_2');  -- 수정할 문제 ID들
*/

-- 예시 2: 온보딩 문제를 비활성화
/*
UPDATE onboarding.quiz_questions
SET is_active = false
WHERE question ILIKE '%온보딩%' 
   OR question ILIKE '%onboarding%';
*/

-- 예시 3: 특정 모듈의 문제만 활성화
/*
UPDATE onboarding.quiz_questions
SET is_active = true
WHERE module_id = 'freshservice-automation';
*/

-- ============================================
-- 검증 쿼리
-- ============================================

-- 수정 후 특정 모듈의 활성 문제 확인
/*
SELECT 
    id,
    module_id,
    difficulty,
    substring(question, 1, 100) as question_preview,
    is_active
FROM onboarding.quiz_questions
WHERE module_id = 'freshservice-automation'
  AND is_active = true
ORDER BY question_order;
*/
