-- Freshservice Reporting Module - Full rewrite with enriched Korean content
-- Module ID: c732aff3-5522-4b33-b127-eb431de83fa1
-- Structure: 7 sections (overview basic/intermediate/advanced, feature-basic, feature-advanced 1/2, practice)

BEGIN;

DELETE FROM onboarding.module_contents
WHERE module_id = 'c732aff3-5522-4b33-b127-eb431de83fa1';

-- 1. Overview Basic - "왜 리포팅인가?"
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
  'c732aff3-5522-4b33-b127-eb431de83fa1',
  'overview',
  'basic',
  '왜 리포팅인가?',
  'Why Reporting Matters',
  $$
## 😫 문제 상황 (실제 시나리오)

### 경영진의 "숫자로 보여줘" 요구
- 월요일 아침 운영 회의에서 CEO가 "지난주 SLA 위반이 몇 건이었나?"라고 묻지만, 담당자는 5개의 스프레드시트를 뒤지느라 15분 넘게 대답하지 못한다.
- 고객 성공팀은 체감상 만족도가 떨어졌다고 느끼지만, 이를 증명할 데이터가 없어 개선 예산이 승인되지 않는다.
- IT 리더는 팀이 열심히 일했다는 감각은 있지만, 정확히 어떤 영역에서 성과를 냈는지 뒷받침할 근거가 없다.

**결과:** 의사결정이 지연되고, 투자 우선순위가 감에 의존한다.

---

## ✨ 해결책: Freshservice 리포팅으로 단일 지표 체계 구축

| 질문 | 리포트 예시 | 즉시 얻는 답 |
|------|------------|---------------|
| SLA를 지켰나? | SLA Compliance | 위반 건수, 영향받은 고객 |
| 어디가 병목인가? | Ticket Volume Trend | 서비스/카테고리별 급증 구간 |
| 고객은 만족하나? | CSAT Trend | 별점, 코멘트 요약 |

각 리포트는 **동일한 데이터 모델**을 기반으로 하므로, 누구나 같은 숫자를 바라보게 된다.

---

## 🏠 실생활 비유로 이해하기

### 예시 1: 가계부
- 가계부를 쓰면 한 달 뒤 어디에 얼마를 썼는지 숫자로 보인다.
- 리포트는 조직의 가계부로, IT 운영 곳곳의 지출·성과를 투명하게 보여준다.

### 예시 2: 건강 검진표
- 몸 상태를 감으로 알 수 없듯, 혈압·혈당 수치가 있어야 정확히 판단 가능하다.
- IT 운영도 지표(티켓량, 해결 시간, 만족도)가 있어야 진단과 처방이 가능하다.

---

## 💻 Freshservice 리포트 기본 구성
- **데이터 소스:** Tickets, Service Requests, Changes, Assets, Surveys
- **필터:** 기간, 팀, 카테고리, 우선순위 등
- **위젯:** 숫자 카드, 표, 선형/막대 차트, 히트맵
- **공유:** 실시간 URL, PDF/CSV 내보내기, 스케줄 이메일

이 기본 구성을 기억하면, 어떤 질문이 와도 "어떤 소스 + 필터 + 위젯" 조합인지 빠르게 떠올릴 수 있다.

---

## 🎯 핵심 기능/패턴

### 1️⃣ KPI 카드 + 추세 그래프 세트
- **패턴:** 숫자 카드로 현재 상태를 보여주고, 바로 아래 추세 그래프로 흐름을 설명한다.
- **사용처:** 경영진 브리핑, 월간 요약 문서.

### 2️⃣ Drill-down 필터
- **패턴:** 상단에서 전체 수치를 보여주고, 클릭 시 팀/담당자/서비스별 상세를 표시한다.
- **사용처:** 병목 원인 분석, 팀장별 성과 공유.

---

## 💡 핵심 정리

**한 줄 요약:** 리포팅은 IT 운영을 숫자 언어로 번역해 모든 이해관계자를 설득하게 해준다.

