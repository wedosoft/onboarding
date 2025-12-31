-- Core module enrichment (Freshsales excluded)
-- Adds expanded curriculum content for Freshchat, Freshdesk, Freshdesk Omni, Freshservice

BEGIN;

-- =========================================================
-- Freshchat: 실시간 채팅 설정
-- Module ID: 5e6cb2b7-9f67-45e9-923b-ccb6c99d9d1d
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id,
  section_type,
  level,
  title_ko,
  title_en,
  content_md,
  display_order,
  estimated_minutes,
  is_active
) VALUES
(
  '5e6cb2b7-9f67-45e9-923b-ccb6c99d9d1d',
  'overview',
  'basic',
  '왜 “실시간 채팅”이 전환율을 바꾸는가?',
  'Why Live Chat Changes Conversion',
  $$
## 🎯 한 줄 요약
실시간 채팅은 **이탈을 막고 전환을 돕는 ‘즉시 대응 채널’**입니다. 기초 세팅만 잘해도 체감 성과가 큽니다.

## 😫 문제 상황 → 해결
- 고객이 가격/결제 페이지에서 오래 머무름
- 문의하려다 “귀찮아서” 그냥 이탈
- **채팅 위젯 노출이 질문을 행동으로 전환**

## 🧱 핵심 개념 3가지
1. **노출 타이밍**: 너무 빠르면 거부감, 너무 늦으면 이탈
2. **응답 속도**: 첫 응답 60초 내 목표
3. **안내 문구**: 한 문장 + CTA

## ✅ 기본 성공 기준
- FRT 60초 이내
- 채팅 후 이탈률 20% 이상 감소
- CSAT 4.3 이상

## ⚠️ 자주 하는 실수
- 모든 페이지에 동일 문구/타이밍 적용
- 운영 시간 설정 없이 24시간 노출
- 문의 유형 분류 없이 대기열로 이동
$$,
  1,
  6,
  true
),
(
  '5e6cb2b7-9f67-45e9-923b-ccb6c99d9d1d',
  'overview',
  'intermediate',
  '위젯 배치와 타겟팅: 보이는 곳에만 띄워라',
  'Widget Placement & Targeting',
  $$
## 🧭 배치 전략
- **가격/결제 페이지**: 구매 직전 이탈 방지
- **FAQ 상단**: 자가 해결 + 상담 전환
- **에러/취소 페이지**: 불만 고객 즉시 대응

### 타겟팅 규칙 예시
- 방문 2회 이상 + 체류 30초 이상 → 자동 오픈
- 장바구니 담기 후 1분 경과 → 도움 제안

### 실패 패턴
- 모든 페이지에서 무작위 팝업
- 첫 방문 3초 내 노출 (거부감)
$$,
  2,
  7,
  true
),
(
  '5e6cb2b7-9f67-45e9-923b-ccb6c99d9d1d',
  'overview',
  'advanced',
  '채팅 운영 품질 지표 설계',
  'Live Chat Operational KPIs',
  $$
## 📊 핵심 KPI 6가지
1. **첫 응답 시간(FRT)**: 60초 이내 목표
2. **평균 해결 시간(ART)**: 문의 유형별 목표 설정
3. **전환률**: 채팅 후 구매/가입 비율
4. **CSAT**: 단축 설문으로 확보
5. **이탈률**: 채팅 시작 후 이탈 비중
6. **봇 전환률**: 봇이 해결한 비중

### 운영 팁
- 피크 시간대에는 **알림 우선순위**를 높인다
- CSAT 낮은 세션은 **후속 메일**로 회복
$$,
  3,
  8,
  true
),
(
  '5e6cb2b7-9f67-45e9-923b-ccb6c99d9d1d',
  'feature-basic',
  'basic',
  '위젯 설치 & 브랜드 세팅',
  'Widget Install & Branding',
  $$
## ✅ 설치 & 기본 세팅 체크리스트
- [ ] 위젯 스크립트 삽입
- [ ] 브랜드 컬러/아이콘 반영
- [ ] 환영 메시지 1줄 설정
- [ ] 운영 시간(오피스 아워) 지정

## 🧭 추천 기본 설정
- 환영 메시지: “지금 도와드릴까요?”
- 오프라인 메시지: “남겨주시면 빠르게 답변드릴게요.”
- 노출 조건: 체류 30초 이상

## 🧪 빠른 검증 방법
1. 시크릿 창 접속
2. 30초 대기 → 위젯 노출 확인
3. 테스트 메시지 응답 시간 측정

## ⚠️ 실수 방지
- 알림 설정 누락 → 응답 지연
- 모바일에서 위젯이 과도하게 큼
$$,
  4,
  8,
  true
),
(
  '5e6cb2b7-9f67-45e9-923b-ccb6c99d9d1d',
  'feature-advanced',
  'advanced',
  '사전 분류 + 라우팅 연동',
  'Pre-Chat Forms & Routing',
  $$
## ⚙️ 고급 설정
- 사전 질문 폼: 문의 유형/우선순위
- 팀 라우팅: 가격/기술/환불 팀 분리
- VIP 고객 자동 우선 배정

### 실전 팁
- 질문은 **3개 이하**로 최소화
- “긴급 여부” 선택지는 필수
$$,
  5,
  10,
  true
),
(
  '5e6cb2b7-9f67-45e9-923b-ccb6c99d9d1d',
  'practice',
  'intermediate',
  '실습: 결제 페이지 전환률 개선',
  'Practice: Improve Checkout Conversion',
  $$
## 🧪 실습 목표
결제 페이지 이탈률을 15% 줄이기

### 단계
1. 결제 페이지에만 위젯 노출
2. “결제 오류/쿠폰 문의” 사전 질문 추가
3. 응답 60초 SLA 설정
4. 결과 리포트 확인

### 성공 기준
- 결제 완료율 +10% 이상
- CSAT 4.3 이상
$$,
  6,
  12,
  true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshchat: 챗봇 구성
-- Module ID: d18d21c1-4a71-411a-89b7-4f344ebb3c99
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  'd18d21c1-4a71-411a-89b7-4f344ebb3c99',
  'overview',
  'basic',
  '챗봇은 “1차 응대 자동화”다',
  'Chatbots as Tier-1 Automation',
  $$
## 🎯 챗봇의 역할
챗봇은 **반복 질문의 1차 처리**를 맡아 상담원의 시간을 확보합니다.

## 🧩 잘 맞는 질문 유형
- 비밀번호/로그인 문제
- 가격/플랜 비교
- 기능 위치 안내

## 🪜 기본 설계 원칙
1. 분류 질문: “어떤 도움이 필요하신가요?”
2. 해결 카드: FAQ/가이드 링크
3. 사람 연결: 언제든 전환

## ✅ 성공 기준
- 봇 해결률 50% 이상
- 사람 전환율 30~50%

## ⚠️ 흔한 실수
- 너무 긴 시나리오
- 사람 연결 버튼 숨김
$$,
  1,
  6,
  true
),
(
  'd18d21c1-4a71-411a-89b7-4f344ebb3c99',
  'overview',
  'intermediate',
  '플로우 설계 3단계',
  'Designing Bot Flows',
  $$
## 🧩 3단계 설계
1. **분류 질문**: “어떤 도움이 필요하신가요?”
2. **해결 카드**: FAQ/가이드 링크
3. **에스컬레이션**: 담당자 연결

### 실전 팁
- 한 플로우는 5~7 단계 이내
- 마지막엔 항상 “사람 연결” 버튼
$$,
  2,
  7,
  true
),
(
  'd18d21c1-4a71-411a-89b7-4f344ebb3c99',
  'overview',
  'advanced',
  '챗봇 품질 지표와 개선 루프',
  'Bot Quality Metrics',
  $$
## 📈 KPI
- 해결률 (Bot 해결 후 종료 비율)
- 인간 연결률 (높으면 플로우 개선 필요)
- 재문의율 (24시간 내 재유입)

### 개선 루프
주간 Top 10 질문 → 플로우 보강 → A/B 테스트
$$,
  3,
  8,
  true
),
(
  'd18d21c1-4a71-411a-89b7-4f344ebb3c99',
  'feature-basic',
  'basic',
  '기본 봇 만들기',
  'Build a Basic Bot',
  $$
## ✅ 기본 봇 구성 순서
1. FAQ 5개 선정
2. 답변 카드 생성
3. 버튼 2~3개로 분기
4. 마지막에 상담 연결 고정

## 🧠 질문 작성 팁
- 한 질문은 한 가지 문제
- 고객 용어 그대로 사용

## 🧪 테스트
- 신규 고객 시나리오로 실행
- 막히는 구간 유무 확인
$$,
  4,
  7,
  true
),
(
  'd18d21c1-4a71-411a-89b7-4f344ebb3c99',
  'feature-advanced',
  'advanced',
  'Freddy AI와 연동 전략',
  'Freddy AI Integration',
  $$
## ⚙️ 고급 전략
- FAQ 기반 답변 정확도 높이기
- 실패 시 자동 라우팅
- VIP 고객 우선 처리
$$,
  5,
  10,
  true
),
(
  'd18d21c1-4a71-411a-89b7-4f344ebb3c99',
  'practice',
  'intermediate',
  '실습: 환불/취소 봇 구축',
  'Practice: Refund Bot',
  $$
## 🧪 목표
환불 문의 50% 자동 해결

### 단계
1. 환불 정책 링크 삽입
2. 주문번호 입력 폼
3. 조건 분기(7일/14일)
4. 필요 시 상담 연결
$$,
  6,
  12,
  true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshchat: 메시징 채널 통합
-- Module ID: 40cbc806-4975-49af-beb7-ced9bc86d0f3
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '40cbc806-4975-49af-beb7-ced9bc86d0f3',
  'overview', 'basic',
  '왜 멀티채널 통합이 필요한가?',
  'Why Omnichannel Messaging',
  $$
## 🎯 핵심 의미
멀티채널 통합은 **고객 이력의 단절을 막는 기본**입니다.

## 😫 문제 상황
- 채널별 담당이 다름
- 고객이 같은 설명을 반복
- CSAT 하락

## ✅ 통합 효과
- 고객 이력 한 화면 조회
- 중복 대응 감소
- 채널별 SLA 분리

## ⚠️ 주의사항
- 채널별 정책(승인/템플릿) 확인 필수
$$,
  1, 6, true
),
(
  '40cbc806-4975-49af-beb7-ced9bc86d0f3',
  'overview', 'intermediate',
  '채널별 운영 룰 설계',
  'Channel Operations Design',
  $$
- 채널별 SLA/응답 시간 차등
- 업무 시간대별 자동 메시지
- VIP 채널 우선 정책
$$,
  2, 7, true
),
(
  '40cbc806-4975-49af-beb7-ced9bc86d0f3',
  'feature-basic', 'basic',
  'WhatsApp/FB/LINE 연동',
  'Connect WhatsApp/FB/LINE',
  $$
## ✅ 채널 연동 기본 절차
1. 계정 권한 확인
2. 브랜드 인증/템플릿 등록
3. 테스트 메시지 송수신
4. 라우팅 규칙 연결

## 🧪 체크리스트
- [ ] 발신 계정 인증 완료
- [ ] 기본 자동 응답 설정
- [ ] 라우팅 확인
$$,
  3, 8, true
),
(
  '40cbc806-4975-49af-beb7-ced9bc86d0f3',
  'feature-advanced', 'advanced',
  '채널 전환 시 컨텍스트 유지',
  'Context Continuity Across Channels',
  $$
고객이 채널을 바꿔도 이전 대화/티켓이 이어져야 합니다. **고객 ID 매핑**이 핵심입니다.
$$,
  4, 9, true
),
(
  '40cbc806-4975-49af-beb7-ced9bc86d0f3',
  'practice', 'intermediate',
  '실습: WhatsApp에서 상담 → 티켓 생성',
  'Practice: WhatsApp to Ticket',
  $$
- WhatsApp 문의 유입
- 자동 분류 및 담당자 지정
- 해결 후 CSAT 발송
$$,
  5, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshchat: 팀 관리 및 라우팅
-- Module ID: 04d8e2e6-23e2-459d-b1e4-e256be7b4be1
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '04d8e2e6-23e2-459d-b1e4-e256be7b4be1',
  'overview', 'basic',
  '채팅 라우팅은 곧 고객 경험이다',
  'Routing Shapes CX',
  $$
## 🎯 핵심 메시지
라우팅은 **고객 경험의 첫 관문**입니다. 잘못 배정되면 응답 지연과 불만으로 이어집니다.

## 🧱 기본 개념
- 그룹: 업무 유형별 팀
- 스킬: 상담원 역량 태그
- 라우팅: 조건 기반 배정

## ✅ 기준
- 평균 대기 2분 이하
- VIP 우선 배정
$$,
  1, 6, true
),
(
  '04d8e2e6-23e2-459d-b1e4-e256be7b4be1',
  'overview', 'intermediate',
  '라우팅 규칙 설계 원칙',
  'Routing Rule Principles',
  $$
- 담당자 스킬 기반 분배
- 부하 분산
- VIP 우선 배정
$$,
  2, 7, true
),
(
  '04d8e2e6-23e2-459d-b1e4-e256be7b4be1',
  'feature-basic', 'basic',
  '팀/그룹 구조 만들기',
  'Create Teams & Groups',
  $$
## ✅ 팀 구조 만들기
1. 문의 유형별 그룹 정의
2. 그룹별 담당자 배치
3. 업무 시간/휴무 설정
4. 기본 라우팅 규칙 연결

## ⚠️ 실수 방지
- 그룹에 너무 많은 유형을 넣지 않기
$$,
  3, 7, true
),
(
  '04d8e2e6-23e2-459d-b1e4-e256be7b4be1',
  'feature-advanced', 'advanced',
  '스킬 기반 자동 배정',
  'Skill-based Assignment',
  $$
스킬 태그로 자동 배정하면 신규/숙련 상담원이 효율적으로 배치됩니다.
$$,
  4, 9, true
),
(
  '04d8e2e6-23e2-459d-b1e4-e256be7b4be1',
  'practice', 'intermediate',
  '실습: VIP 라우팅 룰 만들기',
  'Practice: VIP Routing',
  $$
VIP 고객은 **응답 30초** SLA로 별도 라우팅합니다.
$$,
  5, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshchat: 캠페인 및 인앱 메시지
-- Module ID: 1fef628a-a680-4988-8ac8-e4cf9b1247a9
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '1fef628a-a680-4988-8ac8-e4cf9b1247a9',
  'overview', 'basic',
  '캠페인은 “타이밍의 과학”',
  'Campaigns Are About Timing',
  $$
## 🎯 캠페인의 본질
캠페인은 **타이밍과 메시지**입니다. 고객이 고민할 때만 노출해야 효과가 있습니다.

## ✅ 활용 시점
- 가격 페이지 체류 30초 이상
- 기능 사용 중 이탈 발생
- 신규 가입 후 24시간 내
$$,
  1, 6, true
),
(
  '1fef628a-a680-4988-8ac8-e4cf9b1247a9',
  'overview', 'intermediate',
  '세그먼트 타겟팅 전략',
  'Segmentation Strategy',
  $$
- 신규 방문자 vs 재방문자
- 장바구니 보유 고객
- 기능 사용률 낮은 고객
$$,
  2, 7, true
),
(
  '1fef628a-a680-4988-8ac8-e4cf9b1247a9',
  'feature-basic', 'basic',
  '캠페인 메시지 만들기',
  'Create Campaign Messages',
  $$
## ✅ 기본 캠페인 만들기
1. 타겟 세그먼트 설정
2. 메시지 1문장 + CTA 1개
3. 노출 타이밍 지정
4. A/B 테스트 준비

## 🧪 체크리스트
- [ ] CTA 클릭률 2% 이상
$$,
  3, 7, true
),
(
  '1fef628a-a680-4988-8ac8-e4cf9b1247a9',
  'feature-advanced', 'advanced',
  'A/B 테스트 운영',
  'A/B Testing',
  $$
- 제목만 바꿔도 반응률이 달라집니다.
- 최소 1주일 데이터 확보 후 판단
$$,
  4, 9, true
),
(
  '1fef628a-a680-4988-8ac8-e4cf9b1247a9',
  'practice', 'intermediate',
  '실습: 기능 미사용 고객 리텐션 캠페인',
  'Practice: Feature Adoption',
  $$
기능 사용률이 낮은 고객에게 튜토리얼 메시지를 전송합니다.
$$,
  5, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshdesk: 티켓 관리 기초
-- Module ID: 28f2de88-2166-4211-a158-c74f86acedc4
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '28f2de88-2166-4211-a158-c74f86acedc4',
  'overview', 'basic',
  '티켓은 “업무의 단위”다',
  'Tickets as Work Units',
  $$
## 🎯 한 줄 요약
티켓은 문의를 **기록·추적·책임**으로 바꾸는 최소 단위입니다.

## 😫 문제 상황
- 문의가 이메일/전화로 흩어짐
- 인수인계 누락
- SLA 위반 발생

## ✅ 티켓 가치
1. 추적성
2. 품질관리(SLA)
3. 지식화
$$,
  1, 6, true
),
(
  '28f2de88-2166-4211-a158-c74f86acedc4',
  'overview', 'intermediate',
  'SLA와 우선순위 설계',
  'SLA & Priority Design',
  $$
- SLA는 고객 기대치의 약속
- 우선순위는 처리 순서를 결정
$$,
  2, 7, true
),
(
  '28f2de88-2166-4211-a158-c74f86acedc4',
  'overview', 'advanced',
  '티켓 품질 지표',
  'Ticket Quality KPIs',
  $$
FRT, ART, 해결률, 재오픈율을 운영 지표로 설정합니다.
$$,
  3, 8, true
),
(
  '28f2de88-2166-4211-a158-c74f86acedc4',
  'feature-basic', 'basic',
  '티켓 생성과 필드 표준화',
  'Ticket Fields & Standards',
  $$
## ✅ 기본 티켓 세팅
1. 필수 필드 정의
2. 상태 흐름 정의
3. 기본 SLA 연결

## 🧪 체크리스트
- [ ] 신규 티켓 자동 알림
- [ ] 미배정 티켓 0건
$$,
  4, 8, true
),
(
  '28f2de88-2166-4211-a158-c74f86acedc4',
  'feature-advanced', 'advanced',
  '상태 전이 자동화',
  'State Automation',
  $$
상태 변경을 자동화하면 에이전트 부담이 줄어듭니다.
$$,
  5, 9, true
),
(
  '28f2de88-2166-4211-a158-c74f86acedc4',
  'practice', 'intermediate',
  '실습: SLA 위반 0% 만들기',
  'Practice: Zero SLA Breach',
  $$
SLA 임박 티켓 자동 알림 + 우선순위 상향 룰을 설정합니다.
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
-- Freshdesk: 옴니채널 지원
-- Module ID: 1102326d-2a92-4f2a-9ba0-39dfe9d878c7
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '1102326d-2a92-4f2a-9ba0-39dfe9d878c7',
  'overview', 'basic',
  '채널이 늘수록 운영은 복잡해진다',
  'Omnichannel Complexity',
  $$
## 🎯 핵심 메시지
옴니채널은 **채널 통합이 아니라 고객 경험 통합**입니다.

## 🧱 기본 개념
- 다양한 채널을 한 인박스로 관리
- 고객 ID 기준으로 대화 연결
$$,
  1, 6, true
),
(
  '1102326d-2a92-4f2a-9ba0-39dfe9d878c7',
  'overview', 'intermediate',
  '채널 통합 정책',
  'Channel Unification Policy',
  $$
- 고객 ID 기준 통합
- 동일 고객 문의는 한 티켓으로 연결
$$,
  2, 7, true
),
(
  '1102326d-2a92-4f2a-9ba0-39dfe9d878c7',
  'feature-basic', 'basic',
  '이메일/전화/소셜 연동',
  'Connect Email/Phone/Social',
  $$
## ✅ 채널 연동 기본 단계
1. 이메일/전화 채널 연결
2. 소셜 계정 연동
3. 테스트 티켓 생성
4. 고객 ID 매핑 확인
$$,
  3, 8, true
),
(
  '1102326d-2a92-4f2a-9ba0-39dfe9d878c7',
  'feature-advanced', 'advanced',
  '채널별 SLA 차등 설정',
  'Channel-specific SLAs',
  $$
전화/채팅은 더 빠른 SLA를 적용합니다.
$$,
  4, 9, true
),
(
  '1102326d-2a92-4f2a-9ba0-39dfe9d878c7',
  'practice', 'intermediate',
  '실습: 소셜 문의 우선 배정',
  'Practice: Social Priority',
  $$
소셜 채널 문의는 브랜드 리스크가 크므로 우선 라우팅합니다.
$$,
  5, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshdesk: 지식 베이스 관리
-- Module ID: fbd40b3d-ab2a-466d-a1f5-78cdec4b6545
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  'fbd40b3d-ab2a-466d-a1f5-78cdec4b6545',
  'overview', 'basic',
  '지식 베이스는 셀프서비스의 핵심',
  'Knowledge Base Fundamentals',
  $$
## 🎯 KB의 역할
지식 베이스는 **셀프서비스 채널**이며 지원 비용 절감의 핵심입니다.

## ✅ 좋은 KB 조건
- 검색이 쉬운 구조
- 문제 해결 중심 문서
- 최신 업데이트 유지
$$,
  1, 6, true
),
(
  'fbd40b3d-ab2a-466d-a1f5-78cdec4b6545',
  'overview', 'intermediate',
  '문서 구조 설계법',
  'Structuring Articles',
  $$
카테고리/폴더 구조가 검색 효율을 결정합니다.
$$,
  2, 7, true
),
(
  'fbd40b3d-ab2a-466d-a1f5-78cdec4b6545',
  'feature-basic', 'basic',
  'FAQ 작성 가이드',
  'FAQ Writing',
  $$
## ✅ 기본 문서 작성법
1. 제목에 핵심 키워드 포함
2. 단계별 해결 방법
3. 스크린샷/짧은 GIF

## 🧪 체크리스트
- [ ] 문서 1개 = 문제 1개
$$,
  3, 8, true
),
(
  'fbd40b3d-ab2a-466d-a1f5-78cdec4b6545',
  'feature-advanced', 'advanced',
  '검색 최적화와 태그',
  'Search Optimization',
  $$
자주 검색되는 키워드를 제목/요약에 반영합니다.
$$,
  4, 9, true
),
(
  'fbd40b3d-ab2a-466d-a1f5-78cdec4b6545',
  'practice', 'intermediate',
  '실습: 상위 5개 문의 문서화',
  'Practice: Top 5 Issues',
  $$
최근 30일 상위 5개 문의를 문서로 만들어봅니다.
$$,
  5, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshdesk: 리포팅 및 분석
-- Module ID: 9dd2a299-7140-499b-98e3-18d0f7c0d913
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '9dd2a299-7140-499b-98e3-18d0f7c0d913',
  'overview', 'basic',
  '숫자가 없으면 개선도 없다',
  'No Metrics, No Improvement',
  $$
## 🎯 한 줄 요약
리포팅은 운영을 **데이터로 설명**하는 도구입니다.

## ✅ 핵심 지표
- 티켓 볼륨
- 응답/해결 시간
- CSAT
$$,
  1, 6, true
),
(
  '9dd2a299-7140-499b-98e3-18d0f7c0d913',
  'overview', 'intermediate',
  '핵심 지표 정의',
  'Defining Core Metrics',
  $$
- 티켓 볼륨
- 해결 시간
- CSAT
$$,
  2, 7, true
),
(
  '9dd2a299-7140-499b-98e3-18d0f7c0d913',
  'feature-basic', 'basic',
  '기본 리포트 생성',
  'Build Basic Reports',
  $$
## ✅ 기본 리포트 만들기
1. 기간 필터 설정
2. 팀/에이전트 기준 분리
3. 핵심 지표 3개만 표시
$$,
  3, 8, true
),
(
  '9dd2a299-7140-499b-98e3-18d0f7c0d913',
  'feature-advanced', 'advanced',
  '커스텀 대시보드',
  'Custom Dashboards',
  $$
부서별 대시보드를 분리합니다.
$$,
  4, 9, true
),
(
  '9dd2a299-7140-499b-98e3-18d0f7c0d913',
  'practice', 'intermediate',
  '실습: 월간 운영 리포트',
  'Practice: Monthly Report',
  $$
월간 티켓 추이와 SLA 준수율을 보고서로 작성합니다.
$$,
  5, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshdesk Omni: 통합 워크스페이스 이해
-- Module ID: dce2d97e-bedf-47b7-91cc-8c6d96c21b44
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  'dce2d97e-bedf-47b7-91cc-8c6d96c21b44',
  'overview', 'basic',
  '옴니 워크스페이스의 가치',
  'Value of Omni Workspace',
  $$
## 🎯 핵심 가치
옴니 워크스페이스는 상담원이 **한 화면에서 일하게 만드는 것**입니다.

## ✅ 효과
- 전환 시간 감소
- 고객 맥락 유지
$$,
  1, 6, true
),
(
  'dce2d97e-bedf-47b7-91cc-8c6d96c21b44',
  'overview', 'intermediate',
  '에이전트 생산성 향상',
  'Agent Productivity',
  $$
통합 화면은 전환 시간을 줄이고 품질을 높입니다.
$$,
  2, 7, true
),
(
  'dce2d97e-bedf-47b7-91cc-8c6d96c21b44',
  'feature-basic', 'basic',
  '워크스페이스 커스터마이징',
  'Workspace Customization',
  $$
## ✅ 기본 설정
1. 필요한 위젯만 남기기
2. 핵심 필드 고정
3. 불필요한 패널 숨김
$$,
  3, 8, true
),
(
  'dce2d97e-bedf-47b7-91cc-8c6d96c21b44',
  'practice', 'intermediate',
  '실습: 통합 화면으로 처리 속도 개선',
  'Practice: Speed Up Resolution',
  $$
멀티탭 전환 시간을 줄여 평균 처리 시간을 개선합니다.
$$,
  4, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshdesk Omni: 채팅-티켓 전환 플로우
-- Module ID: 1092f266-20e1-48c0-9bdb-91039b67f27d
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '1092f266-20e1-48c0-9bdb-91039b67f27d',
  'overview', 'basic',
  '채팅을 티켓으로 전환해야 할 때',
  'When to Convert Chat to Ticket',
  $$
## 🎯 언제 티켓으로 전환할까?
- 해결에 시간이 걸리는 문의
- 추적/보고가 필요한 문의
- 팀 협업이 필요한 문의
$$,
  1, 6, true
),
(
  '1092f266-20e1-48c0-9bdb-91039b67f27d',
  'feature-basic', 'basic',
  '전환 흐름 설정',
  'Conversion Flow Setup',
  $$
## ✅ 전환 기본 흐름
1. 전환 버튼 클릭
2. 대화 이력 자동 첨부
3. 담당 팀 배정
$$,
  2, 8, true
),
(
  '1092f266-20e1-48c0-9bdb-91039b67f27d',
  'feature-advanced', 'advanced',
  '후속 자동화 연결',
  'Post-Conversion Automation',
  $$
전환된 티켓은 SLA/우선순위 규칙을 자동 적용합니다.
$$,
  3, 9, true
),
(
  '1092f266-20e1-48c0-9bdb-91039b67f27d',
  'practice', 'intermediate',
  '실습: 환불 채팅 → 티켓 자동 분류',
  'Practice: Refund Conversion',
  $$
환불 문의는 자동으로 회계팀 그룹에 배정합니다.
$$,
  4, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshdesk Omni: 옴니채널 라우팅
-- Module ID: 901f1197-c208-47bc-a253-0058b157fa0e
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '901f1197-c208-47bc-a253-0058b157fa0e',
  'overview', 'basic',
  '모든 채널을 하나의 규칙으로',
  'Unified Routing Rules',
  $$
## 🎯 통합 라우팅 핵심
모든 채널에 **같은 우선순위 기준**을 적용해야 합니다.
$$,
  1, 6, true
),
(
  '901f1197-c208-47bc-a253-0058b157fa0e',
  'feature-basic', 'basic',
  '채널별 분류 규칙',
  'Channel-specific Rules',
  $$
## ✅ 기본 라우팅 규칙
1. 채널별 기본 그룹 지정
2. 우선순위 기준 정의
3. 야간/휴일 예외
$$,
  2, 8, true
),
(
  '901f1197-c208-47bc-a253-0058b157fa0e',
  'feature-advanced', 'advanced',
  '우선순위 기반 라우팅',
  'Priority Routing',
  $$
VIP/긴급 문의는 전 채널에서 우선 배정합니다.
$$,
  3, 9, true
),
(
  '901f1197-c208-47bc-a253-0058b157fa0e',
  'practice', 'intermediate',
  '실습: 통합 라우팅 룰 구성',
  'Practice: Unified Routing',
  $$
채널별 조건을 하나의 룰셋으로 통합합니다.
$$,
  4, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshdesk Omni: 통합 고객 뷰 활용
-- Module ID: 8bbfedb4-ac6a-48bc-8f5c-2b38bf7ddae6
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '8bbfedb4-ac6a-48bc-8f5c-2b38bf7ddae6',
  'overview', 'basic',
  '고객 360의 의미',
  'Customer 360 Basics',
  $$
## 🎯 고객 360의 의미
고객의 모든 이력(티켓/채팅/구매)을 한 화면에서 확인합니다.

## ✅ 효과
- 개인화 응대
- 중복 질문 감소
$$,
  1, 6, true
),
(
  '8bbfedb4-ac6a-48bc-8f5c-2b38bf7ddae6',
  'feature-basic', 'basic',
  '고객 프로필 설정',
  'Customer Profile Setup',
  $$
## ✅ 기본 프로필 구성
1. 고객 필드 표준화
2. 태그 규칙 정의
3. 최근 대화 표시
$$,
  2, 8, true
),
(
  '8bbfedb4-ac6a-48bc-8f5c-2b38bf7ddae6',
  'feature-advanced', 'advanced',
  '개인화 서비스 설계',
  'Personalized Service',
  $$
고객 행동 데이터를 활용해 맞춤 응대를 제공합니다.
$$,
  3, 9, true
),
(
  '8bbfedb4-ac6a-48bc-8f5c-2b38bf7ddae6',
  'practice', 'intermediate',
  '실습: VIP 고객 이력 기반 응대',
  'Practice: VIP Context Handling',
  $$
이전 불만 이력을 참고해 톤과 우선순위를 조정합니다.
$$,
  4, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshservice: 티켓 관리 기초
-- Module ID: f0d4d680-7c65-4d3d-8af0-2156100bd4a1
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  'f0d4d680-7c65-4d3d-8af0-2156100bd4a1',
  'overview', 'basic',
  'IT 서비스 요청의 시작',
  'IT Ticketing Basics',
  $$
## 🎯 IT 서비스 요청의 출발점
요청을 티켓으로 관리하면 **누락 없이 처리**할 수 있습니다.

## ✅ 필수 요소
- 카테고리/우선순위
- 담당자 배정
- SLA 기준
$$,
  1, 6, true
),
(
  'f0d4d680-7c65-4d3d-8af0-2156100bd4a1',
  'overview', 'intermediate',
  '우선순위와 카테고리 표준화',
  'Priority & Category Standards',
  $$
요청 분류가 정확해야 리포팅이 정확해집니다.
$$,
  2, 7, true
),
(
  'f0d4d680-7c65-4d3d-8af0-2156100bd4a1',
  'feature-basic', 'basic',
  '요청 폼 구성',
  'Request Forms',
  $$
## ✅ 기본 설정
1. 요청 유형별 폼 구성
2. 필수 입력 항목 지정
3. 자동 배정 룰 연결
$$,
  3, 8, true
),
(
  'f0d4d680-7c65-4d3d-8af0-2156100bd4a1',
  'feature-advanced', 'advanced',
  'SLA 규칙 설계',
  'SLA Design',
  $$
업무 시간/휴일을 반영한 SLA 설계를 수행합니다.
$$,
  4, 9, true
),
(
  'f0d4d680-7c65-4d3d-8af0-2156100bd4a1',
  'practice', 'intermediate',
  '실습: 신규 입사자 장비 요청 티켓',
  'Practice: New Hire IT Request',
  $$
신입사원 온보딩 요청을 표준 티켓으로 구성합니다.
$$,
  5, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshservice: 서비스 카탈로그
-- Module ID: 97e86a5d-4c13-4520-8603-5e25e31158c8
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '97e86a5d-4c13-4520-8603-5e25e31158c8',
  'overview', 'basic',
  '서비스 카탈로그의 가치',
  'Value of Service Catalog',
  $$
## 🎯 카탈로그의 핵심
서비스 카탈로그는 **요청을 표준화**하는 도구입니다.

## ✅ 효과
- 요청 품질 향상
- 승인/처리 시간 단축
$$,
  1, 6, true
),
(
  '97e86a5d-4c13-4520-8603-5e25e31158c8',
  'overview', 'intermediate',
  '카탈로그 구조 설계',
  'Catalog Structure',
  $$
카테고리/하위 서비스 기준으로 구성합니다.
$$,
  2, 7, true
),
(
  '97e86a5d-4c13-4520-8603-5e25e31158c8',
  'feature-basic', 'basic',
  '서비스 아이템 만들기',
  'Create Service Items',
  $$
## ✅ 기본 구축 순서
1. 자주 요청되는 서비스 5개 정의
2. 요청 폼 구성
3. 승인 단계 연결
$$,
  3, 8, true
),
(
  '97e86a5d-4c13-4520-8603-5e25e31158c8',
  'feature-advanced', 'advanced',
  '승인/자동화 연결',
  'Approval & Automation',
  $$
승인 단계와 SLA를 자동화합니다.
$$,
  4, 9, true
),
(
  '97e86a5d-4c13-4520-8603-5e25e31158c8',
  'practice', 'intermediate',
  '실습: 노트북 지급 카탈로그',
  'Practice: Laptop Provisioning',
  $$
노트북 요청을 카탈로그 항목으로 구성합니다.
$$,
  5, 10, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshservice: 기존 고급 모듈 확장 (Automation / Asset / Reporting)
-- Add advanced extensions with higher display_order
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'overview', 'advanced',
  '운영 안정화를 위한 자동화 점검표',
  'Automation Ops Checklist',
  $$
## ✅ 점검 항목
- 규칙 충돌 여부
- 루프 방지 태그 적용
- SLA 임박 알림 테스트
- 승인 단계 실패 시 대체 경로
$$,
  80, 10, true
),
(
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'practice', 'advanced',
  '실습: 다단계 승인 + 에스컬레이션',
  'Practice: Multi-step Approval',
  $$
요청 금액 기준으로 승인 단계를 자동 분기합니다.
$$,
  81, 15, true
),
(
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'feature-advanced', 'advanced',
  'CMDB 품질 관리(정합성 체크)',
  'CMDB Data Quality',
  $$
정합성 규칙을 만들어 누락/중복 데이터를 줄입니다.
$$,
  80, 10, true
),
(
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'practice', 'advanced',
  '실습: 유령 자산(Ghost Asset) 정리',
  'Practice: Ghost Asset Cleanup',
  $$
최근 6개월 미사용 자산을 추려 정리합니다.
$$,
  81, 12, true
),
(
  'c732aff3-5522-4b33-b127-eb431de83fa1',
  'feature-advanced', 'advanced',
  '예측 리포트와 인사이트 활용',
  'Predictive Insights',
  $$
티켓 볼륨 예측으로 인력 배치를 최적화합니다.
$$,
  80, 10, true
),
(
  'c732aff3-5522-4b33-b127-eb431de83fa1',
  'practice', 'advanced',
  '실습: 경영진 KPI 리포트',
  'Practice: Executive KPI Report',
  $$
SLA 준수율과 비용 절감 효과를 보고서로 요약합니다.
$$,
  81, 12, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Freshdesk: 기존 고급 모듈 확장 (Automation)
-- =========================================================
INSERT INTO onboarding.module_contents (
  module_id, section_type, level, title_ko, title_en,
  content_md, display_order, estimated_minutes, is_active
) VALUES
(
  '7d8d329c-384a-4040-bb88-f9cdb9e0682d',
  'feature-advanced', 'advanced',
  '자동화 운영 리스크 관리',
  'Automation Risk Management',
  $$
- 충돌 규칙 정리
- 루프 감지 태그
- 예외 고객 처리 전략
$$,
  80, 10, true
),
(
  '7d8d329c-384a-4040-bb88-f9cdb9e0682d',
  'practice', 'advanced',
  '실습: VIP + 긴급 라우팅 복합 룰',
  'Practice: VIP + Urgent Routing',
  $$
VIP 고객의 긴급 티켓을 최우선 배정합니다.
$$,
  81, 12, true
)
ON CONFLICT (module_id, section_type, level) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  title_en = EXCLUDED.title_en,
  content_md = EXCLUDED.content_md,
  display_order = EXCLUDED.display_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_active = EXCLUDED.is_active;

COMMIT;
