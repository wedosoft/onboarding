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

## 2025-12-03 작업 내역

### 1. 섹션 기반 학습 UI 구현
- **문제**: 학습 콘텐츠가 한번에 너무 많이 표시되어 집중력 저하
- **해결**: 4개 섹션으로 분할하여 단계별 학습

**섹션 구성:**
1. **개요** - 핵심 개념 및 용어 설명
2. **주요 기능** - 실제 기능과 사용법
3. **실무 활용** - 베스트 프랙티스와 팁
4. **FAQ** - 자주 묻는 질문

**백엔드 API 추가:**
- `GET /api/curriculum/modules/{moduleId}/section/stream` - 섹션별 콘텐츠 스트리밍
  - 파라미터: `sessionId`, `sectionId`, `sectionPrompt`

**프론트엔드 수정:**
- `services/apiClient.ts` - `streamModuleSection()` 함수 추가
- `pages/ModuleLearningPage.tsx` - 섹션 네비게이션 UI

---

### 2. 인라인 AI 멘토 채팅 추가
- **문제**: 학습 중 질문하려면 별도 페이지로 이동해야 함
- **해결**: 학습 페이지 우측에 AI 멘토 채팅 패널 추가

**주요 기능:**
- 학습 중 실시간 질문/답변
- 추천 질문 버튼 (예: "이 기능의 핵심이 뭐예요?")
- 스트리밍 응답으로 자연스러운 대화 경험

**API:**
- `GET /api/curriculum/modules/{moduleId}/chat/stream` - 채팅 스트리밍
  - 파라미터: `sessionId`, `query`

---

### 3. 라이트모드 테마 정리
- **문제**: 일부 컴포넌트에 `dark-*` 클래스 남아있음
- **해결**: `ModuleLearningPage.tsx` 전체를 라이트 테마로 재작성
  - `bg-slate-50`, `bg-white`, `text-slate-*` 사용
  - `border-slate-*` 일관성 있게 적용

---

## 결정 필요 사항

### "제품 지식 챗" 페이지 통합 논의

현재 사이드바에 두 개의 유사한 메뉴가 있음:
- **핵심 기능 학습** (`/curriculum/modules`) - 구조화된 커리큘럼 + 퀴즈
- **제품 지식 챗** (`/knowledge`) - 자유로운 Q&A

**문제점:**
- 이제 "핵심 기능 학습" 페이지에 인라인 채팅이 있어 역할이 겹침
- 사용자 혼란 가능성

**통합 옵션:**

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **A. 리다이렉트** | "제품 지식 챗" 클릭 시 모듈 선택 → 학습 페이지로 | 기존 메뉴 유지 | 두 단계 필요 |
| **B. 탭 추가** | 학습 페이지에 "학습 모드" / "자유 질문 모드" 탭 | 유연한 전환 | UI 복잡도 증가 |
| **C. 메뉴 제거 (추천)** | 사이드바에서 "제품 지식 챗" 제거 | 간결한 네비게이션 | 자유 질문 전용 공간 없음 |

**추천: 옵션 C**
- 학습 페이지 내 인라인 채팅으로 자유 질문 가능
- 사이드바 단순화로 UX 개선
- 필요시 학습 페이지 상단에 "자유 질문" 섹션 추가 가능

---

## 남은 작업

### 백엔드 구현 필요
- [x] `/api/curriculum/modules/{moduleId}/section/stream` - 섹션별 콘텐츠 스트리밍
- [x] `/api/curriculum/modules/{moduleId}/chat/stream` - AI 멘토 채팅
- [ ] `/api/assessment/learning/:trackId/:levelId/stream` - 평가 학습 콘텐츠 스트리밍
- [ ] `/api/assessment/mentor/chat/stream` - 평가 AI 멘토 채팅
- [ ] 레벨 완료 시 다음 레벨 언락 로직

### 프론트엔드 개선
- [x] 섹션 기반 학습 UI
- [x] 인라인 AI 멘토 채팅
- [x] 라이트모드 테마 통일
- [ ] "제품 지식 챗" 통합 결정 후 적용
- [ ] 학습 진행률 저장/복원
- [ ] 오프라인 지원
- [ ] 학습 완료 알림

---

## 현재 파일 구조

```
onboarding/
├── pages/
│   ├── AssessmentPage.tsx              # 평가 트랙 선택
│   ├── WorkSenseAssessmentPage.tsx     # 업무 센스 체크
│   ├── ProductKnowledgeLevelsPage.tsx  # 제품 지식 레벨 목록
│   ├── ProductKnowledgeLevelPage.tsx   # 레벨별 학습
│   ├── CurriculumModulesPage.tsx       # 커리큘럼 모듈 목록
│   ├── ModuleLearningPage.tsx          # 모듈 학습 (핵심!) - 섹션 + 채팅 + 퀴즈
│   └── KnowledgeChatPage.tsx           # 제품 지식 챗 (통합 검토 중)
├── services/
│   └── apiClient.ts                    # API 클라이언트 (스트리밍 포함)
├── components/
│   └── layout/
│       ├── MainLayout.tsx
│       ├── Sidebar.tsx                 # 네비게이션 메뉴
│       └── TopBar.tsx
└── App.tsx                             # 라우팅 설정
```

---

## 기술 스택
- React 18 + TypeScript
- Vite
- Tailwind CSS (라이트모드)
- React Router v6
- Supabase (인증)
- Google RAG Store (콘텐츠)
