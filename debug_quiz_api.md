# 자가점검 퀴즈 문제 디버깅 가이드

## 문제 설명
자가점검(Self-Check Quiz)에서 커리큘럼 모듈별 질문 대신 온보딩(Onboarding) 관련 질문이 나타나는 문제.

## 원인 분석

### 1. 데이터 흐름
```
프론트엔드 (ModuleLearningPage.tsx)
  ↓ moduleId 전달
apiClient.getQuizQuestions(moduleId)
  ↓ HTTP GET
백엔드 API: /curriculum/modules/{moduleId}/questions
  ↓ DB 쿼리
Supabase onboarding.quiz_questions 테이블
  ↓ 응답
QuizQuestion[] 반환
```

### 2. 체크포인트

#### ✅ 프론트엔드 (확인 완료)
- `ModuleLearningPage.tsx` L99: `getQuizQuestions(moduleId!)` 정상 호출
- `apiClient.ts` L930-935: 올바른 엔드포인트 사용
- moduleId는 URL 파라미터로부터 가져옴 (`useParams`)

#### ❓ 백엔드 (확인 필요 - agent-platform repo)
다음 사항을 확인해야 함:

1. **API 엔드포인트**: `/curriculum/modules/{moduleId}/questions`
   ```python
   # agent-platform/app/api/routes/curriculum.py (예상 위치)
   @router.get("/modules/{module_id}/questions")
   async def get_quiz_questions(module_id: str):
       # 이 함수에서 제대로 필터링하는지 확인
       questions = await repository.get_quiz_questions(module_id)
       return questions
   ```

2. **Repository 레이어**: `curriculum_repository.py` (예상)
   ```python
   async def get_quiz_questions(self, module_id: str) -> list[QuizQuestion]:
       # ⚠️ 여기서 module_id 필터가 빠졌을 가능성
       query = supabase.table('quiz_questions') \
           .select('*') \
           # .eq('module_id', module_id)  ← 이 필터가 있어야 함!
       
       result = query.execute()
       return result.data
   ```

3. **데이터베이스 스키마**: `quiz_questions` 테이블
   ```sql
   -- 테이블에 module_id 컬럼이 있는지 확인
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_schema = 'onboarding' 
     AND table_name = 'quiz_questions';
   
   -- 실제 데이터 확인
   SELECT id, module_id, question, difficulty
   FROM onboarding.quiz_questions
   LIMIT 10;
   
   -- moduleId별 문제 개수 확인
   SELECT module_id, COUNT(*) as question_count
   FROM onboarding.quiz_questions
   GROUP BY module_id;
   ```

## 디버깅 방법

### Option 1: 네트워크 검사 (추천)
1. 브라우저에서 자가점검 시작
2. DevTools > Network 탭 열기
3. `/questions` API 호출 찾기
4. Response 확인:
   ```json
   [
     {
       "id": "q1",
       "moduleId": "???",  // ← 이 값이 무엇인지 확인!
       "question": "온보딩 관련 질문?",
       ...
     }
   ]
   ```

### Option 2: 백엔드 로그 확인
1. `agent-platform` 서버 로그 확인
2. SQL 쿼리 로그 활성화
3. 어떤 WHERE 조건으로 쿼리되는지 확인

### Option 3: 데이터베이스 직접 쿼리
```sql
-- Supabase SQL Editor에서 실행
-- 1. 모든 quiz_questions 확인
SELECT * FROM onboarding.quiz_questions;

-- 2. 특정 모듈의 문제 확인 (예: automation 모듈)
SELECT * FROM onboarding.quiz_questions 
WHERE module_id = 'freshservice-automation';  -- 실제 moduleId로 교체

-- 3. 온보딩 관련 문제 찾기
SELECT * FROM onboarding.quiz_questions 
WHERE question LIKE '%온보딩%' 
   OR question LIKE '%onboarding%';
```

## 예상 수정사항

### 백엔드 수정 (agent-platform)
```python
# app/services/curriculum_repository.py

async def get_quiz_questions(self, module_id: str) -> list[QuizQuestion]:
    """모듈별 퀴즈 문제 조회 - moduleId 필터 추가"""
    result = self.client \
        .table('quiz_questions') \
        .select('*') \
        .eq('module_id', module_id) \  # ← 필터 추가!
        .eq('is_active', True) \       # 활성 문제만
        .order('question_order') \
        .execute()
    
    if not result.data:
        logger.warning(f"No quiz questions found for module: {module_id}")
        return []
    
    return [QuizQuestion(**q) for q in result.data]
```

### 데이터 수정 (필요시)
```sql
-- 잘못 저장된 moduleId 수정
UPDATE onboarding.quiz_questions
SET module_id = 'freshservice-automation'  -- 올바른 모듈 ID
WHERE id IN ('q1', 'q2', 'q3');  -- 문제 ID들

-- 온보딩 전용 문제는 별도 테이블로 분리 (선택사항)
CREATE TABLE onboarding.onboarding_quiz_questions (
  -- 온보딩 시나리오 전용 퀴즈
);
```

## 검증 방법
1. 백엔드 수정 후 서버 재시작
2. 프론트엔드에서 자가점검 시작
3. Network 탭에서 올바른 모듈의 문제가 반환되는지 확인
4. 여러 모듈에서 테스트 (Automation, Asset, Reporting 등)

## 참고 파일
- 프론트엔드: `/pages/ModuleLearningPage.tsx` L95-108
- API 클라이언트: `/services/apiClient.ts` L930-936
- 타입 정의: `/types.ts` L59-69
- 문서: `/docs/handover.md` L18

## 연락처
문제가 지속되면 agent-platform 백엔드 코드를 직접 확인하거나 백엔드 개발자에게 문의.