**Before vs After**
| 항목 | 보고 체계 부재 | Freshservice 리포팅 | 개선 |
|------|----------------|---------------------|------|
| 회의 준비 시간 | 4시간 | 30분 | ▼ 88% |
| 경영진 추가 질문 | 7건 | 2건 | ▼ 71% |
| 예산 승인율 | 40% | 75% | ▲ 35%p |

**다음 섹션 예고:** 구체적인 리포트 유형과 활용 사례를 살펴봅니다.
  $$,
  1,
  12,
  true
);

-- 2. Overview Intermediate - "리포트 유형과 활용"
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
  'c732aff3-5522-4b33-b127-eb431de83fa1',
  'overview',
  'intermediate',
  '리포트 유형과 활용',
  'Report Types & Use Cases',
  $$
## 😫 문제 상황 (실제 시나리오)

### "리포트가 너무 많아 어떤 걸 써야 할지 모르겠어요"
- 에이전트는 Ticket Report와 Service Request Report 차이를 몰라 잘못된 지표를 팀장에게 전달한다.
- 변경 관리 팀은 Change Report를 쓰지 않아, 주요 변경 후 장애 재발 여부를 확인하지 못한다.
- 자산 팀은 Asset Report 대신 엑셀 피벗을 쓰느라 실시간성이 사라진다.

---

## ✨ 대표 리포트 유형 5가지

| 유형 | 주요 질문 | 추천 위젯 |
|------|-----------|-----------|
| Ticket Report | 티켓 양, SLA, 우선순위 | 선형 그래프 + 스택 막대 |
| Service Request | 카탈로그 요청 흐름 | 퍼널 차트 + SLA 카드 |
| Change Report | 변경 성공률, 리스크 | 캘린더/히트맵 |
| Asset Report | 장비 상태, 위치, 감가 | 표 + 지리 Heatmap |
| Survey/CSAT | 만족도 추세 | 게이지 + 워드클라우드 |

각 유형은 데이터 소스가 다르기 때문에 **올바른 질문에 맞는 리포트**를 선택해야 한다.

---

## 🏠 실생활 비유

### 예시 1: 병원 검사 세트
- 피검사, X-ray, MRI 등 목적이 다르다. 증상에 따라 적절한 검사를 선택해야 한다.
- IT 리포트도 증상(문제)에 맞게 올바른 유형을 선택해야 의미 있는 결과를 얻는다.

### 예시 2: 날씨 앱 레이어
- 강수, 미세먼지, 기온 등 레이어를 켜고 끄며 필요한 정보를 본다.
- 리포트 필터도 레이어처럼 켜고 끄며 상황에 맞는 시각을 제공한다.

---

## 💻 실제 활용 스토리

1. **고객센터 팀장:** Ticket Report에서 `Priority=High` 필터를 적용해 매주 화요일에만 폭증하는 장애를 발견 → 자동화 룰 추가로 분산 처리.
2. **서비스 카탈로그 오너:** Service Request Report의 **Conversion Funnel**로, 승인 단계에서 35%가 이탈하는 사실을 발견 → 양식 단순화.
3. **변경 관리자:** Change Failure Rate 리포트로, 특정 승인자가 없는 변경에서 실패율이 3배 높다는 사실을 확인 → CAB 절차 강화.

---

## 🎯 핵심 기능/패턴

### 1️⃣ 다중 필터 템플릿
- **패턴:** 기간 + 카테고리 + 팀 필터를 템플릿화해서 누구나 동일 조건으로 실행.
- **사용처:** 월간 리뷰, SLA 보고.

### 2️⃣ 크로스탭 (Pivot) 위젯
- **패턴:** 행에 팀/담당자, 열에 지표를 놓아 단숨에 비교.
- **사용처:** 팀 간 생산성 비교, 지역별 SLA.

---

## 💡 핵심 정리

| 유형 | 잘못 사용했을 때 | 올바르게 사용했을 때 |
|------|------------------|-----------------------|
| Ticket | 요청·변경 데이터까지 섞여 혼란 | 장애/지원 지표를 정확히 추적 |
| Service Request | 승인 지연 원인 파악 실패 | 퍼널로 병목 단계 즉시 식별 |
| Change | 변경-장애 인과 분석 불가 | 실패율/리드타임 수치화 |
| Asset | 재고 계산 수동 | 상태·위치 실시간 파악 |
| Survey | 텍스트 코멘트 방치 | 워드클라우드로 키워드 도출 |

