# 온보딩 시스템 재디자인 & LMS 개선 프로젝트 핸드오버 문서

**작성일**: 2025-12-08
**최종 업데이트**: 2025-12-08 (16:30)
**프로젝트**: Wedosoft 신입사원 온보딩 시스템 전면 개선
**목표**: Homepage 디자인 시스템(ShadCN UI) 도입 + LMS 학습 효율성 개선

---

## 🎯 현재 진행 상황 (2025-12-08 기준)

### ✅ Phase 1: 디자인 시스템 기반 구축 - **완료** (100%)
- ✅ 모든 패키지 설치 완료
- ✅ Tailwind CSS + HSL 색상 시스템 설정
- ✅ 테마 프로바이더 통합 (다크/라이트 모드)
- ✅ index.css 완전 교체 (728줄)
- ✅ ShadCN UI 컴포넌트 10개 복사

### 🔄 Phase 2: 컴포넌트 마이그레이션 - **진행 중** (33% - 4/12 페이지)

**완료된 페이지 (4개):**
1. ✅ DashboardPage.tsx (226줄)
2. ✅ CurriculumModulesPage.tsx (233줄)
3. ✅ ModuleLearningPage.tsx (848줄) ⭐ 가장 복잡
4. ✅ ProductSelectionPage.tsx (224줄)

**다음 작업 대상 (8개):**
5. ⏳ ProductCategoriesPage.tsx - 제품별 카테고리 선택
6. ⏳ CategoryLearningPage.tsx - 카테고리별 학습
7. ⏳ ProductChatPage.tsx - 제품별 AI 채팅
8. ⏳ KnowledgeChatPage.tsx - 지식 베이스 채팅
9. ⏳ DocumentsPage.tsx - 인수인계 문서
10. ⏳ ScenariosPage.tsx - 시나리오 학습
11. ⏳ AdminPage.tsx - 관리자 페이지
12. ⏳ (추가 페이지 확인 필요)

### ⏸️ Phase 3: 데이터베이스 스키마 확장 - **대기 중**
- 아직 시작 안함

