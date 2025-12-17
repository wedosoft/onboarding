-- Update Freshdesk Automation Module with enriched, beginner-friendly content
-- Module ID: 7d8d329c-384a-4040-bb88-f9cdb9e0682d

-- Delete existing content (idempotent for re-apply in non-transactional environments)
DELETE FROM onboarding.module_contents
WHERE module_id = '7d8d329c-384a-4040-bb88-f9cdb9e0682d';

-- 1. Overview - Basic
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
) VALUES (
  '7d8d329c-384a-4040-bb88-f9cdb9e0682d',
  'overview',
  'basic',
  '왜 자동화 워크플로우인가?',
  'Why Automation Workflows?',
  '
## 🎯 자동화는 “반복 업무를 규칙으로 바꾸는 일”

Freshdesk에서 자동화는 단순히 편의 기능이 아니라, **지원 품질을 표준화**하고 **SLA를 지키게 만드는 운영 장치**입니다.

### 자동화가 해결하는 4가지 대표 문제

1) **분류 지연**: 티켓이 들어오지만 어떤 팀이 맡아야 할지 늦어짐  
2) **배정 편차**: 같은 유형인데 담당자/그룹 배정이 매번 달라짐  
3) **에스컬레이션 누락**: SLA 임박/위반인데도 놓침  
4) **후속 작업 누락**: 해결 후 태그/필드 정리, 고객 안내가 빠짐

---

## 🧱 자동화 규칙의 공통 구조 (외우면 끝)

자동화는 대부분 아래 3요소로 설명됩니다.

| 구성 | 의미 | 예시 |
|---|---|---|
| 트리거(WHEN) | 언제 실행? | 티켓 생성, 상태 변경, 시간 경과 |
| 조건(IF) | 어떤 경우에만? | 카테고리=결제, 우선순위=긴급 |
| 동작(THEN) | 무엇을 할까? | 그룹 배정, 우선순위 변경, 알림 발송 |

이 구조만 익히면 어떤 자동화도 “읽고 → 고치고 → 만들 수” 있습니다.

---

## ✅ 최소 목표 (이 모듈에서 가져갈 것)

- Freshdesk 자동화 3종(Dispatch’r / Supervisor / Observer)의 역할을 구분한다
- “배정/알림/에스컬레이션” 3대 패턴을 규칙으로 구현한다
- 규칙 충돌·무한 루프·과도한 조건 같은 운영 리스크를 피한다
',
  1,
  6,
  true
);

-- 2. Overview - Intermediate
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
) VALUES (
  '7d8d329c-384a-4040-bb88-f9cdb9e0682d',
  'overview',
  'intermediate',
  'Dispatch’r · Supervisor · Observer 한 장으로 정리',
  'Dispatch’r · Supervisor · Observer Explained',
  '
## 🧭 Freshdesk 자동화 3종의 역할

Freshdesk의 자동화는 이름은 많아 보이지만, 핵심은 아래 3가지로 정리됩니다.

| 종류 | 주 용도 | 실행 타이밍(감각) | 대표 예시 |
|---|---|---|---|
| **Dispatch’r** | “들어오는 티켓”의 라우팅 | 티켓 생성 직후 | 그룹/담당자 자동 배정 |
| **Supervisor Rules** | “상태가 바뀌는 티켓” 관리 | 이벤트/시간 기반 | SLA 임박 시 우선순위 상향 |
| **Observer Rules** | “변경 감시”와 알림 | 필드 변경 감지 | 우선순위=긴급으로 바뀌면 관리자 알림 |

> 조직에 따라 메뉴명이 다를 수 있지만, 역할 구분은 동일합니다.

---

## 🧩 운영에서 자주 쓰는 패턴 6개

1) **라우팅(배정)**: 카테고리/채널/태그로 그룹 배정  
2) **우선순위 정렬**: VIP/긴급 키워드 감지 → 우선순위 상향  
3) **에스컬레이션**: SLA 임박/위반 → 상위 그룹/매니저 알림  
4) **자동 응답**: 접수 즉시 안내(처리 SLA, 참고 링크)  
5) **데이터 정리**: 태그/커스텀 필드 표준화(보고서 품질)  
6) **재발 방지**: 해결 후 KB/원인 코드 입력 강제(또는 알림)

---

## ⚠️ 중급자가 반드시 피해야 할 함정

- **조건이 너무 넓음**: 모든 티켓에 동작 → 오탐 폭주
- **규칙 충돌**: A 규칙이 배정하고 B 규칙이 다시 배정
- **루프 발생**: 규칙이 필드를 바꾸고, 그 변경이 다시 규칙 트리거

해결은 간단합니다:
- 조건에 **예외 태그**(예: `auto_processed`)를 넣고, 규칙에서 마지막에 태그를 붙입니다.
',
  2,
  6,
  true
);