**다음 섹션 예고:** AI가 리포트를 어떻게 증폭시키는지, 예측·인사이트 기능을 심화 탐구합니다.
  $$,
  2,
  15,
  true
);

-- 3. Overview Advanced - "예측 분석과 AI 인사이트"
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
  'c732aff3-5522-4b33-b127-eb431de83fa1',
  'overview',
  'advanced',
  '예측 분석과 AI 인사이트',
  'Predictive Analytics & AI Insights',
  $$
## 😫 문제 상황 (실제 시나리오)

- 매달 말이 되면 다음 달 인력 계획을 감으로 세우다 보니, 성수기엔 티켓이 몰려 SLA가 깨지고, 비수기엔 인력이 남는다.
- 반복되는 문제(예: VPN, 프린터)가 언제 튀어나올지 몰라 사전 공지나 문서 업데이트를 늦게 한다.
- 경영진은 "앞으로 어떤 리스크가 올까?"를 묻는데, 과거 데이터 요약만 보여주니 믿음을 주지 못한다.

---

## ✨ Freddy AI Analytics로 얻는 것

| 기능 | 설명 | 활용 |
|------|------|------|
| Trend Prediction | 다음 주/다음 달 티켓 볼륨 예측 | 인력 계획, 휴가 조정 |
| Anomaly Detection | 비정상 급증/급감 감지 | 조기 알람, 휴먼 에스컬레이션 |
| Impact Forecast | 변경 시 예상 영향 서비스 제시 | CAB 의사결정 보조 |
| Workload Balancing | 팀별 작업량 균형 제안 | 자동 재배정, 교육 계획 |

---

## 🏠 실생활 비유

### 예시 1: 날씨 예보
- 내일 비가 오는지 알면 우산을 준비하듯, 다음 주 어떤 티켓이 늘어날지 알면 미리 공지를 준비할 수 있다.

### 예시 2: 건강관리 앱 알림
- 지난 30일의 수면 데이터를 기반으로 다음 주 피로도를 예측해 휴식을 추천한다.
- IT 운영도 과거 티켓 패턴으로 다음 주 리스크를 알람해준다.

---

## 💻 구현 시나리오

### 시나리오 1: VPN 폭증 예측
```
현황: 12월 평균 50건/일 → 1월 예측 120건/일
조치: 임시 인력 2명, 사전 공지, FAQ 개선
결과: 실제 95건/일로 억제, SLA 94% 유지
```

### 시나리오 2: 반복 문제 탐지
```
AI가 월요일 9-10시에만 발생하는 "프린터 연결 불가" 이슈를 탐지
대응: 자동화 스크립트 배포, 자가해결 문서 푸시
효과: 월요일 티켓 35건 → 12건 (66% 감소)
```

### 시나리오 3: 비용 시뮬레이션
- 이메일 서비스 티켓 200건/일, 건당 비용 $12
- AI가 자동화 후보(계정 잠금 해제 120건)를 제안해, 자동화 시 월 $1,440 절감 가능

---

## 🎯 핵심 기능/패턴

### 1️⃣ AI 카드 + 액션 아이템
- **패턴:** 대시보드에서 AI Insight 위젯을 추가해, "예상 증감"과 "추천 액션"을 한 번에 보여준다.
- **사용처:** 주간 운영 회의, 변화관리 브리핑.

### 2️⃣ What-if 분석
- **패턴:** Reporting → Scenario Planning에서 지표를 조정하며 비용/인력 변화를 시뮬레이션.
- **사용처:** 예산 편성, 외주/자동화 타당성 검토.

---

## 💡 핵심 정리

| 항목 | 과거 회고형 리포트 | AI 기반 예측 리포트 |
|------|--------------------|-----------------------|
| 질문 | "지난달 무슨 일이 있었나" | "다음달 무엇이 생길까" |
| 의사결정 | 사후 대응 | 사전 예방 |
| 신뢰도 | 담당자 경험 의존 | 모델과 실데이터로 검증 |

