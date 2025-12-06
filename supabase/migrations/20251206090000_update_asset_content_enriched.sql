-- Freshservice Asset Management (CMDB) Module - Full rewrite with enriched Korean content
-- Module ID: 7a87a6ff-9f2c-4d43-81c9-a7ea08051baf
-- Structure: 6 sections (overview basic/intermediate/advanced, feature-basic, feature-advanced, practice)

BEGIN;

-- Remove existing content for this module to avoid duplicates
DELETE FROM onboarding.module_contents
WHERE module_id = '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf';

-- 1. Overview Basic - "왜 자산 관리(CMDB)인가?"
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
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'overview',
  'basic',
  '왜 자산 관리(CMDB)인가?',
  'Why Asset Management (CMDB)?',
  $$
## 😫 문제 상황 (실제 시나리오)

### 박영희 과장의 엑셀 지옥

- **08:30** 월요일 아침, 노트북 재고 확인을 위해 4개의 엑셀 시트를 열어본다.
- **10:00** 신규 입사자 3명의 장비 요청 메일이 도착하지만, 누가 어떤 장비를 쓰는지 기록이 제각각이라 바로 승인하지 못한다.
- **13:30** 보안팀이 "분실 노트북 암호화 상태"를 묻지만, 담당자 메일함을 40분 뒤져도 최신 정보를 찾지 못한다.
- **17:00** 재무팀이 감가상각 보고서를 요구하지만, 구매일·상태·담당자 데이터가 모두 흩어져 있어 야근을 예감한다.

**결과:** 장비 분실률 8%, 불필요한 중복 구매 12%, 담당자 스트레스 최고조.

---

### ✨ 해결책: CMDB 기반 자산 싱글 소스

| 구분 | 기존 엑셀 | CMDB 도입 후 |
|------|-----------|---------------|
| 정보 위치 | 부서별 스프레드시트 | `Assets` 테이블 단일 뷰 |
| 갱신 방식 | 수동 입력, 제때 반영 어려움 | 에이전트/폼/자동화로 즉시 반영 |
| 책임 추적 | “누가 가져갔지?” 메일 추적 | `Assigned To` 필드 + 히스토리 |
| 감사 대응 | 과거 버전 누락 | 변경 이력 자동 저장 |

CMDB는 **모든 자산·사용자·위치 관계를 한 눈에 보여주는 진짜 "자산 지도"** 역할을 하며, 다음 섹션에서 다룰 CI 관계 학습의 토대가 된다.

---

## 🏠 실생활 비유로 이해하기

### 예시 1: 자동차 등록증 시스템
- 차량마다 **번호판·소유자·보험 상태**가 한 곳에 기록된다.
- 사고가 나면 등록증만 봐도 책임 소재와 연락처를 즉시 확인할 수 있다.
- CMDB의 자산 레코드는 IT 장비의 "등록증" 역할을 한다.

### 예시 2: 도서관 책 대여 카드
- 책마다 고유 바코드가 있어 누가 언제 빌렸는지 남는다.
- 반납 기한이 지나면 알림을 보내고, 분실 시 비용을 청구한다.
- IT 장비도 자산 태그 + 배정 이력을 남기면 분실·연체를 즉시 추적할 수 있다.

---

## 💻 IT에서의 자산 관리 기초

### CMDB가 해결하는 4가지 질문
1. **무엇을 갖고 있나?** (모델, 사양, 보증 만료일)
2. **누가 쓰고 있나?** (사용자, 부서, 위치)
3. **어디에 연결됐나?** (네트워크·애플리케이션 의존성)
4. **언제 바뀌었나?** (배정, 수리, 폐기 이력)

### 핵심 속성 예시
| 속성 | 설명 | 작성 팁 |
|------|------|---------|
| `asset_tag` | 장비 주민등록번호 | 규칙 정의: `IT-LAP-0001` |
| `state` | In Stock/In Use 등 상태 | 워크플로우와 연결 |
| `assigned_to` | 책임 사용자 | Google Workspace 연동 시 자동 매핑 |
| `financials.purchase_date` | 구매일·비용 | 감가상각/보험 증빙용 |

### 빠른 성공 공식
- **30분 투자**로 상위 50대 핵심 장비만 먼저 등록한다.
- 분실·수리·폐기 이벤트가 생길 때마다 CMDB를 **단일 입력 창구**로 사용한다.
- 주간 스탠드업에서 "이번 주 CMDB 업데이트 항목"을 3줄로 공유한다.

