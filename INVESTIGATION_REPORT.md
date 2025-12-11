# 자가점검 온보딩 질문 문제 - 최종 조사 보고서

## 📋 요약
자가점검(Self-Check Quiz)에서 모듈별 질문이 나와야 하는데 온보딩 관련 질문이 나타나는 문제 조사 완료.

**결론**: 문제는 백엔드 API에 있으며, `agent-platform` 저장소의 코드 수정이 필요합니다.

---

## 🔍 조사 결과

### 1. 데이터 흐름 (검증 완료)

```
사용자 → ModuleLearningPage.tsx (Line 99)
  ↓ moduleId = "freshservice-automation" (from URL)
  
apiClient.getQuizQuestions(moduleId) (Line 930-935)
  ↓ GET /api/curriculum/modules/{moduleId}/questions
  
[백엔드 API - agent-platform 저장소]
  ↓ app/api/routes/curriculum.py
  ↓ app/services/curriculum_repository.py
  ↓ SELECT * FROM onboarding.quiz_questions WHERE module_id = ?
  
Supabase 데이터베이스
  ↓ onboarding.quiz_questions 테이블
  
반환: QuizQuestion[] → 프론트엔드
```

### 2. 프론트엔드 (현재 repo) - ✅ 정상

**확인 사항:**
- ✅ `ModuleLearningPage.tsx` L99: `getQuizQuestions(moduleId!)` 올바르게 호출
- ✅ `apiClient.ts` L930-936: 정확한 엔드포인트 사용
- ✅ moduleId는 URL 파라미터로부터 올바르게 가져옴
- ✅ 프론트엔드에서 직접 DB 접근 없음

**결론**: 프론트엔드 코드에는 문제가 없습니다.

### 3. 백엔드 (agent-platform repo) - ⚠️ 확인 필요

**문제가 있을 가능성이 높은 위치:**

#### 파일 1: `agent-platform/app/api/routes/curriculum.py`
```python
@router.get("/modules/{module_id}/questions")
async def get_quiz_questions(module_id: str):
    """퀴즈 문제 조회"""
    # ⚠️ module_id를 repository에 전달하는지 확인
    questions = await repository.get_quiz_questions(module_id)
    return questions
```

#### 파일 2: `agent-platform/app/services/curriculum_repository.py`
```python
async def get_quiz_questions(self, module_id: str) -> list[QuizQuestion]:
    """모듈별 퀴즈 문제 조회"""
    
    # ❌ 문제 가능성 1: module_id 필터 누락
    # 잘못된 예:
    result = self.client.table('quiz_questions').select('*').execute()
    
    # ✅ 올바른 예:
    result = self.client \
        .table('quiz_questions') \
        .select('*') \
        .eq('module_id', module_id) \  # ← 이 필터가 필요!
        .eq('is_active', True) \
        .order('question_order') \
        .execute()
    
    return [QuizQuestion(**q) for q in result.data]
```

### 4. 데이터베이스 - ❓ 확인 필요

**가능한 문제:**
1. `quiz_questions` 테이블에 `module_id` 컬럼이 없음
2. 데이터가 잘못된 `module_id`로 저장됨
3. 온보딩 문제와 커리큘럼 문제가 같은 테이블에 혼재

**확인 방법**: `diagnose_quiz_db.sql` 실행

---

## 🛠️ 수정 방법

### Option 1: 백엔드 코드 수정 (권장)

**파일**: `agent-platform/app/services/curriculum_repository.py`

```python
async def get_quiz_questions(self, module_id: str) -> list[QuizQuestion]:
    """모듈별 퀴즈 문제 조회 - moduleId 필터 추가"""
    
    try:
        result = self.client \
            .table('quiz_questions') \
            .select('*') \
            .eq('module_id', module_id) \  # ✅ 필터 추가!
            .eq('is_active', True) \       # 활성 문제만
            .order('question_order') \
            .execute()
        
        if not result.data:
            logger.warning(f"No quiz questions found for module: {module_id}")
            return []
        
        return [QuizQuestion(**q) for q in result.data]
        
    except Exception as e:
        logger.error(f"Error fetching quiz questions for {module_id}: {e}")
        raise
```

### Option 2: 데이터베이스 수정

**문제**: 온보딩 관련 문제가 잘못된 `module_id`로 저장되었을 경우

```sql
-- 1. 현재 상태 확인
SELECT module_id, COUNT(*) as count
FROM onboarding.quiz_questions
GROUP BY module_id;

-- 2. 온보딩 문제 찾기
SELECT id, module_id, question
FROM onboarding.quiz_questions
WHERE question ILIKE '%온보딩%' 
   OR question ILIKE '%onboarding%'
   OR module_id ILIKE '%onboarding%';

-- 3. 잘못된 module_id 수정
UPDATE onboarding.quiz_questions
SET module_id = 'freshservice-automation'  -- 올바른 모듈 ID
WHERE id IN ('q1', 'q2', 'q3');  -- 수정할 문제 ID들

-- 또는 온보딩 문제를 비활성화
UPDATE onboarding.quiz_questions
SET is_active = false
WHERE question ILIKE '%온보딩%';
```