**다음 섹션 예고:** 이제 실제로 리포트를 만드는 화면을 살펴보며, 기본 작성 절차를 익힙니다.
  $$,
  3,
  12,
  true
);

-- 4. Feature Basic - "기본 리포트 작성"
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
  'c732aff3-5522-4b33-b127-eb431de83fa1',
  'feature-basic',
  'basic',
  '기본 리포트 작성',
  'Building Core Reports',
  $$
## 😫 문제 상황 (실제 시나리오)
- 신규 팀 리더가 Analytics 메뉴를 열어봤지만 어디서부터 손대야 할지 몰라 30분 만에 닫아버린다.
- 기존 리포트는 누가 만들었는지 몰라 수정이 두려워, 결국 CSV로 내려받아 엑셀에서 다시 작업한다.

---

## ✨ 10분 완성 기본 리포트 워크플로우

1. **데이터 소스 선택**: `Analytics → Tickets → New Report`
2. **기간/필터 설정**: 최근 30일 + Product Team + Priority High
3. **위젯 추가**
   - KPI 카드: `High Priority Tickets (Count)`
   - 선형 그래프: `Created vs Resolved`
   - 표: `Agent 이름 + 처리 티켓 수`
4. **공유**: 상단 `Share` 클릭 → Public link or 특정 이메일

### UI 워크스루
```
Analytics → Create Report
  ▶️ Filters (기간/팀/서비스)
  ▶️ Widgets (Card/Chart/Table/Heatmap)
  ▶️ Save & Share
```

---

## 🏠 실생활 비유
- **블록 조립 장난감:** 기본 블록(데이터 소스)만 있으면 원하는 모양(리포트)으로 조립할 수 있다.
- **샌드위치 만들기:** 빵(필터) + 토핑(위젯)을 차례로 쌓아야 맛있는 결과물이 된다.

---

## 💻 팁 & 체크리스트

| 단계 | 체크포인트 |
|------|-------------|
| 필터 | 기간, 팀, 서비스, 채널 네 가지는 반드시 지정 |
| 그룹화 | "Created Date → Week"와 같이 묶으면 추세 파악 쉬움 |
| 워크플로우 | `Save as Template`로 재사용 |
| 공유 | `Schedule email`로 팀별 주기적 발송 |

**단축키:** `Shift + Click`으로 여러 위젯을 선택하여 한 번에 복사/붙여넣기.

---

## 🎯 핵심 기능/패턴

### 1️⃣ Before vs After 섹션
- 개선 전후 데이터 두 개를 나란히 배치하면 변화가 한눈에 들어온다.

### 2️⃣ 필터 태그 표시
- 리포트 상단에 "필터 요약" 위젯을 넣어, 보는 사람이 어떤 조건인지 즉시 알게 한다.

---

## 💡 핵심 정리
| 과제 | 해결 방법 |
|------|------------|
| 새 리포트 작성 시 막막함 | 4단계 워크플로우(소스→필터→위젯→공유)로 표준화 |
| 데이터 일관성 | `Save as Template`을 통해 팀 공용 템플릿 유지 |
| 공유 자동화 | 스케줄 이메일/Slack Webhook 연결 |

**다음 섹션 예고:** 고급 사용자용 커스텀 필드 계산, 예약 리포트 설정을 알아봅니다.
  $$,
  4,
  10,
  true
);

-- 5. Feature Advanced - "커스텀 리포트 및 스케줄링"
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
  'c732aff3-5522-4b33-b127-eb431de83fa1',
  'feature-advanced',
  'advanced',
  '커스텀 리포트 및 스케줄링',
  'Custom Reports & Scheduling',
  $$
## 😫 문제 상황 (실제 시나리오)
- 월말마다 데이터를 뽑아 엑셀에서 수식·조건부 서식을 다시 적용하다 보니 3시간씩 소요된다.
- 경영진은 밤 10시에 숫자를 요구하고, 담당자는 노트북을 켜서 PDF를 수동으로 만들어 보낸다.