-- 3. Overview - Advanced
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
) VALUES (
  '7d8d329c-384a-4040-bb88-f9cdb9e0682d',
  'overview',
  'advanced',
  '복합 자동화 시나리오 설계: 충돌 없이, 놓치지 않게',
  'Designing Complex Automations',
  '
## 🏗️ “작동하는 규칙”과 “운영 가능한 규칙”은 다릅니다

고급 자동화의 핵심은 기능 자체가 아니라 **운영 품질**입니다.

### 운영 품질 체크리스트

- **우선순위/순서**: 규칙 실행 순서가 정의되어 있는가?
- **예외 처리**: VIP, 야간, 휴일, 특정 고객은 어떻게 처리되는가?
- **검증 가능성**: 티켓 활동 로그에서 무엇이 바뀌었는지 추적 가능한가?
- **안전 장치**: 루프/오탐을 막는 태그/조건이 있는가?

---

## 🧠 복합 시나리오 예시 (현업형)

### 시나리오: 결제 장애(긴급) 티켓이 들어오면

1) 채널=전화/메일/포털 상관없이 “결제 장애”로 분류  
2) VIP 고객이면 우선순위=긴급 + 매니저 알림  
3) SLA 1시간 전이면 자동 에스컬레이션  
4) 해결 후 고객에게 결과 안내 + KB 링크 제안  

이를 규칙으로 나누면:

- Dispatch’r: **초기 라우팅/배정**
- Observer: **필드 변경 감지(긴급 전환, VIP 표시 등)**
- Supervisor: **시간 경과 기반 에스컬레이션**

---

## 🔍 디버깅 팁 (문제 발생 시 가장 먼저 할 것)

1) 티켓을 열고 **활동/이벤트 로그**에서 “무슨 규칙이 적용됐는지” 확인  
2) 조건이 넓은 규칙부터 의심: “포함(contains)” 조건 남발 여부  
3) 루프 의심 시: 태그/필드가 같은 값으로 반복 변경되는지 확인  
4) 충돌 의심 시: 동일 필드를 변경하는 규칙이 2개 이상인지 확인  

> 자동화는 “정확도(precision)”가 생명입니다. 처음부터 넓게 만들고 줄이는 것보다, 좁게 만들고 확장하는 편이 안전합니다.
',
  3,
  6,
  true
);

-- 4. Feature - Basic
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
) VALUES (
  '7d8d329c-384a-4040-bb88-f9cdb9e0682d',
  'feature-basic',
  'basic',
  '티켓 자동 배정(라우팅) 규칙 만들기',
  'Build a Ticket Routing Rule',
  '
## ✅ 목표: “어떤 티켓이 들어오면 어느 팀이 맡는다”를 자동화

아래는 가장 흔한 라우팅 패턴입니다.

### 패턴 A: 카테고리 기반 라우팅

- 조건: 카테고리 = 결제/정산
- 동작: 그룹 = Billing Support

### 패턴 B: 채널 기반 라우팅

- 조건: 채널 = 전화
- 동작: 그룹 = Phone Support, 우선순위 = High

---

## 🧪 구현 절차(권장)

### 1) 규칙의 입력값(표준)을 먼저 정합니다

자동화는 “조건”이 정확해야 합니다.

- 카테고리/서브카테고리를 표준으로 쓸지
- 태그를 표준으로 쓸지
- 커스텀 필드를 쓸지

가장 안전한 조합:
- **카테고리 + 태그** (태그는 자동화가 붙여도 되고, 에이전트가 붙여도 됨)

---

### 2) 조건은 좁게 시작합니다

예시(권장):
- 카테고리 = 결제
- 우선순위 != 긴급
- 태그에 `auto_processed` 가 **없음**

---

### 3) 동작(THEN)은 “한 번에 한 가지”부터

처음에는 배정만 자동화하세요.

- 그룹 배정
- 담당자 배정(라운드로빈이 필요하면 이후 단계에서)
- 우선순위 변경은 별도 규칙으로 분리(디버깅 쉬움)

---

### 4) 테스트 티켓으로 검증합니다

테스트 체크리스트:
- 예상 그룹으로 배정되는가?
- 예상치 못한 티켓에 적용되지 않는가?
- 티켓 활동 로그에서 변경이 1회로 끝나는가?

> 운영에서 가장 흔한 사고는 “규칙이 너무 많이 적용”되는 것입니다.
',
  4,
  8,
  true
);