---

## 🎯 핵심 기능/패턴

### 1️⃣ 자산 단일 식별자 정책
**실생활 비유:** 주민등록번호가 없으면 병원·은행 업무가 막힌다.
**IT 예시:** `IT-LAP-YYYY-####` 규칙으로 발급하면 보고서 필터, 자동화 조건이 쉬워진다.
**언제 사용?** 신규 장비가 창고에 들어온 순간부터 태그를 붙여야 이후 흐름이 매끄럽다.

### 2️⃣ 라이프사이클 체크포인트
**실생활 비유:** 여권은 발급→사용→만료처럼 단계가 정해져 있다.
**IT 예시:** `In Stock → In Use → In Repair → Retired` 플로우를 Workflow Automator와 연결하면 상태가 자동 전이된다.
**언제 사용?** 장비 이동이 잦은 분기, 대규모 온보딩 기간.

---

## 💡 핵심 정리

### 왜 CMDB인가?
**한 줄 요약:** "어디에 무엇이 있는지"가 보이면 분실·감사·지원 속도가 동시에 개선된다.

**핵심 가치:** 비용 절감(중복 구매 방지) + 보안 강화(분실 추적) + 직원 경험 향상(장비 대기 시간 단축).

**Before vs After**
| 지표 | 이전 (수동 관리) | 이후 (CMDB) | 개선율 |
|------|------------------|-------------|--------|
| 장비 분실률 | 8% | 2% | ▼ 75% |
| 신규 입사자 장비 지급 소요 | 5일 | 1.5일 | ▼ 70% |
| 감사 준비 시간 | 3일 | 4시간 | ▼ 83% |
| 담당자 만족도 (5점) | 2.4 | 4.3 | ▲ 79% |

**다음 섹션 예고:** "CI와 관계" 편에서 **어떤 자산이 어떤 서비스를 지탱하는지** 연결하여 장애 영향도를 계산하는 방법을 다룹니다.
  $$,
  1,
  12,
  true
);

-- 2. Overview Intermediate - "CMDB 핵심 개념: CI와 관계"
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
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'overview',
  'intermediate',
  'CMDB 핵심 개념: CI와 관계',
  'Core CMDB Concepts: CI & Relationships',
  $$
## 😫 문제 상황 (실제 시나리오)

### 서비스 장애 시 "도미노"를 추적하지 못하는 팀

- 금요일 저녁, **CRM 서버 패치** 후 영업팀 티켓이 폭증한다.
- 인프라 팀은 서버만 확인하고 “정상”이라 답하지만, 실제로는 CRM → 통합 API → 회계 시스템까지 연결되어 있었다.
- 관계도를 몰라서 4개 팀이 각자 슬랙 채널에서 따로 대응했고, 복구에 6시간이 걸렸다.

**원인:** 자산은 등록돼 있지만, **무엇이 무엇을 의존하는지** 관계 정보가 없어서 영향 범위를 예측하지 못했다.

---

### ✨ 해결책: CI와 관계를 구조화하기

| 요소 | 설명 | Freshservice 예시 |
|------|------|-------------------|
| **CI (Configuration Item)** | 관리 대상 실체 (HW, SW, 서비스, 사용자) | MacBook, VPN 서비스, AWS RDS |
| **Attribute** | CI를 설명하는 필드 | OS 버전, 소유 팀, 중요도 |
| **Relationship** | CI 간 연결 정보 | `Runs On`, `Depends On`, `Uses` |

CI를 카드로 생각하면, 관계는 카드를 잇는 실선이다. **카드 + 실선**이 모여야 장애 영향도, 변경 승인, 감사 보고가 모두 자동화된다.

---

## 🏠 실생활 비유로 이해하기

### 예시 1: 지하철 노선도
- 역(CI)만 알면 의미가 없다.
- 노선(관계)을 알아야 어디서 갈아타고, 고장 시 어느 구간이 마비되는지 계산된다.

### 예시 2: 가족 족보
- 구성원(CI)과 관계(부모·형제)가 정리돼 있어야 유산 분배, 돌봄 계획을 세울 수 있다.
- IT에서도 서버-애플리케이션-사용자 관계를 알아야 SLA와 보안 정책을 설계할 수 있다.