---

## ✨ 커스텀 계산 + 예약 발송으로 자동화

### 1. 계산 필드(Custom Metric)
```
Resolution SLA Hit % = (Resolved within SLA / Total Resolved) * 100
```
- Analytics → "Add Metric" → Formula 입력
- 숫자 카드나 게이지 위젯으로 표시

### 2. 조건부 강조(Conditional Formatting)
- 표 위젯에서 SLA 위반이 20% 이상이면 빨간색 배경
- 평균 응답 시간이 1시간 이하이면 초록색

### 3. 스케줄링
- Report → Schedule → 매주 월요일 08:00 → 수신자: 경영진, 팀장
- 첨부 형식: PDF + CSV, Slack Webhook 병행 가능

---

## 🏠 실생활 비유
- **구독형 커피 배달:** 매번 주문하지 않아도, 내가 지정한 시간에 자동으로 온다.
- **자동 이체:** 반복되는 작업을 예약해두면 깜빡해도 시스템이 처리한다.

---

## 💻 실무 체크리스트
| 항목 | 설정 값 |
|------|---------|
| 보고 주기 | 주간/월간/분기 선택 |
| 포맷 | PDF(경영진), CSV(분석) 동시 전송 |
| 수신 그룹 | 이메일 + Slack channel + Teams |
| 로그 | "Scheduled Reports" 메뉴에서 성공/실패 확인 |

에러 시 자동 재전송 옵션을 켜 두면 야간에 실패해도 아침에 다시 발송된다.

---

## 🎯 핵심 기능/패턴

### 1️⃣ Dynamic Parameters
- 스케줄된 리포트가 실행될 때 `{{LastWeek}}` 같은 변수를 이용해 자동으로 기간이 바뀐다.

### 2️⃣ Multi-audience Formatting
- 동일 리포트를 두 개의 스케줄로 나눠, 경영진용 PDF(요약)와 팀장용 CSV(세부)를 동시에 발송.

---

## 💡 핵심 정리
- 커스텀 필드로 내 팀 상황에 맞는 KPI를 계산한다.
- 스케줄링으로 "야간 PDF 노예" 일을 시스템에 맡긴다.
- 오류 모니터링까지 해두면 인증/감사 보고도 자동화된다.

**다음 섹션 예고:** 데이터 시각화와 Insight 위젯을 활용해 스토리텔링을 강화합니다.
  $$,
  5,
  12,
  true
);

-- 6. Feature Advanced 2 - "데이터 시각화 및 인사이트"
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
  'c732aff3-5522-4b33-b127-eb431de83fa1',
  'feature-advanced',
  'advanced',
  '데이터 시각화 및 인사이트',
  'Data Visualization & Insights',
  $$
## 😫 문제 상황 (실제 시나리오)
- 숫자 표만 가득한 리포트는 경영진이 2분만에 지루해하며, 핵심 메시지를 놓친다.
- 어떤 서비스가 어느 지역에서 문제인지 시각적으로 드러나지 않아, 회의에서 설명이 길어진다.

---

## ✨ 스토리텔링형 대시보드 구성

1. **히어로 카드**: 이번 달 핵심 KPI 3개를 상단에 배치 (SLA, CSAT, Average Resolution)
2. **스토리 플로우**
   - 섹션 A: 티켓 유형별 추이 (Stacked Area)
   - 섹션 B: 지역/채널 히트맵
   - 섹션 C: AI Insight 카드 (증감 이유, 추천 액션)
3. **결론 영역**: "이번 주 해야 할 일" 체크리스트 위젯

### Insight 위젯 작성법
- 데이터 포인트를 선택 → "Add Insight" → 요약 문장 + 추천 액션 입력
- 예: "프린터 요청이 전월 대비 25% 증가했습니다. 하드웨어 교체 캠페인을 시작하세요."

---

## 🏠 실생활 비유
- **뉴스 그래픽 패키지:** 헤드라인 → 그래프 → 전문가 코멘트 순으로 구성해 메시지를 반복한다.
- **지도 내비게이션:** 지도(히트맵) + 경고(Insight) 조합으로 운전자가 즉시 행동한다.

