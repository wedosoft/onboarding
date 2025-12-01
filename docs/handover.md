# 온보딩 시스템 개발 진행상황

## 프로젝트 개요
신입사원 온보딩을 위한 학습 및 평가 시스템. 사람의 개입을 최소화하고 시스템이 자동으로 학습을 진행하며, 필요시 AI 멘토가 지도하는 형태.

---

## 2024-12-01 작업 내역

### 1. 다크모드 제거 및 라이트모드 통일
- **문제**: 각 페이지마다 라이트/다크 모드 적용이 일관되지 않음
- **해결**: 다크모드 완전 제거, 라이트모드로 통일

**삭제된 파일:**
- `contexts/ThemeContext.tsx`
- `components/ThemeToggle.tsx`

**수정된 파일:**
- `index.html` - Tailwind darkMode 설정 제거
- `index.tsx` - ThemeProvider 래퍼 제거
- 모든 페이지 컴포넌트 - `dark:` 클래스 제거, 라이트모드 색상 통일

---

### 2. 학습 평가 라우팅 수정
- **문제**: 학습 평가에서 "업무 센스 체크", "제품 지식" 시작 버튼이 대시보드로 리다이렉트됨
- **해결**: 누락된 라우트 및 페이지 추가

**생성된 파일:**
- `pages/WorkSenseAssessmentPage.tsx` - 업무 센스 체크 평가 페이지
- `pages/ProductKnowledgeLevelsPage.tsx` - 제품 지식 레벨 목록 페이지
- `pages/ProductKnowledgeLevelPage.tsx` - 레벨별 학습 상세 페이지

**수정된 파일:**
- `App.tsx` - 라우트 추가:
  ```tsx
  <Route path="/assessment/:trackId" element={<WorkSenseAssessmentPage />} />
  <Route path="/assessment/:trackId/levels" element={<ProductKnowledgeLevelsPage />} />
  <Route path="/assessment/:trackId/level/:levelId" element={<ProductKnowledgeLevelPage />} />
  ```

---

### 3. 제품 지식 학습 기능 구현
핵심 기능인 제품 학습 시스템 구현 완료.

#### 학습 흐름 (3단계)
```
학습 콘텐츠 읽기 → AI 멘토 채팅 → 퀴즈 → 결과
```

#### ProductKnowledgeLevelPage.tsx 주요 기능
1. **학습 단계 (Learning Phase)**
   - `streamLearningContent` API로 학습 콘텐츠 스트리밍
   - RAG Store 기반 제품 지식 콘텐츠 생성
   - 마크다운 렌더링

2. **AI 멘토 단계 (Chat Phase)**
   - `streamMentorChat` API로 AI 멘토와 대화
   - 학습 내용 관련 질문/답변
   - 준비되면 퀴즈로 진행

3. **퀴즈 단계 (Quiz Phase)**
   - `getAssessmentQuestions` API로 문제 로드
   - 객관식 퀴즈 UI
   - `submitAssessment` API로 답안 제출

4. **결과 단계 (Result Phase)**
   - 점수 표시 (80% 이상 통과)
   - 통과 시 다음 레벨 언락
   - 재도전 또는 다음 레벨 진행 버튼

---

## 연동 API 목록

### 백엔드 (localhost:8000)
| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/assessment/tracks` | 평가 트랙 목록 |
| `GET /api/assessment/tracks/:trackId/levels` | 레벨 목록 |
| `GET /api/assessment/learning/:trackId/:levelId/stream` | 학습 콘텐츠 스트리밍 |
| `POST /api/assessment/mentor/chat/stream` | AI 멘토 채팅 스트리밍 |
| `GET /api/assessment/questions` | 퀴즈 문제 조회 |
| `POST /api/assessment/submit` | 퀴즈 답안 제출 |

### Supabase
- 인증 전용 (Google OAuth)
- 비즈니스 데이터는 백엔드 API 사용

### Google RAG Store
- 제품 문서 기반 학습 콘텐츠 생성
- AI 멘토 답변 컨텍스트 제공

---

## 파일 구조

```
onboarding/
├── pages/
│   ├── AssessmentPage.tsx          # 평가 트랙 선택
│   ├── WorkSenseAssessmentPage.tsx # 업무 센스 체크
│   ├── ProductKnowledgeLevelsPage.tsx # 제품 지식 레벨 목록
│   └── ProductKnowledgeLevelPage.tsx  # 레벨별 학습 (핵심!)
├── services/
│   └── apiClient.ts                # API 클라이언트 (스트리밍 포함)
├── components/
│   └── layout/
│       ├── MainLayout.tsx
│       ├── Sidebar.tsx
│       └── TopBar.tsx
└── App.tsx                         # 라우팅 설정
```

---

## 남은 작업

### 백엔드 구현 필요
- [ ] `/api/assessment/learning/:trackId/:levelId/stream` - 학습 콘텐츠 스트리밍
- [ ] `/api/assessment/mentor/chat/stream` - AI 멘토 채팅
- [ ] 레벨 완료 시 다음 레벨 언락 로직

### 프론트엔드 개선
- [ ] 학습 진행률 저장/복원
- [ ] 오프라인 지원
- [ ] 학습 완료 알림

---

## 기술 스택
- React 18 + TypeScript
- Vite
- Tailwind CSS (라이트모드)
- React Router v6
- Supabase (인증)
- Google RAG Store (콘텐츠)