---

## 💻 CMDB 관계 설계 방법

### 1. CI 유형 정의
- **기반 레이어:** 물리 서버, 네트워크 장비, 클라우드 리소스
- **서비스 레이어:** 애플리케이션, API, 업무 서비스, 비즈니스 프로세스
- **소비자 레이어:** 사용자 그룹, 부서, 외부 파트너

### 2. 관계 타입 매핑
| 타입 | 의미 | 예시 |
|------|------|------|
| `Runs On` | 상위 레이어가 하위 레이어에 탑재 | CRM 앱 → Kubernetes 노드 |
| `Depends On` | 끊기면 상위가 영향 받음 | VPN 서비스 → AD 서버 |
| `Uses` | 기능 사용 | 재무팀 → ERP 앱 |
| `Hosts` | 하드웨어가 소프트웨어를 호스팅 | ESXi → 가상 서버 |

### 3. 관계 그리기 실습
1. **화이트보드 스케치**: 서비스 → 시스템 → 인프라 순으로 그린다.
2. Freshservice에서 **CI 레코드 생성** 후 `Relationships` 탭을 연다.
3. 관계 유형 선택 → 연결 대상 검색 → 화살표 방향 확인 → 저장.
4. `Impact View`를 사용해 시각적으로 검증한다.

---

## 🎯 핵심 기능/패턴

### 1️⃣ 계층형 CI 모델 (Layered CI Model)
**실생활 비유:** 건물 설계도에서 지하주차장-1층 로비-10층 사무실 순.
**IT 예시:** Network → Compute → Application → Business Service.
**언제 사용?** 신규 서비스 론칭, 대규모 마이그레이션 전.

### 2️⃣ 영향 분석 뷰 (Impact View)
**실생활 비유:** 항공편 취소 시 연쇄 지연을 표시하는 공항 모니터.
**IT 예시:** Freshservice `Impact` 그래프에서 노드 클릭 시 영향을 받는 팀/서비스를 확인한다.
**언제 사용?** 변경 승인 CAB 회의, 장애 상황 브리핑.

---

## 💡 핵심 정리

**한 줄 요약:** 자산 그 자체보다 **관계**를 관리해야 장애와 변경 시 진짜 정보를 줄 수 있다.

**Before vs After**
| 항목 | 관계 미정의 | 관계 정의 완료 | 효과 |
|------|-------------|----------------|------|
| 장애 영향 파악 | 담당자에게 전화 돌리기 | Impact View 2클릭 | 대응 속도 65%↑ |
| 변경 승인 | “대충 영향 없을 듯” | 영향 CI 리스트 자동 첨부 | 승인 품질 상승 |
| 감사 질문 | 시스템별 따로 설명 | 관계도 PDF 즉시 제출 | 준비 시간 ▼80% |

**다음 섹션 예고:** "자산 라이프사이클"에서 이 관계 정보를 활용해 **구매→운영→폐기** 전 과정을 추적합니다.
  $$,
  2,
  15,
  true
);

-- 3. Overview Advanced - "자산 라이프사이클 관리"
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
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'overview',
  'advanced',
  '자산 라이프사이클 관리',
  'Asset Lifecycle Management',
  $$
## 😫 문제 상황 (실제 시나리오)

### 장비가 어디서 죽었는지 모르는 IT Ops

- 2024년 말 재무 감사에서 “폐기 완료”로 보고한 노트북 12대가 실제로는 현장 엔지니어 책상에 있었다.
- 임직원 퇴사 시 회수 절차가 표준화되지 않아, 장비 4대가 창고 대신 택배 창구에 방치되었다.
- 유지보수 계약 만료일을 놓쳐 연장 비용이 25% 더 들었다.

**원인:** 자산의 **도입 → 사용 → 유지보수 → 폐기** 단계가 시스템에서 끊어져 있어, 상태 전환을 눈으로 추적해야 했다.

---

### ✨ 해결책: 6단계 라이프사이클 체크포인트