### ⏸️ Phase 4: LMS 기능 구현 - **대기 중**
- 아직 시작 안함

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [현황 분석](#현황-분석)
3. [Homepage 디자인 시스템 분석](#homepage-디자인-시스템-분석)
4. [LMS 전문가 권장사항](#lms-전문가-권장사항)
5. [구현 계획](#구현-계획)
6. [즉시 시작 가이드](#즉시-시작-가이드)

---

## 프로젝트 개요

### 목표
1. **디자인 시스템 완전 교체**: Homepage 프로젝트의 ShadCN UI 기반 디자인 시스템을 온보딩 시스템에 완전히 도입
2. **LMS 학습 효율성 개선**: 스킬 기반 학습 경로, 마이크로러닝, 사용자 여정 최적화

### 요구사항
- ✅ 색상 팔레트 완전 통일 (현재: 일관성 없음)
- ✅ ShadCN UI 도입하여 아름다운 페이지 구축
- ✅ 다크/라이트 모드 완전 지원
- ✅ 학습 경로 최적화 (적응형 학습)
- ✅ 사용자 여정 개선 (마찰 제거)

### 프로젝트 범위
- **기간**: 6-8주
- **예상 공수**: 144시간
- **위험도**: 중간 (대규모 디자인 마이그레이션 + DB 스키마 변경)

---

## 현황 분석

### 1. 온보딩 시스템 현황

**프로젝트 위치**: `/Users/alan/GitHub/onboarding/`

#### 기술 스택
```
프레임워크: React 19.1.1 + TypeScript 5.8.2
빌드 도구: Vite 6.2.0
라우터: React Router DOM 7.9.6
스타일링: Tailwind CSS (커스텀 Glassmorphism)
데이터베이스: Supabase (PostgreSQL)
AI 통합: Google Gemini API
인증: Supabase Auth + Google OAuth
```

#### 디렉토리 구조
```
/Users/alan/GitHub/onboarding/
├── components/
│   ├── layout/              # 레이아웃 컴포넌트
│   │   ├── MainLayout.tsx
│   │   ├── TopNav.tsx
│   │   ├── TopBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── PageContainer.tsx
│   │   ├── SurfaceCard.tsx  # ← 교체 대상
│   │   └── SectionHeader.tsx
│   ├── Landing.tsx
│   ├── Chatbot.tsx
│   ├── ModuleChatSidebar.tsx
│   └── [기타 컴포넌트]
├── pages/                   # 페이지 컴포넌트 (12개)
│   ├── DashboardPage.tsx    # 220줄 - 우선순위 1
│   ├── CurriculumModulesPage.tsx  # 240줄 - 우선순위 2
│   ├── ModuleLearningPage.tsx     # 842줄 - 우선순위 3 (대규모 리팩토링)
│   └── [9개 추가 페이지]
├── services/
│   ├── apiClient.ts         # API 통신 (1,039줄)
│   ├── geminiService.ts
│   └── supabaseClient.ts
├── contexts/
│   └── AuthContext.tsx
├── index.css                # ← 완전 교체 필요
├── App.tsx
├── index.tsx
├── types.ts
└── constants.ts
```

#### 현재 색상 팔레트 (문제점)
```css
/* 일관성 없는 색상 사용 */
Primary: Indigo (#6366f1)
Secondary/Accent: Teal (#14b8a6)
Background: Slate-50 (#f8fafc)
Sidebar: Slate-900 (#0f172a)

/* 문제: 페이지마다 다른 색상 사용, 테마 없음 */
```

#### 학습 구조
```
1. 시나리오 기반 학습 (12개 시나리오)
2. 제품 지식 평가 (AI 멘토 스트리밍)
3. 커리큘럼 모듈 (6단계 구조)
   - Overview → Feature Basic → Feature Advanced → Practice → Quiz
```

#### 활성 모듈 (Freshservice)
- Automation Module
- Asset Management Module
- Reporting Module

#### 데이터베이스 스키마
```sql
-- 핵심 테이블 (onboarding 스키마)
curriculum_modules       # 모듈 정의
module_contents         # 학습 콘텐츠 (6단계)
quiz_questions          # 퀴즈 문제
module_progress         # 사용자 진도
quiz_attempts           # 퀴즈 제출 이력
```

### 2. 현재 시스템의 문제점

#### 디자인 문제
- ❌ 색상 팔레트 일관성 없음 (Indigo, Teal, Slate 혼재)
- ❌ 다크 모드 미지원
- ❌ 커스텀 컴포넌트 중복 (SurfaceCard, TopNav, TopBar, Sidebar)
- ❌ 디자인 토큰 없음
- ❌ 테마 시스템 부재

#### UX/LMS 문제
- ❌ 모든 사용자가 동일한 학습 경로 (스킬 레벨 무시)
- ❌ 6개 큰 섹션 → 인지 부하 높음
- ❌ 진도 추적 모호 (섹션 단위만 추적)
- ❌ 3개 학습 경로 간 연결 불명확
- ❌ "학습 이어하기" 기능 없음
- ❌ 40% 이상의 불필요한 클릭

---

## Homepage 디자인 시스템 분석

**프로젝트 위치**: `/Users/alan/GitHub/homepage/`

### 기술 스택
```
프레임워크: Next.js 15.5.7
언어: TypeScript
스타일링: Tailwind CSS 3.4.17 + ShadCN UI (New York style)
아이콘: Lucide React 0.544.0 + Heroicons
테마: next-themes 0.4.6 (다크/라이트 모드)
폼: React Hook Form + Zod
```

### 색상 시스템 (HSL 기반)

#### Light Mode
```css
--background: 0 0% 100%;           /* #FFFFFF - White */
--foreground: 222 84% 5%;          /* #001A4D - Dark blue text */
--primary: 215 45% 45%;            /* #4B7FB8 - Bright blue */
--secondary: 210 40% 94%;          /* #F0F6FB - Light blue-gray */
--muted: 210 40% 96%;              /* #F5F9FB - Very light */
--muted-foreground: 215 20% 35%;   /* #5B7080 - Medium gray */
--accent: 210 40% 94%;             /* #F0F6FB - Light accent */
--destructive: 0 84% 60%;          /* #FA523C - Red */
--border: 214 32% 91%;             /* #E8F0F5 - Light borders */
--ring: 210 100% 56%;              /* #00A8FF - Focus rings */
```

#### Dark Mode
```css
--background: 0 0% 3.9%;           /* #0A0A0A - Almost black */
--foreground: 0 0% 98%;            /* #FAFAFA - Almost white */
--primary: 0 0% 98%;               /* #FAFAFA */
--secondary: 0 0% 14.9%;           /* #262626 - Dark gray */
--muted: 0 0% 14.9%;               /* #262626 */
--muted-foreground: 0 0% 63.9%;    /* #A3A3A3 - Light gray */
--accent: 0 0% 14.9%;              /* #262626 */
--destructive: 0 62.8% 30.6%;      /* #BF3629 - Dark red */
--border: 0 0% 14.9%;              /* #262626 */
--ring: 0 0% 83.1%;                /* #D4D4D4 */
```

### 타이포그래피
```css
폰트: Pretendard (한글 최적화)
      -apple-system, BlinkMacSystemFont, system-ui

h1: 2.5rem (40px) | 700 | line-height: 1.2
h2: 2.0rem (32px) | 600 | line-height: 1.25
h3: 1.5rem (24px) | 600 | line-height: 1.3
h4: 1.25rem (20px) | 600 | line-height: 1.4
p:  1.0rem (16px) | 400 | line-height: 1.6
```

### Border Radius (Linear.app 스타일)
```css
--radius-sm: 6px      /* 매우 작은 요소 */
--radius: 8px         /* 작은 버튼 */
--radius-lg: 10px     /* 기본/큰 버튼 (Linear 기본값) */
2xl: 16px
3xl: 20px
full: 9999px
```

### ShadCN UI 컴포넌트 (44개)
```
Form Controls: Input, Label, Select, RadioGroup, Checkbox, Switch, Slider
Layout: Dialog, Dropdown Menu, Navigation Menu, Sheet, Popover, ScrollArea
Feedback: Alert, AlertDialog, Progress, Skeleton, Badge
Display: Card, Tabs, Accordion, Separator, Table
Custom: Carousel, DeviceFrame, CurrencyConverter, SearchModal, PricingModal
```

### 핵심 파일 위치

#### 필수 복사 파일
```
/Users/alan/GitHub/homepage/app/globals.css
  → CSS 변수, 타이포그래피, 애니메이션

/Users/alan/GitHub/homepage/tailwind.config.js
  → Tailwind 테마 설정

/Users/alan/GitHub/homepage/lib/utils.ts
  → cn() 클래스 병합 함수

/Users/alan/GitHub/homepage/lib/design-tokens.ts
  → 디자인 토큰 상수

/Users/alan/GitHub/homepage/components/providers/theme-provider.tsx
  → 테마 프로바이더

/Users/alan/GitHub/homepage/components/ui/
  → ShadCN UI 컴포넌트 44개
```

---

## LMS 전문가 권장사항

### 현재 시스템 평가

#### 강점
- ✅ 최신 AI 통합 (Google Gemini 스트리밍)
- ✅ 체계적인 6단계 학습 구조
- ✅ 세션 기반 진도 추적
- ✅ 깔끔한 React 19 + TypeScript 아키텍처

#### 치명적 약점
- ❌ **학습 경로 파편화**: 3개 독립된 경로로 혼란 유발
- ❌ **획일적 진행**: 스킬 평가 없이 모두 동일 경로
- ❌ **정보 과부하**: 20분짜리 섹션 6개 (인지 부하)
- ❌ **참여 메커니즘 부족**: 게이미피케이션, 스트릭 없음
- ❌ **분석 부재**: 학습 효과 측정 불가

### Top 5 전략적 권장사항

#### 1. 스킬 기반 라우팅 (최우선)
**구현**: Month 1, Week 1-2

```
로그인 후 5분 진단 퀴즈 실시
  ↓
3가지 학습 경로 중 자동 할당:
  - Fast Track: 경험자 (Basic 건너뛰기) → 30% 시간 절약
  - Standard Track: 신규자 (전체 과정)
  - Refresher Track: 복습자 (Practice 중심)
```

**예상 효과**:
- 30% 완료 시간 단축 (경험자)
- 25% 참여도 증가 (지루함 감소)
- 10% 완료율 향상

#### 2. 마이크로러닝 청킹 (고우선)
**구현**: Month 1, Week 3-4

```
현재: Overview (20분) → Feature Basic (25분) → Quiz
개선: Atom 1.1 (3분) → Quick Check → Atom 1.2 (4분) → Quick Check → Quiz

6개 큰 섹션 → 18개 작은 Atom으로 분할 (모듈당)
```

**예상 효과**:
- 85%+ Atom 완료율 (vs. 60% 섹션 완료율)
- 빈번한 "완료 승리"로 동기부여
- 재개 용이 (정확한 지점 기억)

#### 3. 적응형 학습 시스템
**구현**: Month 2, Week 1-2

```
규칙 기반 적응:
  - 콘텐츠 변형: 빠른 학습자 → 요약, 느린 학습자 → 상세 가이드
  - 적응형 퀴즈: 난이도 자동 조정 (IRT 알고리즘)
  - 능동적 AI: 10분 이상 정체 시 챗봇 개입
```

**예상 효과**:
- 15% 퀴즈 점수 향상
- 20% "정체 시간" 감소
- 25% 역량 도달 시간 단축

#### 4. 게이미피케이션 & 소셜 학습
**구현**: Month 2, Week 3-4

```
참여 메커니즘:
  - 스킬 트리: 잠긴/해제된 모듈 시각화
  - 배지: 15-20개 업적 (완료, 속도, 숙달, 동료 돕기)
  - 스트릭: 일일 학습 연속 기록 + 리마인더
  - Q&A 포럼: 동료 도움 + 평판 시스템
```

**예상 효과**:
- 25% 일일 활성 사용자 증가
- 30% 다음 날 재방문율 향상
- 60%+ AI 멘토 활성 사용

#### 5. 비즈니스 영향 분석
**구현**: Month 3

```
학습-성과 연결:
  - 관리자 대시보드: 팀 진도, 스킬 갭, 위험 학습자 알림
  - 성과 통합: 교육 완료와 업무 지표 상관관계
  - ROI 계산: 500%+ 투자 대비 수익 증명
```

**예상 효과**:
- 20%+ 훈련된 사용자 생산성 향상 증명
- 경영진 지속 투자 확보
- 80%+ 관리자 대시보드 월간 사용

### 사용자 여정 개선

#### BEFORE (높은 마찰)
```
로그인
  → 대시보드 (불명확한 4개 퀵링크)
    → 제품 선택 (추가 클릭)
      → 모듈 목록 (필터링 없음)
        → 모듈 학습 (6개 섹션 접힘, 결정 마비)
          → 퀴즈 (분리된 단계)
            → 결과 (축하/다음 단계 없음)
```

#### AFTER (마찰 없는 흐름)
```
로그인
  → 웰컴 위저드 (첫 방문만)
    → 개인화된 대시보드
      → "학습 이어하기" CTA (정확한 Atom)
        → 선형 Atom 진행 (가이드, 결정 불필요)
          → 빠른 체크 (2-3 Atom마다)
            → 최종 퀴즈 + 축하
              → "추천 다음" (AI 제안)
```

**제거된 마찰**:
- 40% 클릭 감소
- 결정 마비 제거 (시스템이 가이드)
- 지속적 진도 (Atom 중간 재개)
- 항상 명확한 다음 단계

---

## 구현 계획

### Phase 1: 디자인 시스템 기반 구축 (Week 1-2, 24시간)

#### 1.1 필수 패키지 설치

```bash
cd /Users/alan/GitHub/onboarding

# ShadCN UI 핵심 의존성
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# 아이콘 시스템
npm install lucide-react

# 테마 시스템
npm install next-themes

# Tailwind 플러그인
npm install tailwindcss-animate @tailwindcss/typography
```

#### 1.2 생성할 파일

**1. `/lib/utils.ts`** - cn() 유틸리티
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**2. `/lib/design-tokens.ts`** - 디자인 토큰
```typescript
// /Users/alan/GitHub/homepage/lib/design-tokens.ts 전체 복사
export const borderRadius = {
  xs: '6px',
  sm: '8px',
  md: '8px',
  lg: '10px',  // Linear 기본값
  xl: '12px',
  '2xl': '16px',
  '3xl': '20px',
  '4xl': '24px',
  full: '9999px',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
} as const;

// ... 전체 내용 복사
```

**3. `/components/providers/ThemeProvider.tsx`**
```typescript
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**4. `/components.json`** - ShadCN 설정
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**5. `/tailwind.config.js`** - 새로 생성
```javascript
// /Users/alan/GitHub/homepage/tailwind.config.js 전체 복사
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '3rem',
        xl: '4rem',
        '2xl': '5rem'
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1200px',
        '2xl': '1280px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        xs: 'var(--radius-sm)',
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius-lg) + 2px)',
        '2xl': 'calc(var(--radius-lg) + 6px)',
        '3xl': 'calc(var(--radius-lg) + 10px)',
        full: '9999px'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
}
```

#### 1.3 수정할 파일

**1. `/index.css`** - **완전 교체**
```css
/* /Users/alan/GitHub/homepage/app/globals.css 전체 내용 복사 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Pretendard 폰트 설정 */
  html {
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    font-variation-settings: "slnt" 0;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 타이포그래피 시스템 */
  h1, .text-h1 {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.025em;
  }

  h2, .text-h2 {
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  /* ... 전체 내용 복사 ... */

  /* CSS 변수 (:root, .dark) */
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    /* ... 전체 복사 ... */
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... 전체 복사 ... */
  }
}

@layer components {
  /* 유틸리티 클래스 */
  .heading-hero {
    @apply text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight;
  }

  .section-spacing {
    @apply py-16 md:py-24 lg:py-32;
  }

  /* ... 전체 복사 ... */
}
```

**2. `/src/index.tsx`** - ThemeProvider 추가
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/providers/ThemeProvider';  // 추가

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ThemeProvider defaultTheme="dark" storageKey="onboarding-theme">
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
```

**3. `/package.json`** - 의존성 확인
```json
{
  "dependencies": {
    "@google/genai": "^1.16.0",
    "@supabase/supabase-js": "^2.86.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-markdown": "9",
    "react-router-dom": "^7.9.6",
    "remark-gfm": "4",

    // 새로 추가된 의존성
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "lucide-react": "^0.544.0",
    "next-themes": "^0.4.6",
    "tailwindcss-animate": "^1.0.7",
    "@tailwindcss/typography": "^0.5.10"
  }
}
```

### Phase 2: ShadCN 컴포넌트 마이그레이션 (Week 2-3, 36시간)

#### 2.1 ShadCN 컴포넌트 설치

**우선순위 컴포넌트 복사** (수동 복사 필요)

```bash
# 소스: /Users/alan/GitHub/homepage/components/ui/
# 목적지: /Users/alan/GitHub/onboarding/components/ui/

cp /Users/alan/GitHub/homepage/components/ui/button.tsx components/ui/
cp /Users/alan/GitHub/homepage/components/ui/card.tsx components/ui/
cp /Users/alan/GitHub/homepage/components/ui/badge.tsx components/ui/
cp /Users/alan/GitHub/homepage/components/ui/progress.tsx components/ui/
cp /Users/alan/GitHub/homepage/components/ui/dialog.tsx components/ui/
cp /Users/alan/GitHub/homepage/components/ui/radio-group.tsx components/ui/
cp /Users/alan/GitHub/homepage/components/ui/accordion.tsx components/ui/
cp /Users/alan/GitHub/homepage/components/ui/alert.tsx components/ui/
cp /Users/alan/GitHub/homepage/components/ui/separator.tsx components/ui/
cp /Users/alan/GitHub/homepage/components/ui/tabs.tsx components/ui/
```

**복사 후 경로 수정 필요**:
- `@/lib/utils` → 경로 확인 (vite.config.ts에 @ alias 이미 존재)
- `@/components/ui/` → 경로 확인

#### 2.2 컴포넌트 매핑 전략

**호환성 래퍼 생성** - `/components/layout/SurfaceCard.tsx` 수정

```tsx
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SurfaceCardProps {
  variant?: 'solid' | 'muted' | 'contrast';
  tone?: 'default' | 'brand' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
  [key: string]: any;
}

// 임시 호환성 래퍼 - 기존 코드 깨지지 않게 유지
export function SurfaceCard({
  variant = 'solid',
  tone = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: SurfaceCardProps) {
  return (
    <Card
      className={cn(
        // Variant 매핑
        variant === 'muted' && 'bg-muted/30',
        variant === 'contrast' && 'bg-accent',

        // Tone 매핑
        tone === 'brand' && 'bg-primary text-primary-foreground',
        tone === 'accent' && 'bg-accent text-accent-foreground',

        // Padding 매핑
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-4',
        padding === 'md' && 'p-6',
        padding === 'lg' && 'p-8',

        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
```

#### 2.3 페이지별 마이그레이션 우선순위

**1순위: DashboardPage.tsx** (220줄)

변경 사항:
```tsx
// BEFORE
import { SurfaceCard } from '../components/layout/SurfaceCard';
<SurfaceCard variant="solid" padding="lg" className="bg-slate-50">

// AFTER
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

<Card className="bg-background">
  <CardHeader>
    <h3 className="text-foreground">Title</h3>
  </CardHeader>
  <CardContent>
    <Progress value={75} />
  </CardContent>
</Card>
```

색상 클래스 교체:
```tsx
// BEFORE → AFTER
bg-slate-50 → bg-background
bg-slate-900 → bg-card
text-slate-900 → text-foreground
text-slate-600 → text-muted-foreground
border-slate-200 → border-border
bg-indigo-600 → bg-primary
text-indigo-600 → text-primary
```

**2순위: CurriculumModulesPage.tsx** (240줄) - ✅ 완료 (2025-12-08)
**3순위: ModuleLearningPage.tsx** (842줄 - Phase 4와 연계) - ✅ 완료 (2025-12-08)
**4순위: ProductSelectionPage.tsx** (224줄) - ✅ 완료 (2025-12-08)

**다음 작업 대상:**
- **5순위: ProductCategoriesPage.tsx** - 제품별 카테고리 선택 페이지
- **6순위: CategoryLearningPage.tsx** - 카테고리별 학습 페이지
- **7순위: ProductChatPage.tsx** - 제품별 AI 채팅 페이지
- **8순위: KnowledgeChatPage.tsx** - 지식 베이스 채팅 페이지
- **9순위: DocumentsPage.tsx** - 인수인계 문서 페이지
- **10순위: ScenariosPage.tsx** - 시나리오 학습 페이지
- **11순위: AdminPage.tsx** - 관리자 페이지

### Phase 3: 데이터베이스 스키마 확장 (Week 3-4, 20시간)

#### 3.1 스킬 진단 퀴즈 스키마

**파일 생성**: `/supabase/migrations/20251210000001_add_skill_assessment.sql`

```sql
-- ===========================================
-- 스킬 진단 퀴즈 스키마
-- ===========================================

-- 진단 퀴즈 문제 (10-15개)
CREATE TABLE onboarding.skill_assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  category VARCHAR(100), -- 'tickets', 'automation', 'reporting'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 선택지 (스킬 레벨 매핑)
CREATE TABLE onboarding.skill_assessment_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES onboarding.skill_assessment_questions(id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  skill_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  points INTEGER DEFAULT 0, -- 점수 (0-10)
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 응답
CREATE TABLE onboarding.skill_assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  question_id UUID REFERENCES onboarding.skill_assessment_questions(id) ON DELETE CASCADE,
  choice_id UUID REFERENCES onboarding.skill_assessment_choices(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 학습 경로 할당
CREATE TABLE onboarding.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,
  path_type VARCHAR(50) NOT NULL, -- 'fast_track', 'standard', 'refresher'
  recommended_modules JSONB,
  skill_profile JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- RLS (Row Level Security) 정책
-- ===========================================

ALTER TABLE onboarding.skill_assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.skill_assessment_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.skill_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.learning_paths ENABLE ROW LEVEL SECURITY;

-- 읽기 권한: 모든 사용자
CREATE POLICY "Anyone can read questions"
  ON onboarding.skill_assessment_questions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read choices"
  ON onboarding.skill_assessment_choices FOR SELECT
  USING (true);

-- 쓰기 권한: 인증된 사용자만
CREATE POLICY "Authenticated users can insert results"
  ON onboarding.skill_assessment_results FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can read own results"
  ON onboarding.skill_assessment_results FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage paths"
  ON onboarding.learning_paths FOR ALL
  USING (auth.role() = 'authenticated');

-- ===========================================
-- 샘플 데이터 (10개 질문)
-- ===========================================

-- 질문 1: Freshservice 경험
INSERT INTO onboarding.skill_assessment_questions (question_order, question_text, category) VALUES
(1, 'Freshservice를 사용한 경험이 얼마나 되셨나요?', 'general');

INSERT INTO onboarding.skill_assessment_choices (question_id, choice_text, skill_level, points, display_order) VALUES
((SELECT id FROM onboarding.skill_assessment_questions WHERE question_order = 1),
 '처음 사용합니다', 'beginner', 0, 1),
((SELECT id FROM onboarding.skill_assessment_questions WHERE question_order = 1),
 '1-3개월 사용했습니다', 'intermediate', 5, 2),
((SELECT id FROM onboarding.skill_assessment_questions WHERE question_order = 1),
 '6개월 이상 사용했습니다', 'advanced', 10, 3);

-- 질문 2: Ticket 관리
INSERT INTO onboarding.skill_assessment_questions (question_order, question_text, category) VALUES
(2, 'Freshservice에서 티켓을 생성하고 관리해본 적이 있나요?', 'tickets');

INSERT INTO onboarding.skill_assessment_choices (question_id, choice_text, skill_level, points, display_order) VALUES
((SELECT id FROM onboarding.skill_assessment_questions WHERE question_order = 2),
 '아니요, 처음입니다', 'beginner', 0, 1),
((SELECT id FROM onboarding.skill_assessment_questions WHERE question_order = 2),
 '네, 기본적인 티켓 처리를 해봤습니다', 'intermediate', 5, 2),
((SELECT id FROM onboarding.skill_assessment_questions WHERE question_order = 2),
 '네, SLA, 우선순위, 카테고리 등을 활용합니다', 'advanced', 10, 3);

-- 질문 3: Automation
INSERT INTO onboarding.skill_assessment_questions (question_order, question_text, category) VALUES
(3, 'Freshservice의 자동화(Automation) 기능을 사용해보셨나요?', 'automation');

INSERT INTO onboarding.skill_assessment_choices (question_id, choice_text, skill_level, points, display_order) VALUES
((SELECT id FROM onboarding.skill_assessment_questions WHERE question_order = 3),
 '아니요, 들어본 적 없습니다', 'beginner', 0, 1),
((SELECT id FROM onboarding.skill_assessment_questions WHERE question_order = 3),
 '들어는 봤지만 사용해본 적 없습니다', 'intermediate', 3, 2),
((SELECT id FROM onboarding.skill_assessment_questions WHERE question_order = 3),
 '네, 워크플로우를 직접 생성해봤습니다', 'advanced', 10, 3);

-- 질문 4-10: 추가 질문들 (동일 패턴으로 생성)
-- ... 생략 (실제 구현 시 10-15개 질문 추가)

COMMENT ON TABLE onboarding.skill_assessment_questions IS '스킬 진단 퀴즈 문제';
COMMENT ON TABLE onboarding.skill_assessment_choices IS '퀴즈 선택지 (스킬 레벨 매핑)';
COMMENT ON TABLE onboarding.skill_assessment_results IS '사용자 응답 기록';
COMMENT ON TABLE onboarding.learning_paths IS '할당된 학습 경로';
```

#### 3.2 마이크로러닝 Atom 스키마

**파일 생성**: `/supabase/migrations/20251210000002_add_microlearning_atoms.sql`

```sql
-- ===========================================
-- 마이크로러닝 Atom 스키마
-- ===========================================

-- 기존 module_contents 테이블에 컬럼 추가
ALTER TABLE onboarding.module_contents
ADD COLUMN IF NOT EXISTS atom_order INTEGER,
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS atom_type VARCHAR(50) DEFAULT 'concept';

COMMENT ON COLUMN onboarding.module_contents.atom_order IS 'Atom 순서 (1-18)';
COMMENT ON COLUMN onboarding.module_contents.estimated_minutes IS '예상 소요 시간 (분)';
COMMENT ON COLUMN onboarding.module_contents.atom_type IS 'Atom 유형: concept, example, practice, summary';

-- Atom별 진도 추적
CREATE TABLE IF NOT EXISTS onboarding.atom_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  module_id UUID NOT NULL,
  content_id UUID REFERENCES onboarding.module_contents(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  time_spent_seconds INTEGER DEFAULT 0,
  scroll_position INTEGER DEFAULT 0, -- 재개 지점 (픽셀)
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_atom_progress_session ON onboarding.atom_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_atom_progress_status ON onboarding.atom_progress(status);

-- 빠른 체크 문제 (2-3 Atom마다)
CREATE TABLE IF NOT EXISTS onboarding.atom_quick_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL,
  after_atom_id UUID REFERENCES onboarding.module_contents(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answer_1 TEXT NOT NULL,
  wrong_answer_2 TEXT NOT NULL,
  explanation TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 빠른 체크 응답
CREATE TABLE IF NOT EXISTS onboarding.atom_check_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  check_id UUID REFERENCES onboarding.atom_quick_checks(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- RLS 정책
-- ===========================================

ALTER TABLE onboarding.atom_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.atom_quick_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.atom_check_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own atom progress"
  ON onboarding.atom_progress FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can read quick checks"
  ON onboarding.atom_quick_checks FOR SELECT
  USING (true);

CREATE POLICY "Users can insert check answers"
  ON onboarding.atom_check_answers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can read own check answers"
  ON onboarding.atom_check_answers FOR SELECT
  USING (auth.role() = 'authenticated');

-- ===========================================
-- 데이터 마이그레이션: 6개 섹션 → 18개 Atom
-- ===========================================

-- Overview (1개) → 3 atoms
-- Feature-Basic (2개) → 6 atoms
-- Feature-Advanced (2개) → 6 atoms
-- Practice (1개) → 3 atoms
-- 총: 18 atoms per module

UPDATE onboarding.module_contents
SET
  atom_order = CASE section_type
    WHEN 'overview' THEN display_order * 3 - 2
    WHEN 'feature-basic' THEN 3 + (display_order - 1) * 3
    WHEN 'feature-advanced' THEN 9 + (display_order - 1) * 3
    WHEN 'practice' THEN 15 + display_order
    ELSE display_order  -- fallback
  END,
  atom_type = CASE section_type
    WHEN 'overview' THEN 'concept'
    WHEN 'feature-basic' THEN 'example'
    WHEN 'feature-advanced' THEN 'practice'
    WHEN 'practice' THEN 'summary'
    ELSE 'concept'  -- fallback
  END,
  estimated_minutes = CASE level
    WHEN 'basic' THEN 3
    WHEN 'intermediate' THEN 5
    WHEN 'advanced' THEN 7
    ELSE 5  -- fallback
  END
WHERE atom_order IS NULL;

COMMENT ON TABLE onboarding.atom_progress IS 'Atom별 학습 진도';
COMMENT ON TABLE onboarding.atom_quick_checks IS '빠른 체크 문제 (2-3 Atom마다)';
COMMENT ON TABLE onboarding.atom_check_answers IS '빠른 체크 응답 기록';
```

**마이그레이션 실행**:
```bash
# Supabase CLI로 마이그레이션 실행
npx supabase db push

# 또는 Supabase Dashboard에서 SQL Editor로 직접 실행
```

### Phase 4: LMS 기능 구현 (Week 4-5, 36시간)

#### 4.1 스킬 진단 퀴즈 컴포넌트

**파일 생성**: `/components/SkillAssessmentQuiz.tsx`

```tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

interface Question {
  id: string;
  question_order: number;
  question_text: string;
  category: string;
}

interface Choice {
  id: string;
  question_id: string;
  choice_text: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  display_order: number;
}

interface Answer {
  question_id: string;
  choice_id: string;
  choice: Choice;
}

interface LearningPath {
  type: 'fast_track' | 'standard' | 'refresher';
  skipModules: string[];
  message: string;
  recommended_modules?: string[];
}

interface SkillAssessmentQuizProps {
  sessionId: string;
  onComplete: (path: LearningPath) => void;
}

export function SkillAssessmentQuiz({ sessionId, onComplete }: SkillAssessmentQuizProps) {
  const [open, setOpen] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [choices, setChoices] = useState<Record<string, Choice[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [calculatedPath, setCalculatedPath] = useState<LearningPath | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      // API 호출: 질문 목록 조회
      const questionsResponse = await fetch('/api/skill-assessment/questions');
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData);

      // API 호출: 선택지 조회
      const choicesResponse = await fetch('/api/skill-assessment/choices');
      const choicesData = await choicesResponse.json();

      // 질문별 선택지 그룹화
      const groupedChoices = choicesData.reduce((acc: Record<string, Choice[]>, choice: Choice) => {
        if (!acc[choice.question_id]) {
          acc[choice.question_id] = [];
        }
        acc[choice.question_id].push(choice);
        return acc;
      }, {});

      setChoices(groupedChoices);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  }

  function handleNext() {
    if (!selectedChoice) return;

    const choice = currentChoices.find(c => c.id === selectedChoice);
    if (!choice) return;

    // 답변 저장
    setAnswers([...answers, {
      question_id: currentQuestion.id,
      choice_id: selectedChoice,
      choice
    }]);

    setSelectedChoice('');

    if (currentQuestionIndex === questions.length - 1) {
      // 마지막 질문 - 결과 계산
      calculatePath([...answers, { question_id: currentQuestion.id, choice_id: selectedChoice, choice }]);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex === 0) return;

    // 이전 답변 제거
    const previousAnswers = answers.slice(0, -1);
    setAnswers(previousAnswers);
    setSelectedChoice(answers[answers.length - 1].choice_id);
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  }

  function calculatePath(allAnswers: Answer[]) {
    const totalPoints = allAnswers.reduce((sum, answer) => sum + answer.choice.points, 0);
    const maxPoints = questions.length * 10;
    const avgScore = (totalPoints / maxPoints) * 100;

    let path: LearningPath;

    if (avgScore > 75) {
      path = {
        type: 'fast_track',
        skipModules: ['basic'],
        message: '경험이 풍부하시네요! Advanced 레벨부터 시작합니다.',
        recommended_modules: ['automation-advanced', 'asset-advanced', 'reporting-advanced']
      };
    } else if (avgScore > 40) {
      path = {
        type: 'standard',
        skipModules: [],
        message: '기초부터 체계적으로 학습합니다.',
        recommended_modules: ['automation-basic', 'asset-basic', 'reporting-basic']
      };
    } else {
      path = {
        type: 'refresher',
        skipModules: [],
        message: '천천히 기본부터 시작합니다. 추가 리소스를 제공합니다.',
        recommended_modules: ['automation-basic', 'ticketing-basics']
      };
    }

    setCalculatedPath(path);
    setShowResults(true);

    // API 호출: 결과 저장
    saveResults(allAnswers, path);
  }

  async function saveResults(allAnswers: Answer[], path: LearningPath) {
    try {
      // 응답 저장
      await fetch('/api/skill-assessment/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          answers: allAnswers.map(a => ({
            question_id: a.question_id,
            choice_id: a.choice_id
          }))
        })
      });

      // 학습 경로 저장
      await fetch('/api/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          path_type: path.type,
          recommended_modules: path.recommended_modules,
          skill_profile: {
            total_score: allAnswers.reduce((sum, a) => sum + a.choice.points, 0),
            max_score: questions.length * 10,
            answers: allAnswers
          }
        })
      });
    } catch (error) {
      console.error('Failed to save results:', error);
    }
  }

  function handleComplete() {
    if (calculatedPath) {
      onComplete(calculatedPath);
      setOpen(false);
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} modal>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">스킬 진단 퀴즈를 준비하고 있습니다...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentChoices = choices[currentQuestion?.id] || [];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (showResults && calculatedPath) {
    return (
      <Dialog open={open} modal>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <DialogTitle className="text-2xl">진단 완료!</DialogTitle>
                <DialogDescription>
                  당신에게 맞는 학습 경로를 추천합니다
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>추천 학습 경로</CardTitle>
                <Badge variant="default" className="text-lg px-4 py-1">
                  {calculatedPath.type === 'fast_track' && 'Fast Track'}
                  {calculatedPath.type === 'standard' && 'Standard'}
                  {calculatedPath.type === 'refresher' && 'Refresher'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="bg-background/50">
                <Lightbulb className="h-5 w-5" />
                <AlertDescription className="text-base">
                  {calculatedPath.message}
                </AlertDescription>
              </Alert>

              {calculatedPath.recommended_modules && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">추천 모듈:</h4>
                  <div className="space-y-2">
                    {calculatedPath.recommended_modules.map((module, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{module}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button size="lg" onClick={handleComplete} className="w-full">
              학습 시작하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} modal>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>스킬 진단 테스트</DialogTitle>
          <DialogDescription>
            Freshservice 경험을 평가하여 최적의 학습 경로를 추천합니다 ({currentQuestionIndex + 1}/{questions.length})
          </DialogDescription>
          <Progress value={progress} className="mt-4" />
        </DialogHeader>

        <Card className="my-6 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">질문 {currentQuestionIndex + 1}</CardTitle>
              <Badge variant="secondary">{currentQuestion?.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-medium">{currentQuestion?.question_text}</p>

            <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice} className="space-y-3">
              {currentChoices
                .sort((a, b) => a.display_order - b.display_order)
                .map((choice) => (
                  <div
                    key={choice.id}
                    className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={choice.id} id={choice.id} />
                    <label htmlFor={choice.id} className="flex-1 cursor-pointer text-base">
                      {choice.choice_text}
                    </label>
                  </div>
                ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            이전
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedChoice}
          >
            {currentQuestionIndex === questions.length - 1 ? '제출' : '다음'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### 4.2 API 엔드포인트 추가

**파일 수정**: `/services/apiClient.ts` (기존 파일에 추가)

```typescript
// ========================================
// Skill Assessment API
// ========================================

export interface SkillAssessmentQuestion {
  id: string;
  question_order: number;
  question_text: string;
  category: string;
}

export interface SkillAssessmentChoice {
  id: string;
  question_id: string;
  choice_text: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  display_order: number;
}

export interface LearningPath {
  id: string;
  session_id: string;
  path_type: 'fast_track' | 'standard' | 'refresher';
  recommended_modules: string[];
  skill_profile: any;
}

export async function getSkillAssessmentQuestions(): Promise<SkillAssessmentQuestion[]> {
  const { data, error } = await supabase
    .from('skill_assessment_questions')
    .select('*')
    .order('question_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getSkillAssessmentChoices(): Promise<SkillAssessmentChoice[]> {
  const { data, error } = await supabase
    .from('skill_assessment_choices')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function saveSkillAssessmentResults(
  sessionId: string,
  answers: { question_id: string; choice_id: string }[]
): Promise<void> {
  const results = answers.map(answer => ({
    session_id: sessionId,
    question_id: answer.question_id,
    choice_id: answer.choice_id
  }));

  const { error } = await supabase
    .from('skill_assessment_results')
    .insert(results);

  if (error) throw error;
}

export async function saveLearningPath(
  sessionId: string,
  pathType: string,
  recommendedModules: string[],
  skillProfile: any
): Promise<void> {
  const { error } = await supabase
    .from('learning_paths')
    .upsert({
      session_id: sessionId,
      path_type: pathType,
      recommended_modules: recommendedModules,
      skill_profile: skillProfile,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
}

export async function getLearningPath(sessionId: string): Promise<LearningPath | null> {
  const { data, error } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

// ========================================
// Atom Progress API
// ========================================

export interface Atom {
  id: string;
  module_id: string;
  section_type: string;
  level: string;
  titleKo: string;
  contentMd: string;
  atom_order: number;
  estimated_minutes: number;
  atom_type: 'concept' | 'example' | 'practice' | 'summary';
}

export interface AtomProgress {
  id: string;
  session_id: string;
  module_id: string;
  content_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  time_spent_seconds: number;
  scroll_position: number;
  completed_at: string | null;
}

export async function getModuleAtoms(moduleId: string): Promise<Atom[]> {
  const { data, error } = await supabase
    .from('module_contents')
    .select('*')
    .eq('module_id', moduleId)
    .not('atom_order', 'is', null)
    .order('atom_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function saveAtomProgress(
  sessionId: string,
  moduleId: string,
  contentId: string,
  status: 'in_progress' | 'completed',
  timeSpent?: number,
  scrollPosition?: number
): Promise<void> {
  const updateData: any = {
    session_id: sessionId,
    module_id: moduleId,
    content_id: contentId,
    status,
    updated_at: new Date().toISOString()
  };

  if (timeSpent !== undefined) {
    updateData.time_spent_seconds = timeSpent;
  }

  if (scrollPosition !== undefined) {
    updateData.scroll_position = scrollPosition;
  }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('atom_progress')
    .upsert(updateData);

  if (error) throw error;
}

export async function getAtomProgress(
  sessionId: string,
  moduleId: string
): Promise<AtomProgress[]> {
  const { data, error } = await supabase
    .from('atom_progress')
    .select('*')
    .eq('session_id', sessionId)
    .eq('module_id', moduleId);

  if (error) throw error;
  return data || [];
}

export async function getLastIncompleteAtom(sessionId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('atom_progress')
    .select('*, module_contents(*), curriculum_modules(*)')
    .eq('session_id', sessionId)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
```

#### 4.3 ModuleLearningPage 리팩토링

**파일 수정**: `/pages/ModuleLearningPage.tsx` (대규모 변경)

핵심 변경사항:
1. Accordion UI → 선형 Atom 네비게이션
2. Atom별 진도 추적
3. 빠른 체크 통합
4. "이전/다음" 버튼 네비게이션

```tsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { ModuleChatSidebar } from '../components/ModuleChatSidebar';
import { AuthContext } from '../contexts/AuthContext';
import { getModuleAtoms, saveAtomProgress, getAtomProgress, type Atom } from '../services/apiClient';

export default function ModuleLearningPage() {
  const { productId, moduleId } = useParams<{ productId: string; moduleId: string }>();
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();

  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [currentAtomIndex, setCurrentAtomIndex] = useState(0);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    loadAtoms();
  }, [moduleId]);

  useEffect(() => {
    // Atom 변경 시 시작 시간 리셋
    setStartTime(Date.now());
  }, [currentAtomIndex]);

  async function loadAtoms() {
    if (!moduleId) return;

    try {
      const atomsData = await getModuleAtoms(moduleId);
      setAtoms(atomsData);

      if (session?.sessionId) {
        const progressData = await getAtomProgress(session.sessionId, moduleId);
        const progressMap = progressData.reduce((acc, p) => {
          acc[p.content_id] = p;
          return acc;
        }, {} as Record<string, any>);
        setProgress(progressMap);

        // 마지막 in_progress Atom으로 이동
        const lastInProgressIndex = atomsData.findIndex(
          atom => progressMap[atom.id]?.status === 'in_progress'
        );
        if (lastInProgressIndex !== -1) {
          setCurrentAtomIndex(lastInProgressIndex);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load atoms:', error);
      setIsLoading(false);
    }
  }

  async function handleNext() {
    const currentAtom = atoms[currentAtomIndex];
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // 현재 Atom 진도 저장
    if (session?.sessionId) {
      await saveAtomProgress(
        session.sessionId,
        moduleId!,
        currentAtom.id,
        currentAtomIndex === atoms.length - 1 ? 'completed' : 'in_progress',
        timeSpent
      );
    }

    if (currentAtomIndex < atoms.length - 1) {
      setCurrentAtomIndex(currentAtomIndex + 1);
    } else {
      // 모든 Atom 완료 - 퀴즈로 이동
      navigate(`/curriculum/${productId}/${moduleId}/quiz`);
    }
  }

  async function handlePrevious() {
    if (currentAtomIndex > 0) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const currentAtom = atoms[currentAtomIndex];

      if (session?.sessionId) {
        await saveAtomProgress(
          session.sessionId,
          moduleId!,
          currentAtom.id,
          'in_progress',
          timeSpent
        );
      }

      setCurrentAtomIndex(currentAtomIndex - 1);
    }
  }

  if (isLoading) {
    return (
      <PageContainer width="wide">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">학습 콘텐츠를 불러오는 중...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const currentAtom = atoms[currentAtomIndex];
  const progressPercentage = ((currentAtomIndex + 1) / atoms.length) * 100;
  const completedCount = Object.values(progress).filter(p => p.status === 'completed').length;

  return (
    <PageContainer width="wide">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

        {/* 왼쪽: Atom 콘텐츠 (70%) */}
        <div className="space-y-6">

          {/* 진행률 헤더 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Atom {currentAtomIndex + 1} / {atoms.length}
                  </h3>
                  <Badge variant="secondary">
                    {currentAtom?.atom_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedCount} 완료</span>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </CardHeader>
          </Card>

          {/* Atom 콘텐츠 카드 */}
          <Card className="min-h-[600px]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{currentAtom?.titleKo}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>예상 {currentAtom?.estimated_minutes}분</span>
                    </div>
                    <Badge variant="outline">{currentAtom?.level}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentAtom?.contentMd || ''}
                </ReactMarkdown>
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="flex justify-between pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={currentAtomIndex === 0}
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                이전 Atom
              </Button>

              <Button
                size="lg"
                onClick={handleNext}
              >
                {currentAtomIndex === atoms.length - 1 ? '퀴즈 시작' : '다음 Atom'}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>

          {/* 힌트 알림 */}
          {currentAtomIndex === 0 && (
            <Alert>
              <AlertDescription>
                💡 오른쪽 AI 멘토에게 언제든지 질문하세요!
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 오른쪽: AI 멘토 채팅 (30%) */}
        <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
          <ModuleChatSidebar moduleId={moduleId!} />
        </div>
      </div>
    </PageContainer>
  );
}
```

#### 4.4 대시보드 "학습 이어하기" CTA

**파일 수정**: `/pages/DashboardPage.tsx` (기존 파일에 추가)

```tsx
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Compass, CheckCircle2, Clock } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { AuthContext } from '../contexts/AuthContext';
import { getLastIncompleteAtom, getLearningPath } from '../services/apiClient';

export default function DashboardPage() {
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();

  const [lastIncompleteAtom, setLastIncompleteAtom] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [session]);

  async function loadDashboardData() {
    if (!session?.sessionId) return;

    try {
      const [atomData, pathData] = await Promise.all([
        getLastIncompleteAtom(session.sessionId),
        getLearningPath(session.sessionId)
      ]);

      setLastIncompleteAtom(atomData);
      setLearningPath(pathData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <PageContainer width="wide">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted rounded-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-2xl"></div>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide">
      <div className="space-y-8">

        {/* Hero CTA - Continue Learning */}
        {lastIncompleteAtom && (
          <Card className="bg-primary text-primary-foreground border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary opacity-90"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold mb-2">학습 이어하기</h2>
                  <p className="text-primary-foreground/90 mb-1 font-medium">
                    {lastIncompleteAtom.curriculum_modules?.nameKo || '모듈'}
                  </p>
                  <p className="text-sm text-primary-foreground/70 mb-4">
                    Atom {lastIncompleteAtom.atom_order} / {lastIncompleteAtom.total_atoms || 18}
                  </p>
                  <Progress
                    value={((lastIncompleteAtom.atom_order || 1) / (lastIncompleteAtom.total_atoms || 18)) * 100}
                    className="h-2 bg-primary-foreground/20"
                  />
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-shrink-0"
                  onClick={() => navigate(
                    `/curriculum/${lastIncompleteAtom.curriculum_modules?.targetProductId}/${lastIncompleteAtom.module_id}`
                  )}
                >
                  계속하기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Path Recommendation */}
        {learningPath && (
          <Alert className="border-primary/20 bg-primary/5">
            <Compass className="h-5 w-5 text-primary" />
            <AlertTitle className="text-lg">
              추천 학습 경로: {' '}
              <Badge variant="default" className="ml-2">
                {learningPath.path_type === 'fast_track' && 'Fast Track'}
                {learningPath.path_type === 'standard' && 'Standard'}
                {learningPath.path_type === 'refresher' && 'Refresher'}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2">
              {learningPath.path_type === 'fast_track' && '경험자 과정으로 빠르게 Advanced 레벨을 학습합니다.'}
              {learningPath.path_type === 'standard' && '기초부터 체계적으로 학습합니다.'}
              {learningPath.path_type === 'refresher' && '기본 개념을 복습하며 천천히 학습합니다.'}
            </AlertDescription>
          </Alert>
        )}

        {/* 나머지 대시보드 콘텐츠 */}
        {/* ... 기존 코드 유지 ... */}
      </div>
    </PageContainer>
  );
}
```

### Phase 5: 테스팅 & 품질 보증 (Week 5-6, 20시간)

#### 5.1 시각적 회귀 테스트 체크리스트

```markdown
## 테스트 매트릭스
- [ ] 12개 페이지 × 2개 테마 (light/dark) × 3개 뷰포트 = 72개 케이스

### Light Mode 테스트
- [ ] DashboardPage - Desktop
- [ ] DashboardPage - Tablet
- [ ] DashboardPage - Mobile
- [ ] CurriculumModulesPage - Desktop/Tablet/Mobile
- [ ] ModuleLearningPage - Desktop/Tablet/Mobile
- [ ] [나머지 9개 페이지]

### Dark Mode 테스트
- [ ] 동일한 페이지 목록 반복

### 색상 일관성 확인
- [ ] Primary 색상 통일 (#4B7FB8)
- [ ] Background/Foreground 올바른 매핑
- [ ] Border 색상 일관성
- [ ] Muted 색상 적절한 사용

### 폰트 확인
- [ ] Pretendard 폰트 로드 확인
- [ ] h1-h4 타이포그래피 적용
- [ ] Line-height, letter-spacing 적절함
```

#### 5.2 접근성 감사

```bash
# Lighthouse CI 실행
npx lighthouse http://localhost:3000 --view

# axe DevTools 체크리스트
- [ ] 색상 대비 4.5:1 이상 (모든 텍스트)
- [ ] 키보드 네비게이션 (Tab 순서)
- [ ] 포커스 표시 명확 (focus-visible)
- [ ] ARIA 레이블 (버튼, 링크, 폼)
- [ ] 스크린 리더 테스트 (NVDA/VoiceOver)
```

#### 5.3 성능 테스트

```bash
# 번들 크기 분석
npm run build
npx vite-bundle-visualizer

# 목표 지표
- [ ] Lighthouse Performance > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] 번들 크기 < 500KB (gzipped)
- [ ] Code splitting 적용 확인
```

#### 5.4 사용자 수용 테스트 (UAT)

```markdown
## 테스트 시나리오

### 1. 신규 사용자 플로우
1. 로그인
2. 스킬 진단 퀴즈 완료 (10-15 질문)
3. 학습 경로 결과 확인 (Fast Track / Standard / Refresher)
4. 대시보드 확인
5. 첫 모듈 선택
6. Atom 1 완료
7. 로그아웃 → 재로그인
8. "학습 이어하기" 정확한 위치로 이동 확인

### 2. 복귀 사용자 플로우
1. 로그인
2. "학습 이어하기" CTA 클릭
3. 정확한 Atom으로 이동 확인
4. Atom 완료
5. 다음 Atom 자동 진행

### 3. 모듈 완료 플로우
1. 18개 Atom 순차 완료
2. 중간에 빠른 체크 통과
3. 마지막 Atom 완료 후 퀴즈로 자동 이동
4. 퀴즈 제출
5. 결과 화면 확인

### 4. 다크 모드 테스트
1. 테마 토글 (라이트 → 다크)
2. 모든 페이지 방문
3. 색상 정상 표시 확인
4. 로그아웃 → 재로그인
5. 테마 설정 유지 확인

## 성공 기준
- [ ] 85% 이상 Atom 완료율
- [ ] 30% 빠른 첫 모듈 시작 (클릭 감소)
- [ ] 90% 이상 사용자 만족도 (설문)
- [ ] 0 Critical bugs
- [ ] < 5 Minor bugs
```

### Phase 6: 배포 & 모니터링 (Week 6, 8시간)

#### 6.1 프로덕션 배포 체크리스트

```markdown
## 데이터베이스
- [ ] Supabase 스테이징 마이그레이션 테스트 완료
- [ ] 프로덕션 전체 백업 (module_contents, module_progress)
- [ ] 마이그레이션 실행: 20251210000001_add_skill_assessment.sql
- [ ] 마이그레이션 실행: 20251210000002_add_microlearning_atoms.sql
- [ ] RLS 정책 검증 (anon, authenticated 권한)
- [ ] 샘플 스킬 진단 데이터 입력 확인

## 환경 변수
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] VITE_API_BASE_URL
- [ ] GEMINI_API_KEY
- [ ] NODE_ENV=production

## 빌드
- [ ] npm run build 성공
- [ ] dist/ 폴더 생성 확인
- [ ] 빌드 크기 < 500KB
- [ ] 콘솔 에러 0개
- [ ] 프로덕션 미리보기: npm run preview

## 배포 (Vercel)
- [ ] main 브랜치 머지
- [ ] Vercel 자동 배포 트리거
- [ ] 배포 로그 확인 (에러 없음)
- [ ] 프로덕션 URL 접속 확인
- [ ] 스모크 테스트 (주요 기능 동작)

## 롤백 계획
- [ ] 이전 버전 스냅샷 준비
- [ ] 데이터베이스 복구 스크립트 준비
- [ ] Vercel 이전 배포 버전 확인
```

#### 6.2 모니터링 설정

```typescript
// Supabase Analytics 쿼리 예시

-- 스킬 진단 완료율
SELECT
  COUNT(DISTINCT session_id) as total_users,
  COUNT(DISTINCT CASE WHEN lp.path_type IS NOT NULL THEN lp.session_id END) as completed_users,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN lp.path_type IS NOT NULL THEN lp.session_id END) / COUNT(DISTINCT session_id), 2) as completion_rate
FROM onboarding.skill_assessment_results sar
LEFT JOIN onboarding.learning_paths lp ON sar.session_id = lp.session_id;

-- Atom 완료율
SELECT
  module_id,
  COUNT(DISTINCT content_id) as total_atoms,
  COUNT(DISTINCT CASE WHEN status = 'completed' THEN content_id END) as completed_atoms,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN status = 'completed' THEN content_id END) / COUNT(DISTINCT content_id), 2) as completion_rate
FROM onboarding.atom_progress
GROUP BY module_id;

-- 평균 학습 시간
SELECT
  module_id,
  ROUND(AVG(time_spent_seconds) / 60, 2) as avg_minutes_per_atom
FROM onboarding.atom_progress
WHERE status = 'completed'
GROUP BY module_id;
```

**Slack 알림 설정** (Vercel Integration):
```markdown
- [ ] 에러율 > 5%: #dev-alerts 채널
- [ ] 페이지 로드 > 3초: #performance 채널
- [ ] 빌드 실패: #deployments 채널
```

---

## 🚀 다음 작업자를 위한 즉시 시작 가이드

### ⚡ 빠른 시작 (이미 Phase 1 완료됨)

**현재 상태:**
- ✅ 디자인 시스템 완전 설치됨
- ✅ 4개 페이지 마이그레이션 완료
- ✅ 개발 서버 정상 작동 (port 3000)

**다음 작업:**
1. ProductCategoriesPage.tsx 마이그레이션
2. 같은 패턴으로 나머지 7개 페이지 순차 진행

### 📝 작업 패턴 (이미 확립됨)

**모든 페이지 마이그레이션은 동일한 패턴을 따릅니다:**

```typescript
// 1. Import 추가
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/layout/SectionHeader';

// 2. Loading 화면 변환
if (isLoading) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

// 3. Error 화면 변환
if (error) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          <i className="fas fa-exclamation-circle text-4xl text-destructive"></i>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRetry}>다시 시도</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// 4. 메인 레이아웃 변환
return (
  <div className="layout-stack pb-12">
    <SectionHeader
      title="페이지 제목"
      subtitle="설명"
      icon={<i className="fas fa-icon"></i>}
    />

    {/* 카드 컨텐츠 */}
    <Card>
      <CardContent className="p-6">
        {/* 내용 */}
      </CardContent>
    </Card>
  </div>
);
```

**5. 색상 클래스 교체 (찾기/바꾸기):**
```typescript
// 배경색
bg-white → bg-background 또는 bg-card
bg-slate-50 → bg-muted
bg-slate-900 → bg-foreground 또는 bg-card

// 텍스트색
text-slate-900 → text-foreground
text-slate-600 → text-muted-foreground
text-slate-500 → text-muted-foreground
text-gray-900 → text-foreground
text-gray-600 → text-muted-foreground
text-gray-500 → text-muted-foreground

// 보더
border-slate-200 → border-border
border-gray-200 → border-border

// Primary 색상
bg-indigo-600 → bg-primary
text-indigo-600 → text-primary
hover:bg-indigo-700 → hover:bg-primary/90

// 상태 색상
text-red-500 → text-destructive
bg-red-50 → bg-destructive/10
```

### 🎯 다음 페이지 마이그레이션 가이드

**5번: ProductCategoriesPage.tsx**

1. 파일 읽기:
```bash
code /Users/alan/GitHub/onboarding/pages/ProductCategoriesPage.tsx
```

2. 동일한 패턴으로 변환:
   - Import 추가 (Card, Button, Badge 등)
   - Loading/Error 화면 변환
   - 카테고리 카드를 Card 컴포넌트로 변환
   - 색상 클래스 semantic token으로 교체
   - 그라데이션/특수 스타일은 유지

3. 테스트:
```bash
npm run dev  # port 3000에서 실행
```

4. 다음 페이지로 진행

**예상 소요 시간:**
- 간단한 페이지 (200줄 이하): 30-60분
- 중간 페이지 (200-400줄): 1-2시간
- 복잡한 페이지 (400줄 이상): 2-4시간

---

## 즉시 시작 가이드 (원본 - 참고용)

### Day 1: 환경 설정 (2-3시간)

```bash
# 1. 프로젝트 클론 (이미 있음)
cd /Users/alan/GitHub/onboarding

# 2. 패키지 설치
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install lucide-react next-themes
npm install tailwindcss-animate @tailwindcss/typography

# 3. 파일 생성
mkdir -p lib components/ui components/providers

# 4. Homepage 파일 복사
cp /Users/alan/GitHub/homepage/lib/utils.ts lib/
cp /Users/alan/GitHub/homepage/lib/design-tokens.ts lib/
cp /Users/alan/GitHub/homepage/components/providers/theme-provider.tsx components/providers/ThemeProvider.tsx
cp /Users/alan/GitHub/homepage/tailwind.config.js .
cp /Users/alan/GitHub/homepage/app/globals.css index.css

# 5. ShadCN UI 컴포넌트 복사
cp -r /Users/alan/GitHub/homepage/components/ui/* components/ui/

# 6. components.json 생성 (위 내용 참고)
# 7. src/index.tsx 수정 (ThemeProvider 추가)

# 8. 개발 서버 실행
npm run dev

# 9. 다크 모드 테스트
# - 브라우저 DevTools에서 .dark 클래스 토글
# - 색상 변경 확인
```

### Day 2: 첫 페이지 마이그레이션 (4시간)

```typescript
// DashboardPage.tsx 마이그레이션 시작

// 1. Import 변경
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// 2. 색상 클래스 교체 (찾기/바꾸기)
// bg-slate-50 → bg-background
// bg-slate-900 → bg-card
// text-slate-900 → text-foreground
// text-slate-600 → text-muted-foreground

// 3. 컴포넌트 교체
// <SurfaceCard> → <Card>
// <div className="bg-white rounded-lg p-6"> → <Card><CardContent className="p-6">

// 4. 테스트
// - Light 모드 확인
// - Dark 모드 전환 확인
// - 반응형 확인 (모바일/태블릿/데스크톱)
```

### ✅ Phase 1 완료 (2025-12-08)

```markdown
- [x] 패키지 설치 완료 (모든 @radix-ui, class-variance-authority, clsx, tailwind-merge 등)
- [x] 디자인 시스템 파일 설치 (lib/utils.ts, lib/design-tokens.ts)
- [x] Tailwind 설정 완료 (tailwind.config.js, HSL 색상 시스템)
- [x] 테마 프로바이더 통합 (ThemeProvider.tsx, index.tsx 수정)
- [x] index.css 완전 교체 (728줄, Pretendard 폰트, 다크/라이트 모드 CSS 변수)
- [x] ShadCN UI 컴포넌트 10개 복사 (button, card, badge, progress, dialog, radio-group, accordion, alert, separator, tabs)
- [x] Light/Dark 모드 정상 작동
```

### 🔄 Phase 2 진행 중 (4/12 페이지 완료)

**✅ 완료된 페이지:**
1. **DashboardPage.tsx** (226줄) - 2025-12-08 완료
   - Card, Button, Badge, Progress 컴포넌트로 마이그레이션
   - Hero 섹션, Quick Links, Recent Activities 완전 변환
   - 모든 semantic token 적용 (foreground, muted-foreground, border 등)

2. **CurriculumModulesPage.tsx** (233줄) - 2025-12-08 완료
   - SectionHeader, Card, Button, Progress, Badge 컴포넌트 사용
   - 모듈 카드 그리드 레이아웃 변환
   - 진행률 통계 Card로 변환

3. **ModuleLearningPage.tsx** (848줄) - 2025-12-08 완료
   - 가장 복잡한 페이지 완료 (3개 phase: learning, quiz, result)
   - AI 채팅 사이드바 UI 개선 (타이핑 인디케이터, 스크롤 최적화)
   - 아코디언 섹션, 퀴즈 카드, 결과 화면 모두 변환

4. **ProductSelectionPage.tsx** (224줄) - 2025-12-08 완료
   - Bundle/Standalone 제품 카드 Card 컴포넌트로 변환
   - SectionHeader, Badge 컴포넌트 사용
   - 그라데이션 아이콘 유지하면서 semantic token 적용

**⏳ 남은 페이지 (8개):**
5. ProductCategoriesPage.tsx
6. CategoryLearningPage.tsx
7. ProductChatPage.tsx
8. KnowledgeChatPage.tsx
9. DocumentsPage.tsx
10. ScenariosPage.tsx
11. AdminPage.tsx
12. (추가 페이지 확인 필요)
```

### 주요 참고 파일 위치

```
Homepage (참고용):
  /Users/alan/GitHub/homepage/
    ├── app/globals.css              # 복사 완료
    ├── tailwind.config.js           # 복사 완료
    ├── lib/utils.ts                 # 복사 완료
    ├── lib/design-tokens.ts         # 복사 완료
    ├── components/ui/               # 복사 완료
    └── components/providers/        # 복사 완료

Onboarding (작업 대상):
  /Users/alan/GitHub/onboarding/
    ├── pages/                       # 마이그레이션 필요
    ├── components/layout/           # 스타일 업데이트 필요
    ├── services/apiClient.ts        # API 추가 필요
    └── supabase/migrations/         # DB 마이그레이션 추가
```

---

## ⚠️ 알려진 이슈 및 해결 내역

### ✅ 해결된 이슈

1. **Missing @radix-ui/react-progress 에러** (2025-12-08 해결)
   - 문제: Progress 컴포넌트 import 시 패키지 누락
   - 해결: 모든 Radix UI 의존성 패키지 설치
   ```bash
   npm install @radix-ui/react-progress @radix-ui/react-accordion
   @radix-ui/react-alert-dialog @radix-ui/react-dialog
   @radix-ui/react-radio-group @radix-ui/react-separator @radix-ui/react-tabs
   ```

2. **채팅 로봇 이모지 중복 표시** (2025-12-08 해결)
   - 문제: ModuleLearningPage 채팅에서 로봇 아이콘이 2개 표시됨
   - 해결: 타이핑 인디케이터에서 아이콘 제거, 메시지 아바타만 유지

3. **채팅 영역 무한 스크롤** (2025-12-08 해결)
   - 문제: 질문을 계속하면 채팅 영역이 무한정 늘어남
   - 해결: `max-h-[calc(100vh-300px)]` 추가로 최대 높이 제한

### 🚧 진행 중인 이슈

- 없음 (현재 모든 이슈 해결됨)

### 📌 주의사항

1. **개발 서버는 수동 실행**
   - AI가 자동으로 서버를 시작하지 않음
   - 사용자가 직접 `npm run dev`로 port 3000에서 실행

2. **파일 분할 보류**
   - ModuleLearningPage.tsx (848줄)는 현재 분할하지 않음
   - 마이그레이션 우선, 리팩토링은 Phase 2 완료 후 고려

3. **그라데이션 스타일 유지**
   - 제품/모듈 카드의 그라데이션 아이콘은 기존 스타일 유지
   - 예: `bg-gradient-to-br from-blue-500 to-indigo-600`

---

## 문제 해결 가이드

### 자주 발생하는 문제

#### 1. CSS 변수 인식 안됨
```typescript
// vite.config.ts 확인
resolve: {
  alias: {
    '@': path.resolve(__dirname, '.'),
  }
}

// index.css 최상단 확인
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 2. ShadCN 컴포넌트 import 에러
```bash
# @ alias 경로 확인
# @/components/ui/button → components/ui/button

# tsconfig.json 확인
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### 3. 다크 모드 작동 안함
```tsx
// index.tsx 확인 - ThemeProvider 래핑 확인
<ThemeProvider defaultTheme="dark" storageKey="onboarding-theme">
  <App />
</ThemeProvider>

// HTML 확인 - .dark 클래스 토글 확인
<html class="dark">
```

#### 4. Supabase 마이그레이션 실패
```bash
# 스테이징에서 먼저 테스트
npx supabase db reset  # 로컬 리셋
npx supabase db push   # 마이그레이션 적용

# 에러 발생 시 롤백
# 백업에서 복구
```

---

## 추가 리소스

### 공식 문서
- [ShadCN UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [Lucide Icons](https://lucide.dev)
- [next-themes](https://github.com/pacocoursey/next-themes)

### 프로젝트 문서
- `/docs/handover.md` - 기존 온보딩 시스템 문서
- `/README.md` - 프로젝트 README
- `/supabase/migrations/` - DB 스키마 이력

---

## 연락처

**프로젝트 소유자**: Alan
**프로젝트 위치**: `/Users/alan/GitHub/onboarding/`
**Homepage 프로젝트**: `/Users/alan/GitHub/homepage/`

**질문/이슈**:
- GitHub Issues 생성
- 또는 프로젝트 소유자에게 직접 연락

---

**최종 업데이트**: 2025-12-08 (16:30)
**진행 상황**: Phase 1 완료, Phase 2 진행 중 (4/12 페이지 완료)
