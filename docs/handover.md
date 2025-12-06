# 온보딩 시스템 개발 진행상황

## 프로젝트 개요
신입사원 온보딩을 위한 학습 및 평가 시스템. 사람의 개입을 최소화하고 시스템이 자동으로 학습을 진행하며, 필요시 AI 멘토가 지도하는 형태.

---

## 아키텍처

### 프론트엔드/백엔드 분리
- **프론트엔드 (onboarding)**: React + Vite, Supabase JS Client
- **백엔드 (agent-platform)**: FastAPI, Supabase Python Client, Gemini RAG

### 데이터베이스 스키마
- **`onboarding` 스키마**: 커리큘럼 전용 테이블 (데이터 격리)
  - `curriculum_modules` - 학습 모듈 정의
  - `module_contents` - 모듈별 정적 콘텐츠
  - `quiz_questions` - 퀴즈 문제
  - `module_progress` - 학습 진도
  - `quiz_attempts` - 퀴즈 시도 기록

### Supabase 스키마 노출 설정
```sql
-- PostgREST에 onboarding 스키마 노출 (Supabase SQL Editor에서 실행)
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, onboarding';
NOTIFY pgrst, 'reload config';
```

---

## 2025-12-06 작업 내역

### 1. IA 단순화 (3탭 네비게이션)
- **기존**: 복잡한 사이드바 메뉴
- **변경**: 커리큘럼 / 자료실 / 멘토 (3탭)

### 2. 6단계 LMS 커리큘럼 구조
모든 모듈은 동일한 6단계 학습 구조를 따름:

| 순서 | 섹션 타입 | 레벨 | 설명 |
|-----|----------|------|------|
| 1 | overview | basic | 핵심 개념 소개 |
| 2 | overview | intermediate | 상세 개념 설명 |
| 3 | overview | advanced | 심화 개념 |
| 4 | feature-basic | basic | 기본 기능 설명 |
| 5 | feature-advanced | basic | 고급 기능 설명 |
| 6 | practice | basic | 실습 과제 |
| 7 | quiz | basic | 자가 점검 |

### 3. 70/30 레이아웃
- **콘텐츠 영역**: 70% (왼쪽)
- **AI 멘토 채팅**: 30% (오른쪽, 상시 노출)

### 4. 스키마 분리
- **프론트엔드**: `supabaseClient.ts`에서 `db: { schema: 'onboarding' }` 설정
- **백엔드**: `curriculum_repository.py`에서 `ClientOptions(schema="onboarding")` 설정

---

## 주요 파일 수정 내역

### 프론트엔드 (onboarding)

| 파일 | 변경 내용 |
|------|----------|
| `services/supabaseClient.ts` | 기본 스키마를 `onboarding`으로 설정 |
| `pages/ModuleLearningPage.tsx` | 6단계 섹션 아이콘, 70/30 레이아웃, displayOrder 정렬 |
| `components/ModuleChatSidebar.tsx` | AI 멘토 채팅 컴포넌트 |

### 백엔드 (agent-platform)

| 파일 | 변경 내용 |
|------|----------|
| `app/services/curriculum_repository.py` | `ClientOptions(schema="onboarding")` 추가 |
| `app/api/routes/curriculum.py` | 모듈/콘텐츠/채팅 API 엔드포인트 |

---

## 연동 API 목록

### 커리큘럼 API (`/api/curriculum`)
| 엔드포인트 | 설명 |
|-----------|------|
| `GET /modules` | 모듈 목록 조회 |
| `GET /modules/{moduleId}` | 모듈 상세 조회 |
| `GET /modules/{moduleId}/contents` | 정적 콘텐츠 조회 (DB) |
| `GET /modules/{moduleId}/chat/stream` | AI 멘토 채팅 (RAG 기반) |
| `GET /modules/{moduleId}/questions` | 퀴즈 문제 조회 |
| `POST /modules/{moduleId}/submit` | 퀴즈 답안 제출 |

### RAG 설정
- `gemini_store_common`: 제품 문서 RAG 스토어
- 멘토 채팅에서 `product` 메타데이터 필터 적용

---

## 남은 작업

### 완료
- [x] ~~Supabase `onboarding` 스키마 API 노출 설정~~ (완료 2025-12-06)
- [x] ~~핵심 제품군 모듈 콘텐츠 확장~~ (완료 2025-12-06)
  - Freshservice automation: 0개 → 6개 콘텐츠
  - Freshservice asset-cmdb: 3개 → 6개 콘텐츠
  - Freshservice reporting: 4개 → 7개 콘텐츠

### 대기 중
- [ ] 학습 진행률 저장/복원
- [ ] 퀴즈 결과 기반 다음 단계 언락
- [ ] 추가 제품 모듈 콘텐츠 (선택사항)

---

## 파일 구조

```
onboarding/
├── pages/
│   ├── CurriculumModulesPage.tsx    # 모듈 목록
│   ├── ModuleLearningPage.tsx       # 모듈 학습 (핵심!) - 6단계 + 멘토
│   ├── DocumentsPage.tsx            # 자료실
│   └── KnowledgeChatPage.tsx        # 멘토 (자유 질문)
├── services/
│   ├── apiClient.ts                 # 백엔드 API 클라이언트
│   └── supabaseClient.ts            # Supabase 클라이언트 (onboarding 스키마)
├── components/
│   ├── ModuleChatSidebar.tsx        # AI 멘토 채팅 사이드바
│   └── layout/
│       ├── MainLayout.tsx
│       ├── Sidebar.tsx              # 3탭 네비게이션
│       └── TopBar.tsx
└── App.tsx

agent-platform/
├── app/
│   ├── api/routes/
│   │   └── curriculum.py            # 커리큘럼 API
│   ├── services/
│   │   └── curriculum_repository.py # Supabase 연동 (onboarding 스키마)
│   └── core/
│       └── config.py                # 환경변수 설정
```

---

## 기술 스택
- **프론트엔드**: React 18, TypeScript, Vite, Tailwind CSS
- **백엔드**: FastAPI, Python 3.9+
- **데이터베이스**: Supabase (PostgreSQL) - `onboarding` 스키마
- **AI/RAG**: Google Gemini, Gemini File Search (RAG Store)
- **인증**: Supabase Auth (Google OAuth)