| 단계 | 질문 | Freshservice 실천 |
|------|------|------------------|
| 1. 계획 (Plan) | 무엇을 사야 하나? | 수요 요청 + 예산 승인 워크플로우 |
| 2. 조달 (Procure) | 언제/얼마에 샀나? | PO 번호, 영수증, 벤더 정보 기록 |
| 3. 배정 (Deploy) | 누가 쓰고 있나? | `In Use` 상태 + 사용자 배정 |
| 4. 운영 (Operate) | 잘 작동하나? | 유지보수 티켓, 패치 이력 연결 |
| 5. 회수 (Recover) | 언제 회수되나? | 퇴사 체크리스트 + `In Stock` 전환 |
| 6. 폐기 (Retire) | 어떻게 없앴나? | 폐기 증빙, 데이터 제거 로그 첨부 |

각 단계가 CMDB 상태(State)와 워크플로우로 묶이면, 감사/보안/재무 질문에 데이터로 답할 수 있다.

---

## 🏠 실생활 비유로 이해하기

### 예시 1: 렌터카 회수 프로세스
- 계약서 작성 → 차량 인도 → 주유/정비 → 반납 → 다음 고객 준비 순으로 **상태표**를 업데이트한다.
- 반납 누락 시 자동 알림이 울리고, 손상 여부 체크리스트를 필수로 작성한다.
- IT 자산도 대여-반납의 상태 흐름이 없으면 분실이나 손상이 바로 누락된다.

### 예시 2: 택배 물류 추적
- "집화 → 허브 → 배송" 단계가 실시간으로 찍히니 고객이 현재 위치를 안심하고 확인한다.
- 자산도 상태를 주기적으로 남겨야 “지금 어디에 있나?” 질문을 3초 안에 답할 수 있다.

---

## 💻 라이프사이클 자동화 설계

### 상태와 워크플로우 연결
1. `In Stock` → `In Use`: 자동으로 **배정 서명 이메일** 발송 + 자산 수령 체크리스트 생성.
2. `In Use` → `In Repair`: 수리 티켓 생성, 리턴 ETA 필드 업데이트.
3. `In Repair` → `In Stock`: QC 체크 후 현장 창고 위치 기록.
4. `In Use` → `Retired`: 데이터 삭제 증빙 업로드, 감가상각 정보 확정.

### 감가상각 & 계약 연동
- `financials.purchase_price`, `purchase_date`, `warranty_expiry` 필드를 사용하면 **자동 감가상각 보고서**를 생성할 수 있다.
- 유지보수 계약 만료 30일 전에 Automation Rule로 Slack 알림을 보내면 벌금을 피할 수 있다.

### 감사 대비 팁
- 상태 변경 시 담당자와 시간을 Activity Log에 기록한다.
- 폐기 단계에서는 사진/문서 업로드를 강제하여 증빙을 표준화한다.

---

## 🎯 핵심 기능/패턴

### 1️⃣ 상태 전이 다이어그램
**실생활 비유:** 항공기 라이프사이클(생산→운항→정비→퇴역) 다이어그램을 따르면 정비팀이 일을 놓치지 않는다.
**IT 예시:** Freshservice Workflow Automator에서 `State` 필드를 트리거로 사용해 다음 액션(티켓 생성, 알림, 서명 요청)을 묶는다.
**언제 사용?** 대규모 장비 교체, 보안 감사 시즌.

### 2️⃣ 이벤트 기반 보고서
**실생활 비유:** 차량 검사일이 다가오면 DMV가 자동으로 우편을 보낸다.
**IT 예시:** `Retire Date`가 가까워지는 자산을 필터링해 주간 리포트로 Slack에 공유.
**언제 사용?** 예산 계획, 리스 계약 만료 전.

---

## 💡 핵심 정리

**한 줄 요약:** 상태와 이벤트를 자동화하면 자산의 생애 주기를 숫자로 관리할 수 있다.

**Before vs After**
| 지표 | 수동 | 자동화 | 개선 |
|------|------|--------|------|
| 퇴사자 장비 회수율 | 72% | 98% | ▲ 26%p |
| 유지보수 비용 초과 | 연 3회 | 연 0회 | ▼ 100% |
| 폐기 증빙 준비 시간 | 2일 | 2시간 | ▼ 92% |

**다음 섹션 예고:** 이제 실제 UI에서 자산을 등록/추적하는 방법(Feature Basic)을 다룹니다.
  $$,
  3,
  12,
  true
);

-- 4. Feature Basic - "자산 등록 및 추적"
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
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'feature-basic',
  'basic',
  '자산 등록 및 추적',
  'Registering and Tracking Assets',
  $$
