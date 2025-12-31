-- Freshdesk advanced modules (new core+advanced tracks)

BEGIN;

-- =========================================================
-- curriculum_modules: Freshdesk advanced additions
-- =========================================================
INSERT INTO onboarding.curriculum_modules (
  id,
  target_product_id,
  target_product_type,
  name_ko,
  name_en,
  slug,
  description,
  display_order,
  estimated_minutes,
  is_active
) VALUES
(
  '58f15ef1-4d63-4812-af03-ace31f4bc7fe',
  'freshdesk',
  'standalone',
  '티켓 관리 고급',
  'Advanced Ticket Management',
  'ticket-advanced',
  'SLA 설계, 우선순위 체계, 상태 전이와 품질 지표를 고도화합니다.',
  6,
  50,
  true
),
(
  'f4f36660-266e-453c-94e6-d8ecdbf5edea',
  'freshdesk',
  'standalone',
  '자동화 심화',
  'Automation Advanced',
  'automation-advanced',
  '충돌/루프 방지, 예외 처리, 시간 기반 규칙 설계까지 다룹니다.',
  7,
  50,
  true
),
(
  'cb2ff21b-3c35-439f-b114-8c1ebcc3993b',
  'freshdesk',
  'standalone',
  '리포팅 고급',
  'Reporting Advanced',
  'reporting-advanced',
  '커스텀 대시보드, KPI 정의, 경영진 리포트를 설계합니다.',
  8,
  45,
  true
),
(
  '3a150645-ff73-4b99-a0e1-c170e898909b',
  'freshdesk',
  'standalone',
  '고객 만족(CSAT) 운영',
  'CSAT Operations',
  'csat-ops',
  '설문 설계와 개선 루프를 구축해 고객 만족을 체계적으로 관리합니다.',
  9,
  40,
  true
),
(
  'd7e66065-04c3-4bab-bf09-bc6e1c7a9967',
  'freshdesk',
  'standalone',
  '지식 베이스 고급',
  'Knowledge Base Advanced',
  'knowledge-base-advanced',
  '검색 최적화, 구조 설계, 운영 프로세스를 고도화합니다.',
  10,
  45,
  true
),
(
  '9368ac4b-5694-4b09-8dd3-af37540fea5d',
  'freshdesk',
  'standalone',
  '품질관리(QA) & 베스트 프랙티스',
  'QA & Best Practices',
  'qa-best-practices',
  '응대 품질 기준과 리뷰 체계를 구축합니다.',
  11,
  40,
  true
)
ON CONFLICT (id) DO UPDATE SET
  target_product_id = EXCLUDED.target_product_id,
  target_product_type = EXCLUDED.target_product_type,
  name_ko = EXCLUDED.name_ko,
  name_en = EXCLUDED.name_en,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- module_contents: Ticket Advanced
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '58f15ef1-4d63-4812-af03-ace31f4bc7fe',
  'overview', 'basic',
  '티켓 운영의 “기준”을 세우는 법',
  'Set the Standards',
  $$
## 🎯 목표
고급 티켓 관리는 “누가 처리해도 같은 결과가 나오는 기준”을 만드는 일입니다.

## 😫 문제 상황
- 긴급/중요 티켓이 섞여 들어와 우선순위가 흔들림
- 팀마다 상태 전이가 달라 인수인계가 자주 끊김
- 보고서 지표가 들쭉날쭉해 개선이 어려움

## ✅ 해결 프레임
1. **우선순위 기준표**를 만든다
2. **상태 전이 규칙**을 문서화한다
3. **필수 필드**로 품질을 보장한다

## 📌 실무 팁
- 우선순위는 “고객 영향도 × 긴급성” 2축으로 정의
- Pending은 반드시 **기한/다음 액션**을 요구
- 동일 유형 티켓 10건 샘플링 → 기준이 일치하는지 검증