-- 5. Feature - Advanced
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
) VALUES (
  '7d8d329c-384a-4040-bb88-f9cdb9e0682d',
  'feature-advanced',
  'basic',
  '심화 설정: 충돌 방지 · 예외 처리 · 에스컬레이션',
  'Advanced Setup: Conflict-Free Automations',
  '
## 🧯 충돌 방지 3원칙

### 1) 같은 필드를 바꾸는 규칙은 최소화

특히 아래 필드는 충돌이 잦습니다:
- 그룹/담당자
- 우선순위
- 상태

가능하면:
- “배정”은 한 곳(Dispatch’r)에서만
- “우선순위 상향”은 Supervisor/Observer에서만

---

### 2) 예외(override) 규칙을 맨 위로

예외 예시:
- VIP 고객
- 특정 키워드(장애/보안)
- 특정 고객사(계약 SLA가 다름)

예외 규칙은 조건이 좁고 중요도가 높으므로 먼저 평가되게 두는 게 안전합니다.

---

### 3) 무한 루프 방지 태그를 사용

권장 패턴:
- 조건(IF): 태그에 `auto_processed` 없음
- 동작(THEN): 마지막에 태그 `auto_processed` 추가

이렇게 하면 규칙이 필드를 바꾸면서 재트리거되는 상황을 대부분 차단할 수 있습니다.

---

## ⏰ SLA/시간 기반 에스컬레이션(운영 필수)

권장 2단계:
- SLA 60분 전: 담당자 리마인드
- SLA 15분 전: 매니저/상위그룹 에스컬레이션

이때 주의할 점:
- 야간/휴일(업무시간 설정)이 있으면, **업무시간 기준 SLA**인지 확인
- 긴급 티켓만 적용(조건으로 제한)

---

## 🔗 외부 연동 아이디어(선택)

아래는 “규칙”에 붙이기 좋은 후속 자동화입니다.

- 웹훅으로 Slack/Teams 알림
- 장애 티켓이면 Status Page 업데이트 트리거
- 고객사/제품별로 다른 템플릿 답변 자동 삽입

> 연동은 “자동화의 마지막 10%”입니다. 먼저 내부 라우팅/에스컬레이션이 안정적으로 돌아가는지 확인하세요.
',
  5,
  8,
  true
);

-- 6. Practice - Basic
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
) VALUES (
  '7d8d329c-384a-4040-bb88-f9cdb9e0682d',
  'practice',
  'basic',
  '실습: 결제 장애 티켓 자동화 만들기',
  'Hands-on Practice',
  '
## 🧪 실습 목표

“결제 장애” 티켓이 들어오면 다음이 자동으로 되도록 만듭니다.

1) Billing Support 그룹으로 자동 배정  
2) VIP 고객이면 우선순위=긴급 + 매니저 알림  
3) SLA 임박 시 에스컬레이션  

---

## ✅ 준비(5분)

- 그룹 2개: `Billing Support`, `Support Managers`
- 태그 2개(규칙에서 사용): `incident_payment`, `auto_processed`
- VIP 식별 방법 1개 선택:
  - 요청자 회사/도메인, 또는
  - 커스텀 필드 `is_vip` (권장)

---

## 1) Dispatch’r: 결제 장애 라우팅

조건:
- 카테고리 = 결제
- 태그에 `auto_processed` 없음

동작:
- 그룹 = Billing Support
- 태그 추가: `incident_payment`, `auto_processed`

---

## 2) Observer: VIP 처리(우선순위 상향 + 알림)

조건:
- `is_vip = true` (또는 도메인/회사 기반)
- 태그에 `incident_payment` 포함

동작:
- 우선순위 = 긴급
- 그룹/이메일로 Support Managers 알림(티켓 링크 포함)

---

## 3) Supervisor: SLA 임박 에스컬레이션

조건:
- 우선순위 = 긴급
- 상태 != 해결
- SLA 임박(예: 60분/15분 전)

동작:
- 담당자 리마인드
- Support Managers 에스컬레이션 알림

---

## 4) 검증(필수)

테스트 티켓 3개를 만들어 확인하세요.

1) 일반 결제 티켓: Billing Support로만 배정되는가?  
2) VIP 결제 티켓: 긴급 전환 + 매니저 알림이 발생하는가?  
3) 결제 아닌 티켓: 어떤 규칙도 적용되지 않는가?  

문제가 있으면:
- 조건을 더 좁히고
- 필드 변경 규칙을 분리하고
- 태그 기반 안전장치를 넣습니다.
',
  6,
  10,
  true
);

-- 7. Quiz - Basic
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
) VALUES (
  '7d8d329c-384a-4040-bb88-f9cdb9e0682d',
  'quiz',
  'basic',
  '자가 점검 안내',
  'Quiz Guide',
  '
## ✅ 자가 점검에서 확인할 포인트

- 트리거/조건/동작 3요소를 구분할 수 있는가?
- Dispatch’r / Supervisor / Observer의 역할을 혼동하지 않는가?
- 충돌/루프를 막는 안전장치(태그/예외 조건)를 설계했는가?

퀴즈를 풀고 점수가 낮은 영역이 있으면, 해당 섹션으로 돌아가 규칙을 다시 설계해보세요.
',
  7,
  3,
  true
);