## 😫 문제 상황 (실제 시나리오)

### "누가 이 노트북을 썼는지" 찾느라 20분씩 허비
- 창고에서 노트북을 꺼냈는데, 태그가 없고 사용 이력이 이메일에만 있다.
- 누가 언제 어떤 창고에 반납했는지 기록이 없어, 모든 팀장에게 메시지를 돌려야 한다.
- 분실 신고 시 마지막 배정자를 찾는데 6개월 전 스프레드시트를 열어야 했다.

---

## ✨ Freshservice에서 자산 등록하기

### 1. 수동 등록 (단일 장비)
1. `Assets → New Asset`
2. Asset Type, Name, Asset Tag 입력
3. 필수 속성: Serial Number, Assigned To, Department, Location
4. 첨부: 구매 영수증, 보증서 PDF

**TIP:** Asset Tag 규칙을 `IT-<유형>-<연도>-####`로 잡으면 정렬이 깔끔하다.

### 2. CSV 대량 업로드
1. `Assets → Import → Download sample`
2. CSV에 이름/태그/Serial/User Email/State 입력
3. 미리보기에서 매핑 확인 후 Import
4. 실패 행은 에러 CSV로 추출되어 재업로드 가능

### 3. 서비스 카탈로그 연계
- "노트북 요청" 카탈로그 항목에 **Asset Auto-Assign** 플로우를 붙이면 발급과 동시에 배정이 기록된다.
- 승인 완료 → Workflow Automator가 `In Stock` 자산 중 사용 가능 장비를 자동 선택.

---

## 🏠 실생활 비유

### 예시 1: 우편 등기 조회
- 등기번호(Asset Tag)가 있으면 손쉽게 이력 추적이 가능하다.
- 번호가 없으면 어떤 물건인지 확인할 방법이 없다.

### 예시 2: 도서관 대출증
- 누가 어느 책을 빌렸는지 기록되니, 반납 지연 시 자동 알림을 보낼 수 있다.
- 자산 배정도 같아서, 담당자 필드가 비면 알림/추적이 불가능하다.

---

## 💻 UI 워크스루

```
Assets List → 필터 (In Stock) → 체크박스 다중 선택 → Bulk Update
```

- 컬럼 커스터마이즈: Asset Tag, Assigned To, State, Location, Warranty Expiry를 상단에 배치.
- `Saved Views` 기능으로 "이번 주 반납 예정"(State=In Use, Return Date<=7일)을 만들어두면 재사용 가능.
- `Timeline` 탭에서 상태/담당자 변경이 자동으로 기록되므로, 별도 로그를 남기지 않아도 된다.

### 슬랙/이메일 알림 템플릿
```
[자산 배정 완료]
- 자산: MacBook Pro 14" (IT-LAP-2025-0210)
- 배정 대상: 박민수 / Product 팀
- 회수 예정일: 2026-02-28
→ 자산 페이지 바로가기: https://freshservice.com/a/asset/...
```

---

## 🎯 핵심 기능/패턴

### 1️⃣ Saved View + 필터 조합
**사용처:** 월말 재고 파악, 배정 대기 자산 확인
**설정법:** State, Location, Asset Type 필터 → `Save as View` → 팀과 공유

### 2️⃣ Bulk Update & QR Tagging
**사용처:** 대규모 온보딩/회수
**설정법:** 20대 이상 선택 → `Bulk Update → State/Location 변경` → QR코드 스티커를 Asset Tag와 동일하게 출력

---

## 💡 핵심 정리

| 체크리스트 | 완료 기준 |
|------------|-----------|
| Asset Tag 규칙 수립 | Naming 표준 문서화 |
| 필수 필드 채움 | Name, Tag, Type, Assigned To, State |
| 증빙 첨부 | 영수증/보증서/사진 업로드 |
| Saved View 구성 | 배정 대기, 수리 중 목록 |

**Before vs After**
| 항목 | 수동 관리 | Freshservice 활용 | 효과 |
|------|-----------|-------------------|------|
| 자산 찾는 시간 | 평균 20분 | 2분 | ▼ 90% |
| 중복 구매 | 연 12건 | 연 2건 | ▼ 83% |

**다음 섹션 예고:** 에이전트/네트워크 스캔으로 자산을 자동으로 감지하는 고급 기능을 살펴봅니다.
  $$,
  4,
  10,
  true
);