## ⚠️ 흔한 실수
- 기준을 문서화하지 않고 구두로만 공유
- 신규 담당자에게 기준 교육 없이 배정
$$,
  1, 8, true
),
(
  '58f15ef1-4d63-4812-af03-ace31f4bc7fe',
  'overview', 'intermediate',
  'SLA 체계 설계',
  'Design SLA Framework',
  $$
## 🧱 SLA 설계 순서
1. 문의 유형 분류 (장애/문의/요청)
2. 각 유형별 목표 시간 정의
3. 업무 시간/휴일 반영
4. 에스컬레이션 룰 연동

## ✅ 추천 기준 예시
- 장애: 첫 응답 15분, 해결 4시간
- 문의: 첫 응답 1시간, 해결 24시간
$$,
  2, 10, true
),
(
  '58f15ef1-4d63-4812-af03-ace31f4bc7fe',
  'overview', 'advanced',
  '티켓 품질 지표 & 운영 리듬',
  'Quality Metrics & Rhythm',
  $$
## 📊 필수 KPI
- FRT / ART
- 재오픈율
- SLA 위반률
- CSAT

## 📅 운영 리듬
- 주간: SLA 위반 분석
- 월간: 카테고리별 병목 분석
$$,
  3, 10, true
),
(
  '58f15ef1-4d63-4812-af03-ace31f4bc7fe',
  'feature-basic', 'basic',
  '고급 필드 & 폼 설계',
  'Advanced Fields & Forms',
  $$
## ✅ 고급 필드/폼 설계 체크리스트
- [ ] 필드명은 현업 용어 그대로 (예: “원인 유형”)
- [ ] 선택지 7개 이하
- [ ] 조건부 필드로 입력 피로도 감소
- [ ] 해결 후 필수 입력 필드 지정

## 🧭 추천 구성 예시
- 우선순위: 긴급/높음/보통/낮음
- 원인: 제품/정책/고객오류/기타
- 해결유형: 안내/조치/재현불가

## 🧪 검증 방법
- 신규 티켓 5건 시뮬레이션
- 누락 필드가 있는지 확인
- 보고서에서 필터가 제대로 동작하는지 확인
$$,
  4, 10, true
),
(
  '58f15ef1-4d63-4812-af03-ace31f4bc7fe',
  'feature-advanced', 'advanced',
  '상태 전이 자동화',
  'State Transition Automation',
  $$
## ⚙️ 고급 설정
- 대기(Pending) → 일정 시간 후 자동 알림
- 해결(Resolved) → 3일 후 자동 종료
$$,
  5, 10, true
),
(
  '58f15ef1-4d63-4812-af03-ace31f4bc7fe',
  'practice', 'intermediate',
  '실습: SLA 위반 0% 만들기',
  'Practice: Zero SLA Breach',
  $$
1. 긴급 유형 SLA 15분 설정
2. 임박 10분 전 자동 알림
3. 관리자 에스컬레이션 룰 적용
$$,
  6, 12, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- module_contents: Automation Advanced
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  'f4f36660-266e-453c-94e6-d8ecdbf5edea',
  'overview', 'basic',
  '자동화는 “운영 안정화 장치”',
  'Automation as Stability',
  $$
## 🎯 핵심 메시지
자동화 심화는 “많이 만드는 것”이 아니라 **안정적으로 운영되는 규칙**을 만드는 것입니다.

## 😫 문제 상황
- 규칙 충돌로 배정이 계속 바뀜
- 필드 변경 루프로 티켓이 무한 업데이트
- 예외 고객 처리 누락

## ✅ 설계 기준
1. **예외 태그**로 루프 방지
2. **우선순위 순서** 문서화
3. **테스트 시나리오**로 검증

## 🧪 운영 체크
- 신규 규칙 추가 후 3일간 로그 점검
- 동일 필드 변경 규칙 2개 이상 금지
$$,
  1, 8, true
),
(
  'f4f36660-266e-453c-94e6-d8ecdbf5edea',
  'overview', 'intermediate',
  '충돌/루프 방지 전략',
  'Avoid Conflicts & Loops',
  $$
## 🛡️ 핵심 원칙
- 조건에 **예외 태그** 포함
- 동일 필드 변경 규칙 2개 이상 금지
- 로그에서 적용 순서 확인
$$,
  2, 10, true
),
(
  'f4f36660-266e-453c-94e6-d8ecdbf5edea',
  'overview', 'advanced',
  '시간 기반 규칙과 에스컬레이션',
  'Time-based Escalations',
  $$
## ⏱️ 설계 포인트
- 업무 시간/휴일 반영
- 임박 알림 → 자동 승격 → 관리자 통보 단계화
$$,
  3, 10, true
),
(
  'f4f36660-266e-453c-94e6-d8ecdbf5edea',
  'feature-basic', 'basic',
  '고급 조건식 만들기',
  'Advanced Conditions',
  $$
## ✅ 고급 조건식 설계
- 조건은 **포함/제외를 분리**해 작성
- 채널 + 유형 + 고객 등급 조합 사용

## 🧭 예시
- 채널=전화 AND 고객등급=VIP → 즉시 배정
- 태그에 `auto_processed`가 있으면 제외

## ⚠️ 실수 방지
- 조건이 넓으면 오탐 발생
- 예외 조건 누락 시 루프 위험
$$,
  4, 9, true
),
(
  'f4f36660-266e-453c-94e6-d8ecdbf5edea',
  'feature-advanced', 'advanced',
  '예외 처리 플로우',
  'Exception Handling',
  $$
VIP, 야간, 특정 고객은 별도 라우팅/알림 규칙 적용
$$,
  5, 10, true
),
(
  'f4f36660-266e-453c-94e6-d8ecdbf5edea',
  'practice', 'intermediate',
  '실습: 충돌 없는 복합 룰 구성',
  'Practice: Conflict-free Rules',
  $$
우선순위 조정 + SLA 임박 알림 + 관리자 통보를 하나의 흐름으로 구성합니다.
$$,
  6, 12, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- module_contents: Reporting Advanced
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  'cb2ff21b-3c35-439f-b114-8c1ebcc3993b',
  'overview', 'basic',
  '리포팅은 운영의 “나침반”',
  'Reporting as Compass',
  $$
## 🎯 리포팅의 목적
리포팅은 **의사결정의 근거**입니다. 팀이 같은 숫자를 보게 만드는 것이 핵심입니다.

## ✅ 첫 단계 체크리스트
- KPI 3~5개만 선정
- 팀/채널/유형 기준 통일
- 월간 기준선(Baseline) 설정

## ⚠️ 흔한 실수
- 지표가 너무 많아 아무도 보지 않음
- 팀마다 다른 계산식 사용
$$,
  1, 7, true
),
(
  'cb2ff21b-3c35-439f-b114-8c1ebcc3993b',
  'overview', 'intermediate',
  'KPI 정의 체계',
  'KPI Framework',
  $$
- 목표/지표/행동을 연결
- KPI는 5개 이내로 제한
$$,
  2, 9, true
),
(
  'cb2ff21b-3c35-439f-b114-8c1ebcc3993b',
  'overview', 'advanced',
  '경영진 리포트 구성',
  'Executive Reporting',
  $$
비용 절감, SLA 준수율, 고객 만족을 핵심 축으로 구성합니다.
$$,
  3, 9, true
),
(
  'cb2ff21b-3c35-439f-b114-8c1ebcc3993b',
  'feature-basic', 'basic',
  '대시보드 구성',
  'Dashboard Basics',
  $$
## ✅ 대시보드 기본 구성
1. KPI 카드(핵심 지표 3개)
2. 추이 그래프(월간/주간)
3. Top 이슈 리스트

## 🧪 검증 방법
- 팀 리더에게 “5초 안에 상태 파악 가능한가?” 확인
$$,
  4, 8, true
),
(
  'cb2ff21b-3c35-439f-b114-8c1ebcc3993b',
  'feature-advanced', 'advanced',
  '드릴다운 분석',
  'Drill-down Analysis',
  $$
이상치 발견 → 원인 카테고리까지 내려가 확인합니다.
$$,
  5, 9, true
),
(
  'cb2ff21b-3c35-439f-b114-8c1ebcc3993b',
  'practice', 'intermediate',
  '실습: 경영진 주간 리포트',
  'Practice: Weekly Exec Report',
  $$
SLA 준수율/해결 시간/CSAT을 1페이지로 요약합니다.
$$,
  6, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- module_contents: CSAT Operations
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '3a150645-ff73-4b99-a0e1-c170e898909b',
  'overview', 'basic',
  'CSAT의 역할',
  'Role of CSAT',
  $$
## 🎯 CSAT의 의미
CSAT은 **고객의 감정 지표**이며, 불만이 쌓이는 지점을 알려줍니다.

## ✅ 기본 원칙
- 질문은 1~2개
- 24시간 이내 발송
- 저점 티켓은 별도 태그로 추적

## ⚠️ 주의
- 너무 긴 설문은 응답률 하락
$$,
  1, 7, true
),
(
  '3a150645-ff73-4b99-a0e1-c170e898909b',
  'overview', 'intermediate',
  '설문 설계 원칙',
  'Survey Design',
  $$
- 질문은 1~2개로 최소화
- 응답률 목표 15% 이상
$$,
  2, 9, true
),
(
  '3a150645-ff73-4b99-a0e1-c170e898909b',
  'overview', 'advanced',
  '개선 루프 구축',
  'Feedback Loop',
  $$
낮은 점수 티켓을 분류하고, 원인별 개선 계획을 실행합니다.
$$,
  3, 9, true
),
(
  '3a150645-ff73-4b99-a0e1-c170e898909b',
  'feature-basic', 'basic',
  'CSAT 자동 발송 설정',
  'Auto-send CSAT',
  $$
## ✅ CSAT 자동 발송 설정
1. 해결 상태 전환 시 발송
2. VIP 고객은 별도 메시지
3. 응답률 15% 이상 유지

## 🧪 체크리스트
- [ ] 비업무 시간 발송 금지
- [ ] 저점 응답 자동 알림
$$,
  4, 8, true
),
(
  '3a150645-ff73-4b99-a0e1-c170e898909b',
  'feature-advanced', 'advanced',
  '세그먼트 분석',
  'Segment Analysis',
  $$
팀/채널/유형별 만족도를 분리해 봅니다.
$$,
  5, 9, true
),
(
  '3a150645-ff73-4b99-a0e1-c170e898909b',
  'practice', 'intermediate',
  '실습: 낮은 점수 분석',
  'Practice: Low Score Analysis',
  $$
최근 30일 낮은 점수 티켓을 분류하고 개선안을 작성합니다.
$$,
  6, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- module_contents: KB Advanced
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  'd7e66065-04c3-4bab-bf09-bc6e1c7a9967',
  'overview', 'basic',
  '고급 KB의 기준',
  'Advanced KB Standards',
  $$
## 🎯 고급 KB의 기준
좋은 KB는 **검색이 잘 되고 최신성이 유지**됩니다.

## ✅ 기본 룰
- 제목에 핵심 키워드 포함
- 문서 1개 = 문제 1개
- 월 1회 업데이트 리뷰
$$,
  1, 7, true
),
(
  'd7e66065-04c3-4bab-bf09-bc6e1c7a9967',
  'overview', 'intermediate',
  '구조 설계',
  'Information Architecture',
  $$
카테고리 → 폴더 → 문서 구조를 체계화합니다.
$$,
  2, 9, true
),
(
  'd7e66065-04c3-4bab-bf09-bc6e1c7a9967',
  'overview', 'advanced',
  '검색 최적화',
  'Search Optimization',
  $$
검색 로그를 분석해 제목/키워드를 개선합니다.
$$,
  3, 9, true
),
(
  'd7e66065-04c3-4bab-bf09-bc6e1c7a9967',
  'feature-basic', 'basic',
  '문서 표준 템플릿',
  'Doc Templates',
  $$
## ✅ 문서 표준 템플릿
1. 문제 요약
2. 원인
3. 해결 절차
4. 검증 방법

## 🧪 체크리스트
- [ ] 문서당 해결 시간 3분 내
$$,
  4, 8, true
),
(
  'd7e66065-04c3-4bab-bf09-bc6e1c7a9967',
  'feature-advanced', 'advanced',
  '운영 프로세스',
  'Operational Workflow',
  $$
월간 리뷰와 담당자 지정으로 최신성을 유지합니다.
$$,
  5, 9, true
),
(
  'd7e66065-04c3-4bab-bf09-bc6e1c7a9967',
  'practice', 'intermediate',
  '실습: Top 10 질문 문서화',
  'Practice: Top 10 Articles',
  $$
최근 30일 질문 Top 10을 표준 템플릿으로 문서화합니다.
$$,
  6, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- module_contents: QA & Best Practices
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '9368ac4b-5694-4b09-8dd3-af37540fea5d',
  'overview', 'basic',
  '품질관리의 핵심',
  'QA Fundamentals',
  $$
## 🎯 QA 핵심
품질관리는 **일관성 + 피드백 루프**입니다.

## ✅ 기본 기준
- 정확성
- 공감/톤
- 해결 가능성

## ⚠️ 실패 패턴
- 평가 기준이 담당자마다 다름
$$,
  1, 7, true
),
(
  '9368ac4b-5694-4b09-8dd3-af37540fea5d',
  'overview', 'intermediate',
  '응대 평가 기준',
  'Evaluation Criteria',
  $$
- 정확성
- 공감/톤
- 해결 가능성
$$,
  2, 9, true
),
(
  '9368ac4b-5694-4b09-8dd3-af37540fea5d',
  'overview', 'advanced',
  '리뷰 체계 설계',
  'Review System',
  $$
주간 샘플링 → 피드백 → 개선안을 운영합니다.
$$,
  3, 9, true
),
(
  '9368ac4b-5694-4b09-8dd3-af37540fea5d',
  'feature-basic', 'basic',
  '응대 템플릿 구축',
  'Response Templates',
  $$
## ✅ 응대 템플릿 구축
1. 환불/장애/문의 템플릿 3종
2. 톤 가이드 문서화
3. 신규 인력 교육에 활용
$$,
  4, 8, true
),
(
  '9368ac4b-5694-4b09-8dd3-af37540fea5d',
  'feature-advanced', 'advanced',
  '코칭 & 개선 루프',
  'Coaching Loop',
  $$
저점 사례를 코칭 플랜으로 전환합니다.
$$,
  5, 9, true
),
(
  '9368ac4b-5694-4b09-8dd3-af37540fea5d',
  'practice', 'intermediate',
  '실습: 응대 품질 리뷰',
  'Practice: QA Review',
  $$
10건의 티켓을 평가표로 리뷰하고 개선안을 작성합니다.
$$,
  6, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

COMMIT;