---

## 💻 고급 위젯 팁

| 위젯 | 활용 |
|------|------|
| Heatmap | 지역/장비별 SLA 위반 집중 구간 파악 |
| Tree Map | 서비스 카테고리 비중을 면적으로 비교 |
| Combo Chart | 목표선(Target line)과 실제 수치 비교 |
| Word Cloud | CSAT 코멘트 상위 키워드 시각화 |

Insight 위젯은 **슬라이드 노트** 역할을 하므로, 회의에서 읽기만 해도 되는 수준으로 메시지를 구체적으로 적는다.

---

## 🎯 핵심 기능/패턴

### 1️⃣ Highlight & Focus
- KPI 카드 클릭 시 관련 그래프가 하이라이트 되도록 `Drill Through` 옵션 설정.

### 2️⃣ Mobile-Friendly Layout
- 컬럼 폭을 2/1/1 비율로 나눠 모바일에서도 스크롤이 자연스럽게 보이도록 구성.

---

## 💡 핵심 정리
- 시각화는 숫자를 기억에 남게 하는 **스토리텔링 도구**다.
- Insight 위젯을 곁들이면 "그래서 무엇을 해야 하나?" 질문을 선제적으로 답한다.

**다음 섹션 예고:** 이제 실제 월간 IT 운영 리포트를 만들어 제출해봅니다.
  $$,
  6,
  12,
  true
);

-- 7. Practice - "실습: 월간 IT 운영 리포트"
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
  'c732aff3-5522-4b33-b127-eb431de83fa1',
  'practice',
  'basic',
  '실습: 월간 IT 운영 리포트',
  'Hands-on: Monthly IT Operations Report',
  $$
## 🎯 실습 목표
- 30분 안에 "월간 IT 운영 리포트" 대시보드를 만들어 경영진에게 공유한다.
- 필수 지표 5개와 추천 액션 3개를 포함해야 한다.

---

## 1단계: 준비 (5분)
1. Analytics → `Create Report`
2. 기간: 지난달 1일부터 말일까지
3. 필터: Product Team + Priority(High+Medium)

체크리스트:
- [ ] 팀/서비스/우선순위 필터 적용
- [ ] 공유 받을 경영진 이메일 수집

---

## 2단계: KPI 영역 구성 (10분)
| KPI | 위젯 | 설명 |
|-----|------|------|
| 총 티켓수 | Number card | 전월 대비 증감% 표시 |
| SLA 준수율 | Gauge | 목표 92% 라인 표기 |
| CSAT | Number + Trend | 평균 점수 + 변화 |
| 평균 해결 시간 | Combo chart | 목표선 비교 |
| 자동화 커버리지 | Formula card | (자동 처리 티켓/전체) × 100 |

---

## 3단계: 인사이트 영역 (10분)
### A. 트렌드 분석
- 선형 그래프: 카테고리별 티켓 증가/감소
- 히트맵: 요일·시간대별 SLA 위반

### B. Insight 카드 작성
1. 그래프 데이터 포인트 클릭 → `Add Insight`
2. 문장 구조: "[지표]가 [기간] 대비 [수치] 변했습니다. → (이유/추천)"
3. 최소 3개 카드 작성 (예: VPN 관련 티켓 35% 증가 → FAQ 업데이트 필요)

---

## 4단계: 공유 & 피드백 (5분)
- `Share → Schedule Email`로 매달 1일 09:00 자동 발송 설정
- Slack `#exec-ops` 채널에 링크와 핵심 요약 3줄 포스팅
- 경영진 피드백을 티켓 댓글에 기록해 다음 달 리포트 개선

---

## ✅ 제출물
1. 리포트 URL
2. Insight 카드 스크린샷
3. Slack 공유 메시지 캡처

**평가 기준:**
- KPI 5개 이상, Insight 3개 이상 포함 여부
- 추천 액션이 구체적인지
- 공유 자동화 설정 여부
  $$,
  7,
  20,
  true
);

COMMIT;