-- 5. Feature Advanced - "자동 탐지 및 스캔"
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
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'feature-advanced',
  'advanced',
  '자동 탐지 및 스캔',
  'Automated Discovery & Scanning',
  $$
## 😫 문제 상황 (실제 시나리오)

### 유령 자산(Ghost Assets) 때문에 보안 사고 직전
- 보안팀이 분기별 취약점 스캔을 돌렸더니, CMDB에 없는 서버 9대가 발견됐다.
- 노트북에 설치된 상용 소프트웨어가 라이선스 초과로 벌금 통지를 받았다.
- 클라우드 VPC에 떠 있는 테스트 VM 비용이 한 달에 $3,000씩 빠져나갔다.

**공통 원인:** 사람 손으로만 등록하다 보니, 자동 생성·이동하는 자산을 따라잡지 못한다.

---

## ✨ 자동 탐지 전략 3단계

### 1. Discovery Probe/Agent 배포
- `Admin → Tools → Discovery Probes & Agents`
- Windows/Mac/Linux/서버 OS별 에이전트를 설치하면 하드웨어/소프트웨어 목록을 주기적으로 업로드.
- Proxy/방화벽 환경에서는 HTTPS 포트(443)만 열어도 통신 가능.

### 2. 네트워크 스캔
- 사내망 IP 대역을 등록하고 일정(예: 매주 일요일 02시)을 설정.
- SNMP, WMI, SSH 인증 정보를 저장해 스위치/프린터/리눅스 장비까지 식별.
- 스캔 결과는 `Discovered Items` 큐에서 검토 후 자산으로 승격한다.

### 3. 클라우드 연동
- AWS, Azure, Google Cloud 계정을 연결하면 EC2/VM/Database 인스턴스가 자동으로 CI로 들어온다.
- Tag 기반으로 서비스/부서 매핑을 자동화할 수 있다.

---

## 🏠 실생활 비유

### 예시 1: 스마트 전력계
- 전력 사용량을 자동으로 측정해 누수나 비정상 패턴을 즉시 알려준다.
- IT에서도 자동 탐지가 없으면 누가 전기를 훔쳐 쓰는지 모르는 것과 같다.

### 예시 2: 공항 입출국 자동심사
- 여권을 스캔하면 자동으로 방문 기록이 남는다.
- 자산도 네트워크에 "입국"하면 자동 등록되어야 불법 체류(?) 장비를 막을 수 있다.

---

## 💻 구현 팁

### Agent 설치 스크립트 예시 (macOS)
```bash
curl -L https://freshservice-agent.pkg -o /tmp/fs-agent.pkg
sudo installer -pkg /tmp/fs-agent.pkg -target /
sudo /Library/Freshservice/fsagent enroll --api-key=$FS_KEY
```

### Auto-approval 룰
1. `Admin → Automation → Discovery Rules`
2. 조건: `Device Type = Laptop` AND `Domain = HQ`
3. 액션: 기존 자산과 Serial Number로 매칭 후 자동 업데이트

### 라이선스 사용량 모니터링
- 에이전트가 수집한 소프트웨어 목록을 `Software Library`와 비교해 초과 설치 여부를 리포트.
- 초과 시 자동으로 ITSM 티켓을 만들고, 사용자에게 알림을 보낸다.

---

## 🎯 핵심 기능/패턴

### 1️⃣ Matching Rules
**목적:** 중복 자산 생성 방지
**구성:** Serial Number → Asset Tag → Hostname 순으로 매칭 우선순위 설정

### 2️⃣ Exception Queue
**목적:** 비정상 항목 빠른 처리
**구성:** `Unclassified Devices` Saved View에서 7일 이상 방치된 장비를 Slack으로 알림

---

## 💡 핵심 정리

| 항목 | 수동 등록 | 자동 탐지 | 효과 |
|------|-----------|-----------|------|
| 신규 장비 반영 속도 | 7일 | 1일 | ▼ 85% |
| 미등록 서버 개수 | 9대 | 0대 | ▼ 100% |
| 라이선스 초과 벌금 | 연 $15K | $0 | ▼ 100% |

**다음 섹션 예고:** 자동 탐지된 데이터를 활용해 "신입사원 IT 자산 배정" 실습을 진행합니다.
  $$,
  5,
  12,
  true
);