### Option 3: 프론트엔드 임시 필터 (비추천)

**주의**: 근본적인 해결책이 아니며, 성능 저하 발생 가능

```typescript
// services/apiClient.ts
export async function getQuizQuestions(
  moduleId: string
): Promise<QuizQuestion[]> {
  const questions = await apiFetch<QuizQuestion[]>(
    `/curriculum/modules/${encodeURIComponent(moduleId)}/questions`
  );
  
  // ⚠️ 임시 필터: 클라이언트 사이드에서 필터링
  return questions.filter(q => 
    q.moduleId === moduleId && 
    !q.question.includes('온보딩') &&
    !q.question.toLowerCase().includes('onboarding')
  );
}
```

---

## 📊 디버깅 도구

### 1. 브라우저에서 즉시 테스트
```javascript
// DevTools > Console에서 실행
// (test_quiz_browser.js 파일 내용 복사 후)
testQuizAPI('freshservice-automation');
```

### 2. 네트워크 탭 확인
1. 자가점검 시작
2. DevTools > Network 탭
3. `/questions` 요청 찾기
4. Response 확인:
   - `moduleId` 값이 요청한 것과 일치하는지?
   - 온보딩 관련 질문이 포함되어 있는지?

### 3. 데이터베이스 직접 확인
```bash
# Supabase SQL Editor에서
psql -h <supabase-host> -d postgres -U postgres

# diagnose_quiz_db.sql 파일의 쿼리 실행
```

---

## ✅ 권장 조치사항

### 즉시 조치 (백엔드 팀)
1. **agent-platform 저장소 확인**
   - `app/services/curriculum_repository.py`의 `get_quiz_questions()` 함수
   - `module_id` 필터가 있는지 확인
   - 없다면 추가

2. **데이터베이스 확인**
   - `diagnose_quiz_db.sql` 실행
   - 온보딩 문제와 커리큘럼 문제 분리 필요 여부 확인

3. **테스트**
   - 수정 후 각 모듈별로 퀴즈 테스트
   - 올바른 문제만 반환되는지 확인

### 장기 개선사항
1. **테이블 분리 검토**
   ```sql
   -- 온보딩 전용 테이블
   CREATE TABLE onboarding.onboarding_quiz_questions (
     -- 시나리오 기반 퀴즈
   );
   
   -- 커리큘럼 전용 테이블 (기존)
   -- onboarding.quiz_questions
   ```

2. **API 응답 검증 추가**
   ```python
   # 반환 전 검증
   for q in questions:
       assert q.module_id == module_id, "Module ID mismatch!"
   ```

3. **E2E 테스트 추가**
   ```typescript
   // tests/e2e/quiz.spec.ts
   test('should load correct quiz questions for module', async () => {
     // ...
   });
   ```

---

## 📞 다음 단계

1. ✅ **프론트엔드 조사 완료** (현재 repo)
2. ⏳ **백엔드 확인 필요** (agent-platform repo)
   - `curriculum_repository.py` 파일 열기
   - `get_quiz_questions()` 함수 확인
   - 필요시 수정

3. ⏳ **데이터베이스 검증 필요**
   - `diagnose_quiz_db.sql` 실행
   - 데이터 무결성 확인

4. ⏳ **수정 후 테스트**
   - 각 모듈별 퀴즈 로드 테스트
   - 네트워크 탭으로 응답 확인

---

## 📚 참고 파일

**현재 저장소 (onboarding):**
- `/pages/ModuleLearningPage.tsx` - L95-108 (퀴즈 로드)
- `/services/apiClient.ts` - L930-936 (API 호출)
- `/types.ts` - L59-69 (QuizQuestion 타입)
- `/debug_quiz_api.md` - 디버깅 가이드
- `/test_quiz_browser.js` - 브라우저 테스트 스크립트
- `/diagnose_quiz_db.sql` - SQL 진단 스크립트
- `/docs/handover.md` - 프로젝트 문서

**백엔드 저장소 (agent-platform):**
- `/app/api/routes/curriculum.py` - API 라우트
- `/app/services/curriculum_repository.py` - DB 접근 레이어

---

## 🎯 결론

**문제 위치**: 백엔드 API (`agent-platform` 저장소)의 `curriculum_repository.py`

**예상 원인**: `get_quiz_questions()` 함수에서 `module_id` 필터 누락

**해결 방법**: 백엔드 코드에 `.eq('module_id', module_id)` 필터 추가

**검증 필요**: 데이터베이스의 `quiz_questions` 테이블 데이터 무결성

**담당**: 백엔드 개발자 또는 `agent-platform` 저장소 접근 권한이 있는 개발자
