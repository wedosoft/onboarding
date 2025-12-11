# 자가점검 퀴즈 문제 조사 - 실행 가이드

## 🎯 목적
자가점검(Self-Check Quiz)에서 온보딩 관련 질문이 나타나는 문제를 빠르게 진단하고 해결하기 위한 가이드입니다.

---

## 🚀 빠른 시작

### 1단계: 브라우저에서 즉시 테스트

1. 앱을 실행합니다:
   ```bash
   npm run dev
   ```

2. 브라우저에서 자가점검 페이지로 이동

3. DevTools 열기 (F12)

4. Console 탭에서 다음 스크립트 실행:
   ```javascript
   // test_quiz_browser.js 파일 내용을 복사해서 붙여넣기
   // 그 다음 실행:
   testQuizAPI('freshservice-automation');
   ```

5. 결과 확인:
   - ✅ 녹색: 정상
   - ⚠️ 노란색: 경고
   - ❌ 빨간색: 문제 발견

### 2단계: Network 탭으로 실제 API 응답 확인

1. DevTools > Network 탭 열기
2. 자가점검 시작 버튼 클릭
3. `/questions` 요청 찾기
4. Response 탭 확인:
   ```json
   [
     {
       "id": "q1",
       "moduleId": "freshservice-automation",  // ← 이 값 확인!
       "question": "...",
       "difficulty": "basic"
     }
   ]
   ```

### 3단계: 데이터베이스 직접 확인

Supabase SQL Editor에서 `diagnose_quiz_db.sql` 파일의 쿼리를 실행하세요.

---

## 📁 파일 설명

### 1. `INVESTIGATION_REPORT.md` ⭐ (필독)
- **목적**: 전체 조사 결과 요약
- **내용**:
  - 문제 원인 분석
  - 데이터 흐름 다이어그램
  - 수정 방법 (백엔드/DB/프론트엔드)
  - 권장 조치사항

### 2. `debug_quiz_api.md`
- **목적**: 상세 디버깅 가이드
- **내용**:
  - 체크포인트별 확인사항
  - 예상 원인 및 해결책
  - 백엔드 수정 코드 예시

### 3. `test_quiz_browser.js`
- **목적**: 브라우저 콘솔 테스트 스크립트
- **사용법**:
  ```javascript
  // 파일 내용 복사 → DevTools Console에 붙여넣기
  testQuizAPI('모듈ID');
  ```
- **기능**:
  - API 호출 자동화
  - 응답 분석 및 진단
  - 온보딩 문제 자동 감지

### 4. `test_quiz_api.js`
- **목적**: Node.js CLI 테스트 스크립트
- **사용법**:
  ```bash
  node test_quiz_api.js freshservice-automation
  ```
- **기능**: `test_quiz_browser.js`와 동일하지만 서버 사이드 실행

### 5. `diagnose_quiz_db.sql`
- **목적**: 데이터베이스 진단 SQL 쿼리
- **사용법**: Supabase SQL Editor에서 실행
- **기능**:
  - 테이블 구조 확인
  - 모듈별 문제 개수 통계
  - 온보딩 관련 문제 검색
  - 잘못된 데이터 찾기
  - 수정 스크립트 템플릿

---

## 🔍 예상 문제 및 해결

### 문제 1: 여러 모듈의 문제가 섞여 나옴
**원인**: 백엔드에서 `module_id` 필터 누락

**해결**: `agent-platform/app/services/curriculum_repository.py` 수정
```python
result = self.client \
    .table('quiz_questions') \
    .select('*') \
    .eq('module_id', module_id) \  # ← 추가!
    .execute()
```

### 문제 2: 온보딩 관련 질문만 나옴
**원인**: 데이터베이스에 잘못된 `module_id`로 저장됨

**해결**: SQL로 데이터 수정
```sql
-- 올바른 module_id로 업데이트
UPDATE onboarding.quiz_questions
SET module_id = 'freshservice-automation'
WHERE id IN ('q1', 'q2', 'q3');
```

### 문제 3: 문제가 전혀 나오지 않음
**원인 1**: 데이터베이스에 해당 모듈의 문제가 없음
**해결 1**: 문제 데이터 추가 필요

**원인 2**: `is_active = false`로 설정됨
**해결 2**: 
```sql
UPDATE onboarding.quiz_questions
SET is_active = true
WHERE module_id = 'freshservice-automation';
```

---

## 📊 디버깅 체크리스트

### 프론트엔드 (현재 repo)
- [x] `ModuleLearningPage.tsx`에서 올바른 moduleId 전달 확인
- [x] `apiClient.ts`에서 올바른 API 엔드포인트 호출 확인
- [x] URL 파라미터에서 moduleId 올바르게 추출 확인

### 백엔드 (agent-platform repo)
- [ ] `curriculum.py`에서 module_id 파라미터 받는지 확인
- [ ] `curriculum_repository.py`의 `get_quiz_questions()`에 필터 있는지 확인
- [ ] 반환된 데이터에 올바른 moduleId가 있는지 확인

### 데이터베이스
- [ ] `quiz_questions` 테이블에 `module_id` 컬럼 존재 확인
- [ ] 각 모듈별로 문제가 존재하는지 확인
- [ ] 온보딩 문제와 커리큘럼 문제가 분리되어 있는지 확인

---

## 🛠️ 수정 후 검증

### 1. 백엔드 수정 후
```bash
# 백엔드 서버 재시작
cd agent-platform
uvicorn app.main:app --reload

# 프론트엔드에서 테스트
cd onboarding
npm run dev
```

### 2. 데이터베이스 수정 후
```sql
-- 수정 확인
SELECT module_id, COUNT(*) as count
FROM onboarding.quiz_questions
WHERE is_active = true
GROUP BY module_id;
```

### 3. 브라우저에서 수동 테스트
1. 여러 모듈의 자가점검 시작
2. 각 모듈에 맞는 문제가 나오는지 확인
3. 온보딩 관련 문제가 더 이상 나오지 않는지 확인

---

## 📞 지원

문제가 지속되면 다음을 확인하세요:

1. **백엔드 로그**: `agent-platform` 서버의 로그에서 SQL 쿼리 확인
2. **Supabase 로그**: Database > Logs에서 실제 실행된 쿼리 확인
3. **네트워크 탭**: 브라우저 DevTools에서 실제 API 응답 확인

---

## 📚 추가 자료

- [INVESTIGATION_REPORT.md](./INVESTIGATION_REPORT.md) - 전체 조사 결과
- [debug_quiz_api.md](./debug_quiz_api.md) - 상세 디버깅 가이드
- [docs/handover.md](./docs/handover.md) - 프로젝트 아키텍처
- [docs/handover-redesign.md](./docs/handover-redesign.md) - 재디자인 문서

---

## ✅ 체크리스트

완료 여부를 체크하세요:

- [ ] `test_quiz_browser.js`로 문제 진단 완료
- [ ] Network 탭에서 실제 API 응답 확인
- [ ] `diagnose_quiz_db.sql`로 데이터베이스 상태 확인
- [ ] 문제 원인 파악 (백엔드 필터 or 데이터 문제)
- [ ] 백엔드 코드 수정 or 데이터 수정
- [ ] 수정 후 여러 모듈에서 테스트
- [ ] 온보딩 문제가 더 이상 나타나지 않는지 확인