-- 6. Practice - "실습: 신입사원 IT 자산 배정"
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
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'practice',
  'basic',
  '실습: 신입사원 IT 자산 배정',
  'Hands-on: Assigning IT Assets to New Hires',
  $$
## 🎯 실습 목표
- 박민수(신입 프로덕트 매니저)에게 **노트북 + 보안 키 + 소프트웨어 라이선스**를 24시간 안에 배정한다.
- CMDB, 워크플로우, 자동 탐지 결과를 모두 활용해 기록을 남긴다.

---

## 1단계: 요구사항 접수 (10분)
1. People 팀이 제출한 "신입 장비 요청" 서비스 요청 티켓을 연다.
2. 요청 양식에서 필요한 자산 유형(노트북, YubiKey, Figma 라이선스)을 확인한다.
3. 티켓 ID와 신입 입사일(예: 2025-12-15)을 기록한다.

**Checkpoint:** 티켓에 `Target Date`를 24시간 후로 설정하고, 담당자를 자신으로 배정한다.

---

## 2단계: 자산 할당 (20분)

### 2-1. 노트북 선택
- `Assets → Saved View: In Stock - Laptop`에서 상태가 In Stock, Warranty 6개월 이상인 장비를 필터링.
- 예: `IT-LAP-2025-0210` 선택 → `Assign` 클릭 → 사용자 `박민수` 지정 → `Expected Return` 2027-12-14 입력.

### 2-2. 보안 키 배정
- Asset Type = Accessory로 필터 → `YBK-2024-0007` 선택 → 동일하게 배정.

### 2-3. 소프트웨어 라이선스
- `Software → Figma` → `Allocated Seats` 확인 → 남는 라이선스가 없으면 Automation Rule이 요청을 생성하도록 트리거.

**Checkpoint:** 각 자산 페이지에 티켓 ID를 `Linked Tickets`로 연결해 추적성을 확보한다.

---

## 3단계: 자동화/검증 (15분)

### 워크플로우 실행
- Workflow Automator에서 "New Hire Asset Handoff" 플로우가 자동으로 발동되어 아래 작업을 수행:
  1. 자산 상태를 `In Use`로 변경
  2. Slack DM으로 인수인계 체크리스트 전송
  3. 보안팀에게 MFA 등록 요청 티켓 생성

### Discovery 확인
- 신입이 장비에 로그인하면 Freshservice Agent가 설치되며, 10분 내에 하드웨어 정보가 CMDB에 업데이트된다.
- `Discovery Queue`에서 새로 감지된 장비가 기존 Asset Tag와 매칭되었는지 확인.

**Checkpoint:** 매칭 실패 시 Serial Number 기준으로 수동 연결.

---

## 4단계: 커뮤니케이션 & 서명 (10분)
- People 팀에 아래 템플릿으로 완료 메시지 전송:
```
안녕하세요, 신입 박민수님 장비 배정 완료했습니다.
- 노트북: IT-LAP-2025-0210 (회수일 2027-12-14)
- 보안 키: YBK-2024-0007
- 소프트웨어: Figma Pro 좌석 1개
필요 시 자산 페이지 링크에서 서명 확인 가능합니다.
```
- Freshservice `Approvals` 탭에서 People Lead 전자서명 수신을 확인한다.

---

## 5단계: 검증 & 리포팅 (15분)
- `Assets` 보고서에서 "이번 주 신입 배정" Saved View를 내보내 CSV로 People 팀 공유.
- Automation Rule이 생성한 `New Hire Asset Audit` 티켓을 닫을 때, 체크박리스(태그 부착, S/N 기록, 에이전트 설치)를 모두 체크한다.

**성과 측정:**
| 지표 | 목표 | 실제 |
|------|------|------|
| 처리 시간 | 24시간 이내 | ? |
| 누락된 자산 | 0개 | ? |
| 서명 완료 | 100% | ? |

---

## ✅ 제출물
1. 노트북/보안 키 Asset 페이지 URL
2. Discovery 매칭 스크린샷 혹은 로그
3. People 팀에게 보낸 완료 메시지 캡처

**성공 기준:** 처리 시간을 24시간 이내로 유지하고, 모든 자산이 CMDB와 Discovery에 일치해야 한다.
  $$,
  6,
  20,
  true
);

COMMIT;
