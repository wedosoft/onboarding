-- Update Freshservice Automation Module with enriched, beginner-friendly content
-- Module ID: d84102b8-c3a1-49de-878d-d03be03e1388

-- Delete existing content
DELETE FROM onboarding.module_contents
WHERE module_id = 'd84102b8-c3a1-49de-878d-d03be03e1388';

-- 1. Overview - Basic (Enriched)
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'overview',
  'basic',
  '왜 자동화 워크플로우인가?',
  'Why Automation Workflows?',
  '
## 😫 IT 담당자의 반복되는 하루

### 매일 아침, 김철수 과장의 하루

김철수 과장은 IT 지원팀에서 일합니다. 매일 아침 출근하면 이런 일이 반복됩니다:

**오전 9시**: 이메일 확인
- "비밀번호 재설정 요청" 40개
- "노트북 고장" 5개
- "프린터 안 됨" 8개

**오전 9시 30분~11시**: 각 요청마다 수동 처리
1. Freshservice에 티켓 생성 (1건 당 53초 = 53분)
2. 담당자 수동 배정 (30건 × 53초 = 26분)
3. 이메일 회신 작성 (20건 × 53초 = 18분)
4. 티켓 상태 업데이트 및 마감 (1건 당 53초 = 53분)

**소요 시간:** 약 2.5시간
**오류 발생:** 평균 5건 (이메일 주소 오타, 티켓 중복 생성, 담당자 잘못 배정)
**김철수의 기분:** 😫 "매일 똑같은 일만 하네..."

---

### ✨ 자동화가 김철수를 구합니다

같은 작업을 **자동화**하면 이렇게 바뀝니다:

```
[이메일 수신]
    ↓ (자동 - 1초)
[Freshservice 티켓 자동 생성]
    ↓ (자동 - 1초)
[이메일 내용 분석해서 담당자 자동 배정]
    ↓ (자동 - 1초)
[고객에게 자동 회신 발송]
    ↓ (자동 - 1초)
[티켓 상태 자동 업데이트 및 완료]
    ↓ (자동 - 1초)
[완료!]
```

**소요 시간:** 5분 (53건 전체 자동 처리)
**김철수가 할 일:** 모니터링만 (5분)
**오류 발생:** 거의 0건 (시스템이 정확하게 처리)

**김철수는 이제 2.5시간을 다른 중요한 일에 쓸 수 있습니다!**

---

## 🏠 실생활 비유로 이해하기

자동화 워크플로우는 우리가 일상에서 이미 사용하는 **자동화 기술**과 똑같습니다.

### 예시 1: 현관 자동문

**수동 방식:**
- 사람이 문 앞에 서기 → 손으로 문 밀기 → 문 열림

**자동화:**
- 사람이 문 앞에 서기 (👈 **이벤트**)
- → 센서가 감지
- → 자동으로 문 열림 (👈 **액션**)

### 예시 2: 스마트 온도 조절기

**수동 방식:**
- 집에 들어옴 → 온도계 확인 → 손으로 난방 온도 조절

**자동화:**
- 집에 사람 들어옴 (👈 **이벤트**)
- → 온도가 18도 이하면 (👈 **조건**)
- → 자동으로 난방 22도로 설정 (👈 **액션**)

---

## 💻 IT에서의 자동화 워크플로우

Freshservice에서도 똑같은 원리입니다:

**이벤트 (Event):** "~이 발생하면"
- 티켓 생성됨
- 티켓 우선순위 변경됨
- 댓글 추가됨

**조건 (Condition):** "~이고 / ~이면" (선택사항)
- 우선순위가 "긴급"이면
- 요청자가 "임원"이면
- 키워드에 "비밀번호"가 포함되면

**액션 (Action):** "~을 자동으로 해줘"
- IT팀에 자동 배정
- 관리자에게 이메일 발송
- 우선순위 자동 상향

---

## 🎯 Freshservice 자동화 3가지 방법

자동화는 **복잡도**에 따라 3단계로 나뉩니다.

### 1️⃣ Workflow Automator (기본 자동화)

**개념:** "~하면 자동으로 ~해줘" (조건 없음)

**실생활 비유:**
- 현관문 열리면 → 자동으로 불 켜짐
- 세탁기 끝나면 → 자동으로 알림음

**IT 예시:**
```
티켓 생성되면 (이벤트)
  → 자동으로 IT팀에 배정 (액션)
```

**언제 사용하나요?**
- ✅ 조건 없이 **항상** 실행해야 할 때
- ✅ 간단한 반복 작업
- ✅ 예: 모든 티켓을 IT팀에 배정

---

### 2️⃣ Business Rule (조건부 자동화)

**개념:** "~이고 ~이면 자동으로 ~해줘" (IF-THEN)

**실생활 비유:**
- 집에 들어왔는데 + 밤 9시 이후라면 → 현관등만 켜짐
- 세탁기 끝났는데 + 집에 사람 없으면 → 알림 발송 안 함

**IT 예시:**
```
티켓 생성되고 (이벤트)
  + 우선순위가 "긴급"이면 (조건)
  → 관리자에게 SMS 발송 (액션)
```

**언제 사용하나요?**
- ✅ 복잡한 조건 필요
- ✅ 예외 처리 필요
- ✅ 예: 긴급 티켓만 관리자에게 알림

**Workflow Automator와의 차이:**
| 구분 | Workflow Automator | Business Rule |
|------|-------------------|---------------|
| 조건 | 간단 (1-2개) | 복잡 (5-10개) |
| 분기 | 없음 | IF-ELSE 가능 |
| 예시 | 무조건 IT팀 배정 | 긴급이면 관리자, 아니면 일반팀 |

---

### 3️⃣ Orchestration (시스템 간 자동화)

**개념:** "다른 시스템도 같이 자동으로 처리해줘"

**실생활 비유:**
- 출근하면 → 집 난방 OFF + 사무실 에어컨 ON + 차량 시동

**IT 예시:**
```
신입사원 입사 티켓 생성 (이벤트)
  → Freshservice에서 티켓 처리
  + Active Directory에서 계정 생성
  + Microsoft 365 라이선스 할당
  + Slack 계정 생성
  + GitHub 접근 권한 부여
```

**언제 사용하나요?**
- ✅ 여러 시스템 연동 필요
- ✅ 외부 API 호출 필요
- ✅ 복잡한 비즈니스 프로세스

---

## 🤔 실제 선택 기준

| 상황 | 추천 방법 | 이유 |
|------|----------|------|
| 모든 티켓을 IT팀에 배정 | Workflow Automator | 조건 없음 |
| 긴급 티켓만 관리자에게 | Business Rule | 조건 필요 |
| 신입사원 계정 자동 생성 | Orchestration | 외부 시스템 필요 |

---

## 💡 핵심 정리

1. **자동화 = 사람이 안 해도 시스템이 알아서 처리**
2. **3가지 방법:**
   - Workflow Automator (기본): "~하면 자동으로"
   - Business Rule (조건부): "~이고 / ~이면"
   - Orchestration (연동): "다른 시스템도 같이"
3. **효과: 시간 90% 절감, 오류 0%**
4. **시작: 가장 단순한 것부터 (Workflow Automator)**

**다음 섹션에서 고급 워크플로우 패턴을 배워봅시다!**
',
  1,
  12,
  true
);

-- 2. Overview - Intermediate (Enriched)
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'overview',
  'intermediate',
  '고급 워크플로우 패턴',
  'Advanced Workflow Patterns',
  '
## 📈 기본을 넘어서: 더 똑똑한 자동화

### 복습: 기본 자동화의 한계

지난 섹션에서 배운 **기본 자동화**:
```
티켓 생성 → IT팀 자동 배정
```

**문제상황:**
- 🤔 모든 티켓이 IT팀으로만 가면 어떻게 되나요?
- 비밀번호 재설정 → IT팀
- 노트북 구매 요청 → IT팀 (❌ 구매팀이 맞음!)
- 회의실 예약 → IT팀 (❌ 총무팀이 맞음!)

**결과:**
- IT팀이 "이건 우리 일 아닌데..." 하며 수동으로 재배정
- 자동화했는데도 **수동 작업 발생!**

---

### ✨ 해결책: 조건부 분기

**고급 워크플로우**는 "상황에 따라 다르게" 처리합니다:

```
티켓 생성
  ↓
제목에 "비밀번호"? → YES → IT팀
  ↓ NO
제목에 "구매"? → YES → 구매팀
  ↓ NO
제목에 "회의실"? → YES → 총무팀
  ↓ NO
기본 → IT팀 (일단 IT팀이 받아서 분류)
```

---

## 🎯 고급 패턴 1: 다단계 조건부 배정

### 실생활 비유: 병원 접수

**기본 병원 (비효율):**
- 모든 환자 → 내과로만 안내
- 내과 의사가 "정형외과 가세요" 재안내

**고급 병원 (효율):**
```
환자 접수
  ↓
어디가 아프세요?
  - 배? → 내과
  - 팔/다리? → 정형외과
  - 눈? → 안과
  - 치아? → 치과
```

### IT 예시: 스마트 티켓 라우팅

```sql
IF 제목 contains "비밀번호" OR "계정" OR "로그인"
  → IT 보안팀

ELSE IF 제목 contains "노트북" OR "모니터" OR "마우스"
  → IT 하드웨어팀

ELSE IF 제목 contains "Salesforce" OR "Freshworks" OR "Slack"
  → IT 애플리케이션팀

ELSE IF 우선순위 = "긴급"
  → IT 매니저 (직접 처리)

ELSE
  → IT 일반팀 (분류 대기)
```

**효과:**
- 정확도: 75% → 95%
- 재배정률: 30% → 5%
- 처리 속도: 2시간 → 15분

---

## 🎯 고급 패턴 2: SLA 기반 자동 에스컬레이션

### 문제 상황: 방치된 티켓

**현실:**
- 티켓 생성 → IT팀 배정 → **3일째 아무 반응 없음**
- 고객: 😡 "언제 처리되나요?"

### 해결책: 시간 기반 자동 에스컬레이션

**실생활 비유: 택배 추적**
```
택배 발송
  ↓
24시간 내 배송 중? → YES → 정상
  ↓ NO
자동 알림 → 고객센터 + 배송팀 매니저
  ↓
48시간 내 배송 완료? → YES → 해결
  ↓ NO
자동 에스컬레이션 → 본부장 + 환불 처리
```

### IT 예시: SLA 위반 방지 자동화

```
티켓 생성 (우선순위: 긴급)
  ↓
1시간 후: 아직 "신규" 상태?
  → 담당자에게 SMS 알림
  ↓
2시간 후: 아직 "진행 중" 아님?
  → 팀 매니저에게 이메일 + 우선순위 상향
  ↓
4시간 후: 아직 "해결" 안 됨?
  → IT 디렉터에게 에스컬레이션 + 대체 담당자 자동 배정
```

**Freshservice 설정:**
| 시간 | 조건 | 액션 |
|------|------|------|
| +1시간 | 상태 = "신규" | 담당자 SMS |
| +2시간 | 상태 ≠ "진행 중" | 매니저 이메일 + 우선순위 "긴급" |
| +4시간 | 상태 ≠ "해결됨" | 디렉터 알림 + 재배정 |

**효과:**
- SLA 위반률: 40% → 5%
- 평균 해결 시간: 2일 → 4시간

---

## 🎯 고급 패턴 3: 승인 워크플로우

### 문제 상황: 무분별한 요청

**현실:**
```
직원: "노트북 500만원짜리로 주세요!"
  → IT팀이 그냥 구매
  → 재무팀: 😡 "예산 초과!"
```

### 해결책: 금액별 승인 단계

**실생활 비유: 회사 지출 결재**
```
5만원 미만 → 팀장 승인만
5만원 이상 → 팀장 + 부서장 승인
50만원 이상 → 팀장 + 부서장 + 재무팀 승인
```

### IT 예시: 노트북 구매 승인

```
노트북 구매 요청
  ↓
금액이 100만원 미만?
  → YES → 팀장 승인 → 즉시 구매
  ↓ NO
금액이 300만원 미만?
  → YES → 팀장 + IT 매니저 승인 → 구매
  ↓ NO
금액이 300만원 이상?
  → 팀장 + IT 매니저 + CFO 승인 필요
  ↓
모든 승인 완료?
  → YES → 자동 구매 발주
  ↓ NO (1명이라도 거부)
  → 자동 거부 + 요청자에게 이메일 발송
```

**Freshservice 구현:**
1. 티켓 생성 (제목: "노트북 구매")
2. 커스텀 필드: "예상 금액" 입력
3. **워크플로우 자동 시작:**
   ```
   IF 예상 금액 < 100만원
     → Approver: 팀장

   ELSE IF 예상 금액 < 300만원
     → Approver: 팀장, IT 매니저 (순차)

   ELSE
     → Approver: 팀장, IT 매니저, CFO (순차)
   ```
4. **모든 승인자가 승인하면:**
   → 자동으로 구매팀에 티켓 전달 + 이메일 발송

**효과:**
- 무분별한 지출: 30건/월 → 0건/월
- 예산 초과: 20% → 0%
- 승인 소요 시간: 3일 → 4시간

---

## 🎯 고급 패턴 4: 체인 워크플로우 (연속 자동화)

### 개념: 도미노처럼 이어지는 자동화

**실생활 비유: 아침 루틴 자동화**
```
알람 울림 (6:30)
  ↓ (자동)
커튼 자동 열림 + 조명 켜짐
  ↓ (5분 후 자동)
커피머신 작동 시작
  ↓ (10분 후 자동)
샤워실 온수 예열
  ↓ (30분 후 자동)
자동차 시동 + 히터 작동
```

### IT 예시: 신입사원 온보딩 체인

```
[트리거] 신입사원 입사 티켓 생성
  ↓
[워크플로우 1] Active Directory 계정 생성
  → 완료되면 자동으로 워크플로우 2 시작
  ↓
[워크플로우 2] Microsoft 365 라이선스 할당
  → 완료되면 자동으로 워크플로우 3 시작
  ↓
[워크플로우 3] 이메일 계정 생성 + 임시 비밀번호 발송
  → 완료되면 자동으로 워크플로우 4 시작
  ↓
[워크플로우 4] Slack 계정 생성 + 팀 채널 초대
  → 완료되면 자동으로 워크플로우 5 시작
  ↓
[워크플로우 5] 온보딩 체크리스트 티켓 생성 + 멘토 배정
  ↓
[완료] 신입사원에게 "환영합니다!" 이메일 자동 발송
```

**수동 vs 자동:**
| 구분 | 수동 | 자동 (체인) |
|------|------|------------|
| 소요 시간 | 3일 | 30분 |
| 누락 가능성 | 30% | 0% |
| 담당자 개입 | 5번 | 0번 |

---

## 🎯 고급 패턴 5: Parent-Child 티켓 (작업 분해)

### 문제 상황: 복잡한 프로젝트

**요청:**
"신규 사무실 IT 인프라 구축" (20일 소요)

**수동 방식:**
- 하나의 거대한 티켓 → 진행 상황 파악 불가
- 누가 뭘 하는지 모름

### 해결책: 자동으로 하위 작업 분해

**실생활 비유: 집 짓기**
```
[부모] 집 짓기 (6개월)
  ├─ [자식] 설계 (1개월)
  ├─ [자식] 기초 공사 (1개월)
  ├─ [자식] 골조 공사 (2개월)
  ├─ [자식] 내부 인테리어 (1개월)
  └─ [자식] 마감 공사 (1개월)
```

### IT 예시: 자동 작업 분해

```
[부모 티켓] "신규 사무실 IT 인프라 구축"
  ↓ (워크플로우 자동 생성)
[자식 1] 네트워크 케이블링 (담당: 네트워크팀, 기한: 5일)
[자식 2] Wi-Fi AP 설치 (담당: 네트워크팀, 기한: 3일)
[자식 3] 서버실 구축 (담당: 인프라팀, 기한: 7일)
[자식 4] PC 50대 설치 (담당: 하드웨어팀, 기한: 5일)
[자식 5] 전화기 설치 (담당: 통신팀, 기한: 3일)

**자동 추적:**
- 모든 자식 티켓 완료 → 부모 티켓 자동 완료
- 하나라도 지연 → 부모 티켓에 자동 알림
```

**Freshservice 구현:**
1. 부모 티켓 생성: "신규 사무실 IT 인프라 구축"
2. **워크플로우 자동 실행:**
   ```
   IF 티켓 제목 contains "신규 사무실"
     → 자동으로 5개 자식 티켓 생성
     → 각 자식 티켓에 담당팀/기한 자동 배정
     → 부모 티켓과 링크 연결
   ```
3. **진행 상황 자동 추적:**
   - 자식 티켓 1개 완료 → 부모 티켓 진행률 20%로 업데이트
   - 모든 자식 티켓 완료 → 부모 티켓 자동 완료

**효과:**
- 프로젝트 가시성: 불투명 → 100% 투명
- 진행률 추적: 수동 → 자동 실시간
- 병목 구간 파악: 어려움 → 즉시 파악

---

## 💡 핵심 정리

### 5가지 고급 패턴

| 패턴 | 언제 사용? | 효과 |
|------|----------|------|
| **조건부 분기** | 상황별 다른 처리 필요 | 정확도 95% |
| **SLA 에스컬레이션** | 처리 지연 방지 | SLA 위반 -35% |
| **승인 워크플로우** | 권한/예산 통제 필요 | 무분별한 지출 0% |
| **체인 워크플로우** | 연속 작업 자동화 | 소요 시간 -90% |
| **Parent-Child** | 복잡한 프로젝트 분해 | 가시성 100% |

### 선택 기준

```
1. "상황에 따라 다르게" → 조건부 분기
2. "방치 방지" → SLA 에스컬레이션
3. "승인 필요" → 승인 워크플로우
4. "연속 작업" → 체인 워크플로우
5. "큰 프로젝트" → Parent-Child
```

**다음 섹션에서 복합 자동화 시나리오를 배워봅시다!**
',
  2,
  15,
  true
);

-- 3. Overview - Advanced (Enriched)
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'overview',
  'advanced',
  '복합 자동화 시나리오',
  'Complex Automation Scenarios',
  '
## 🎯 실전: 여러 패턴을 조합하기

### 지금까지 배운 것

1. **기본 자동화**: 티켓 생성 → 자동 배정
2. **고급 패턴 5가지**:
   - 조건부 분기
   - SLA 에스컬레이션
   - 승인 워크플로우
   - 체인 워크플로우
   - Parent-Child 티켓

**이제는?**
→ 이 패턴들을 **조합**해서 실제 복잡한 문제를 해결!

---

## 📱 실전 시나리오 1: "노트북 구매 승인 자동화"

### 문제 상황

**현재 프로세스 (수동):**
```
직원: "노트북 구매 요청" 제출
  ↓ (1일 대기)
IT팀: 티켓 확인 → 가격 조사
  ↓ (2일 대기)
팀장: 이메일로 승인 요청 받음 → 승인
  ↓ (1일 대기)
IT매니저: 이메일로 승인 요청 받음 → 승인
  ↓ (3일 대기)
구매팀: 발주
  ↓
**총 소요 시간: 7일**
**오류 발생: 30%** (승인 누락, 이메일 미확인)
```

---

### 해결책: 복합 자동화

**사용할 패턴 조합:**
1. ✅ **조건부 분기** (금액별 다른 처리)
2. ✅ **승인 워크플로우** (자동 승인 라우팅)
3. ✅ **SLA 에스컬레이션** (승인 지연 방지)
4. ✅ **체인 워크플로우** (승인 후 자동 발주)

---

### 자동화 설계

**Step 1: 티켓 생성 + 자동 분석**
```
직원: 티켓 생성 "노트북 구매 요청"
  + 커스텀 필드 입력:
    - 예상 금액: 150만원
    - 사유: "개발용"
    - 긴급도: "보통"
  ↓ (자동 - 1초)

[워크플로우 자동 시작]
  → 금액 확인: 150만원
  → 조건부 분기 판단...
```

**Step 2: 조건부 분기 (금액별 승인자 자동 결정)**
```
IF 금액 < 100만원
  → 승인자: 팀장만
ELSE IF 금액 < 300만원
  → 승인자: 팀장 + IT매니저
ELSE
  → 승인자: 팀장 + IT매니저 + CFO

150만원이므로:
  → 승인자: 팀장 + IT매니저 (순차 승인)
```

**Step 3: 승인 워크플로우 자동 실행**
```
[승인 1단계] 팀장에게 알림
  → 이메일 + SMS 자동 발송
  → "노트북 구매 승인 요청 (150만원)"
  ↓
팀장이 승인 버튼 클릭 (또는 이메일에서 직접 승인)
  ↓ (자동 - 1초)

[승인 2단계] IT매니저에게 알림
  → 이메일 + SMS 자동 발송
  ↓
IT매니저가 승인 버튼 클릭
  ↓ (자동 - 1초)

모든 승인 완료!
```

**Step 4: SLA 에스컬레이션 (승인 지연 방지)**
```
각 승인 단계마다:

4시간 후: 승인 안 됨?
  → 승인자에게 SMS 리마인더
  ↓
8시간 후: 여전히 승인 안 됨?
  → 다음 상위 관리자에게 자동 에스컬레이션
  → 원래 승인자는 스킵
  ↓
결과: 승인 누락 방지!
```

**Step 5: 체인 워크플로우 (승인 후 자동 처리)**
```
모든 승인 완료
  ↓ (자동 - 1초)
[워크플로우 2 자동 시작]
  → 구매팀에 티켓 자동 생성
  → 제목: "[승인완료] 노트북 구매 발주"
  → 담당자: 구매팀 자동 배정
  → 원본 티켓 링크 첨부
  ↓ (자동 - 1초)
구매팀에 이메일 자동 발송
  → "새로운 구매 발주 요청이 있습니다"
  ↓ (자동 - 1초)
요청자에게 이메일 발송
  → "귀하의 노트북 구매 요청이 승인되었습니다. 구매팀에서 진행 중입니다."
```

---

### 효과 비교

| 구분 | 수동 (기존) | 자동화 (개선) |
|------|-----------|--------------|
| **소요 시간** | 7일 | 4시간 |
| **오류 발생률** | 30% | 0% |
| **IT팀 개입** | 5번 | 0번 (모니터링만) |
| **승인 누락** | 자주 | 없음 (에스컬레이션) |
| **요청자 만족도** | 😡 | 😊 |

---

## 🏢 실전 시나리오 2: "신입사원 온보딩 자동화"

### 문제 상황

**현재 프로세스 (수동, 3일 소요):**
```
Day 1:
- HR팀: AD 계정 생성 요청 티켓 생성
- IT팀: 수동으로 AD 계정 생성
- IT팀: 이메일 계정 생성
- IT팀: 임시 비밀번호 수동 발송

Day 2:
- IT팀: Microsoft 365 라이선스 수동 할당
- IT팀: Slack 계정 수동 생성
- IT팀: 팀 채널에 수동 초대

Day 3:
- IT팀: 멘토 수동 배정
- HR팀: 온보딩 체크리스트 수동 작성

누락 가능성: 40%
```

---

### 해결책: 복합 자동화

**사용할 패턴 조합:**
1. ✅ **체인 워크플로우** (단계별 순차 자동 실행)
2. ✅ **Parent-Child 티켓** (전체 진행 상황 추적)
3. ✅ **Orchestration** (외부 시스템 연동)
4. ✅ **SLA 에스컬레이션** (각 단계 지연 방지)

---

### 자동화 설계

**Step 1: Parent 티켓 생성 + 자동 분해**
```
HR팀: "신입사원 온보딩 - 홍길동" 티켓 생성
  + 입력 정보:
    - 이름: 홍길동
    - 이메일: hong@company.com
    - 부서: 개발팀
    - 입사일: 2025-12-15
  ↓ (자동 - 1초)

[워크플로우 자동 시작]
  → Parent 티켓 생성: "신입사원 온보딩 - 홍길동"
  → 자동으로 5개 Child 티켓 생성:
    1. [자식] AD 계정 생성 (담당: IT 인프라팀, 기한: 1시간)
    2. [자식] 이메일 + M365 설정 (담당: IT 클라우드팀, 기한: 2시간)
    3. [자식] Slack 계정 생성 (담당: IT 협업툴팀, 기한: 1시간)
    4. [자식] 노트북 + 장비 준비 (담당: IT 하드웨어팀, 기한: 1일)
    5. [자식] 멘토 배정 (담당: HR팀, 기한: 2시간)
```

**Step 2: 체인 워크플로우 (순차 자동 실행)**
```
[자식 1 시작] AD 계정 생성
  → Orchestration: Active Directory API 호출
  → 계정 "hong" 자동 생성
  → 비밀번호 "TempPass123!" 자동 생성
  ↓ 완료 (5분)

[자식 1 완료 → 자식 2 자동 시작]
  → Orchestration: Microsoft Graph API 호출
  → 이메일 계정 생성
  → Microsoft 365 라이선스 "E3" 자동 할당
  → 자동 이메일 발송: "홍길동님, 환영합니다! 임시 비밀번호는 TempPass123! 입니다"
  ↓ 완료 (10분)

[자식 2 완료 → 자식 3 자동 시작]
  → Orchestration: Slack API 호출
  → Slack 계정 생성
  → 자동으로 채널 초대: #general, #dev-team, #welcome
  → Slack DM 자동 발송: "안녕하세요 홍길동님! Freshworks에 오신 것을 환영합니다!"
  ↓ 완료 (5분)

[자식 3 완료 → 자식 4, 5 병렬 시작]
  → [자식 4] IT 하드웨어팀에 노트북 준비 티켓 자동 생성
  → [자식 5] HR팀에 멘토 배정 티켓 자동 생성
```

**Step 3: Parent 티켓 자동 진행률 업데이트**
```
[부모 티켓] "신입사원 온보딩 - 홍길동"

진행 상황 자동 업데이트:
  - 자식 1 완료 → 진행률 20%
  - 자식 2 완료 → 진행률 40%
  - 자식 3 완료 → 진행률 60%
  - 자식 4 완료 → 진행률 80%
  - 자식 5 완료 → 진행률 100% (부모 티켓 자동 완료)
```

**Step 4: SLA 에스컬레이션 (각 단계마다)**
```
각 자식 티켓마다 SLA 설정:

예: [자식 1] AD 계정 생성 (기한: 1시간)
  ↓
30분 경과: 아직 "신규"?
  → 담당자에게 SMS 알림
  ↓
1시간 경과: 아직 "완료" 안 됨?
  → IT 매니저에게 에스컬레이션
  → 대체 담당자 자동 배정
```

---

### 효과 비교

| 구분 | 수동 (기존) | 자동화 (개선) |
|------|-----------|--------------|
| **소요 시간** | 3일 | 30분 |
| **누락 가능성** | 40% | 0% |
| **IT팀 개입** | 15번 | 1번 (모니터링만) |
| **진행 상황 가시성** | 불투명 | 실시간 추적 |
| **신입사원 경험** | 😕 "계정이 왜 안 와?" | 😊 "와, 빠르네!" |

---

## 🔥 실전 시나리오 3: "긴급 장애 대응 자동화"

### 문제 상황

**새벽 3시, 서버 다운!**
```
서버 모니터링 시스템: 🚨 "DB 서버 다운!"
  ↓ (수동)
담당자: 💤 (자는 중, 알람 못 들음)
  ↓ (30분 경과)
고객: 😡 "서비스가 안 돼요!"
  ↓ (1시간 경과)
매니저가 발견: "왜 아무도 안 봐?"
  ↓ (2시간 경과)
담당자 깨어남: "아 미안, 못 봤어요..."
  ↓
**총 피해: 2시간 서비스 중단, 고객 이탈**
```

---

### 해결책: 긴급 대응 자동화

**사용할 패턴 조합:**
1. ✅ **조건부 분기** (장애 유형별 다른 대응)
2. ✅ **SLA 에스컬레이션** (다단계 알림)
3. ✅ **체인 워크플로우** (자동 복구 시도)
4. ✅ **Parent-Child** (관련 티켓 자동 생성)

---

### 자동화 설계

**Step 1: 장애 감지 + 자동 티켓 생성**
```
서버 모니터링 시스템 → Freshservice API 호출
  ↓ (자동 - 1초)
[긴급] "DB 서버 다운" 티켓 자동 생성
  + 우선순위: "P1 - 긴급"
  + 담당자: On-call 엔지니어 (당직자)
  + 태그: #장애 #DB #긴급
```

**Step 2: 조건부 분기 (장애 유형별 대응)**
```
IF 장애 유형 = "DB 서버 다운"
  → 담당팀: DB 팀
  → 알림: SMS + 전화 (3회 반복)
  → 자동 액션: DB 재시작 스크립트 실행 (Orchestration)

ELSE IF 장애 유형 = "웹서버 다운"
  → 담당팀: 인프라팀
  → 알림: SMS + Slack 긴급 채널
  → 자동 액션: 웹서버 재시작

ELSE IF 장애 유형 = "네트워크 단절"
  → 담당팀: 네트워크팀
  → 알림: 전화 + SMS (즉시)
```

**Step 3: SLA 에스컬레이션 (다단계 알림)**
```
티켓 생성 즉시:
  → 담당자에게 SMS + 전화 (3회 반복)
  ↓
5분 경과: 아직 "확인" 안 됨?
  → 담당자에게 전화 (5회 반복) + 백업 담당자 SMS
  ↓
10분 경과: 아직 "진행 중" 아님?
  → 팀 매니저에게 전화 + 백업 담당자 자동 배정
  ↓
15분 경과: 아직 "해결" 안 됨?
  → CTO에게 에스컬레이션 + 전체 On-call 팀 소집
```

**Step 4: 체인 워크플로우 (자동 복구 시도)**
```
[워크플로우 1] 자동 진단
  → Orchestration: 헬스체크 스크립트 실행
  → 결과: "DB 연결 실패"
  ↓ (자동 - 10초)

[워크플로우 2] 자동 복구 시도
  → Orchestration: DB 재시작 스크립트 실행
  ↓ (자동 - 30초)

[워크플로우 3] 복구 검증
  → Orchestration: 헬스체크 재실행
  → 결과: "정상"?
    → YES: 티켓 자동 완료 + 담당자에게 "자동 복구됨" 알림
    → NO: 담당자에게 "수동 개입 필요" 긴급 알림
```

**Step 5: Parent-Child (관련 작업 자동 생성)**
```
[부모 티켓] "DB 서버 다운 (P1)"
  ↓ (자동 생성)
[자식 1] 장애 원인 분석 (담당: DB팀, 기한: 1일)
[자식 2] 재발 방지 대책 수립 (담당: DB팀 + 인프라팀, 기한: 3일)
[자식 3] 고객 공지 작성 (담당: CS팀, 기한: 1시간)
[자식 4] 사후 보고서 작성 (담당: CTO, 기한: 1주일)
```

---

### 효과 비교

| 구분 | 수동 (기존) | 자동화 (개선) |
|------|-----------|--------------|
| **초기 대응 시간** | 30분~2시간 | 1초 |
| **자동 복구율** | 0% | 60% |
| **담당자 알람 누락** | 자주 | 없음 (다단계) |
| **평균 장애 시간** | 2시간 | 15분 |
| **고객 불만** | 😡😡😡 | 😊 |

---

## 💡 핵심 정리

### 복합 자동화 설계 원칙

1. **문제를 단계별로 분해**
   - "한 번에 해결"하려 하지 말고
   - 작은 단계로 쪼개기

2. **적절한 패턴 선택 및 조합**
   - 조건이 복잡하면 → 조건부 분기
   - 승인 필요하면 → 승인 워크플로우
   - 연속 작업이면 → 체인 워크플로우
   - 복잡한 프로젝트면 → Parent-Child
   - 외부 시스템 연동 → Orchestration

3. **예외 상황 대비 (SLA)**
   - "만약 ~이 안 되면?"을 항상 고려
   - 에스컬레이션 경로 설계

4. **테스트 필수**
   - 실제 데이터로 시뮬레이션
   - 엣지 케이스 검증

### 실전 적용 체크리스트

```
✅ 현재 프로세스가 수동인가? (자동화 필요)
✅ 반복 작업인가? (자동화 효과 큼)
✅ 조건이 복잡한가? (조건부 분기 사용)
✅ 승인이 필요한가? (승인 워크플로우 사용)
✅ 여러 단계인가? (체인 워크플로우 사용)
✅ 외부 시스템 연동? (Orchestration 사용)
✅ 실패 시 대응책은? (SLA 에스컬레이션 설계)
```

**다음 섹션에서 기본 자동화 패턴을 직접 실습해봅시다!**
',
  3,
  12,
  true
);

-- 4. Feature - Basic (Enriched)
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'feature-basic',
  'basic',
  '기본 자동화 패턴',
  'Basic Automation Patterns',
  '
## 🎯 이제 직접 만들어봅시다!

### 학습 목표

이 섹션에서는 **가장 많이 사용되는 5가지 기본 자동화 패턴**을 직접 설정해봅니다.

**실습 환경:**
- Freshservice Admin 계정 필요
- Admin → Automation → Workflow Automator 메뉴

---

## 🔰 패턴 1: 자동 배정 (Auto-Assignment)

### 문제 상황
```
새 티켓 생성
  ↓ (수동)
관리자가 확인
  ↓ (수동)
적절한 팀에 배정
  ↓
평균 2시간 지연
```

### 해결: 키워드 기반 자동 배정

**실생활 비유:**
- 우편물에 "긴급" 스티커 → 빨간 우편함
- "일반" 우편물 → 파란 우편함

**Freshservice 설정:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "키워드 기반 자동 배정"

WHEN (이벤트):
  Ticket is created

IF (조건):
  Subject contains any of "비밀번호", "계정", "로그인"

THEN (액션):
  Assign to Group: "IT 보안팀"
  Send email to Requester:
    "귀하의 요청이 IT 보안팀에 배정되었습니다."
```

**실습 체크리스트:**
- [ ] Workflow Automator 메뉴 접속
- [ ] New Automator 클릭
- [ ] 이벤트: "Ticket is created" 선택
- [ ] 조건: Subject contains "비밀번호" 추가
- [ ] 액션: "Assign to Group" 선택 → "IT 보안팀"
- [ ] 저장 → 활성화

**테스트:**
```
1. 새 티켓 생성: "비밀번호 재설정 요청"
2. 확인: 자동으로 IT 보안팀에 배정되었는가?
3. 확인: 요청자에게 이메일 발송되었는가?
```

---

## 🔰 패턴 2: 우선순위 자동 상향 (Priority Escalation)

### 문제 상황
```
긴급 티켓인데 우선순위가 "보통"으로 생성됨
  ↓ (수동)
관리자가 나중에 발견
  ↓ (수동)
우선순위 "긴급"으로 수정
  ↓
평균 1일 지연
```

### 해결: 키워드 기반 자동 우선순위 상향

**실생활 비유:**
- 응급실: "심정지" 키워드 → 즉시 최우선 치료
- 일반 진료: "감기" → 일반 대기

**Freshservice 설정:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "긴급 키워드 감지 자동 상향"

WHEN (이벤트):
  Ticket is created

IF (조건):
  Subject contains any of "서버 다운", "긴급", "시스템 장애"
  OR
  Description contains "긴급"

THEN (액션):
  Set Priority to "Urgent"
  Set Status to "Open"
  Assign to Group: "IT 매니저"
  Send email to Group: "IT 매니저"
    "긴급 티켓이 생성되었습니다: {{ticket.subject}}"
  Send SMS to Agent: "IT 매니저 - 홍길동"
    "긴급: {{ticket.subject}}"
```

**핵심 포인트:**
- **다중 알림**: 이메일 + SMS (놓치지 않도록)
- **즉시 배정**: IT 매니저에게 직접 배정
- **우선순위 자동 변경**: "긴급"으로 즉시 상향

**테스트:**
```
1. 새 티켓 생성: "서버 다운 - 긴급 처리 필요"
2. 확인: 우선순위가 "Urgent"로 자동 설정되었는가?
3. 확인: IT 매니저에게 배정되었는가?
4. 확인: 이메일 + SMS 발송되었는가?
```

---

## 🔰 패턴 3: 자동 회신 + 상태 변경 (Auto-Reply)

### 문제 상황
```
직원: "티켓 제출했는데 답이 없네?"
  ↓ (수동)
담당자: (바쁨) "아직 못 봤어요..."
  ↓
직원: 😡 "언제 처리되나요?"
```

### 해결: 즉시 자동 회신 + 상태 업데이트

**실생활 비유:**
- 온라인 쇼핑: 주문 즉시 → "주문이 접수되었습니다!" 자동 이메일
- 택배: 발송 즉시 → "배송이 시작되었습니다!" 자동 SMS

**Freshservice 설정:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "티켓 생성 즉시 자동 회신"

WHEN (이벤트):
  Ticket is created

IF (조건):
  (조건 없음 - 모든 티켓)

THEN (액션):
  Set Status to "Open"
  Send email to Requester:
    제목: "티켓이 접수되었습니다 (티켓 번호: {{ticket.id}})"
    본문:
    "안녕하세요 {{ticket.requester.name}}님,

    귀하의 요청이 성공적으로 접수되었습니다.

    티켓 번호: {{ticket.id}}
    제목: {{ticket.subject}}
    생성 시간: {{ticket.created_at}}

    담당팀에서 검토 후 24시간 내 연락드리겠습니다.

    감사합니다.
    IT 지원팀"
```

**핵심 포인트:**
- **즉시 피드백**: 요청자가 "접수되었구나" 안심
- **명확한 정보**: 티켓 번호, 예상 처리 시간 제공
- **변수 활용**: `{{ticket.id}}`, `{{ticket.requester.name}}` 등

**테스트:**
```
1. 새 티켓 생성: "프린터 고장"
2. 확인: 이메일이 즉시 발송되었는가?
3. 확인: 이메일에 티켓 번호가 포함되었는가?
4. 확인: 상태가 "Open"으로 변경되었는가?
```

---

## 🔰 패턴 4: 해결 후 자동 만족도 조사 (Auto-Survey)

### 문제 상황
```
티켓 해결
  ↓ (수동)
관리자가 수동으로 만족도 조사 이메일 발송
  ↓ (자주 누락)
만족도 데이터 수집 안 됨
```

### 해결: 해결 시 자동 만족도 조사 발송

**실생활 비유:**
- 호텔 체크아웃: 자동으로 "만족도 조사" 이메일
- 온라인 쇼핑: 배송 완료 후 자동으로 "리뷰 작성" 요청

**Freshservice 설정:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "해결 후 자동 만족도 조사"

WHEN (이벤트):
  Ticket is Resolved

IF (조건):
  Status changes to "Resolved"

THEN (액션):
  Wait for 1 hour (사용자가 확인할 시간 제공)

  Send email to Requester:
    제목: "해결된 티켓에 대한 만족도 조사"
    본문:
    "안녕하세요 {{ticket.requester.name}}님,

    귀하의 요청이 해결되었습니다.

    티켓 번호: {{ticket.id}}
    제목: {{ticket.subject}}
    해결 시간: {{ticket.resolved_at}}

    서비스 만족도를 평가해주세요:
    [만족도 조사 링크]

    감사합니다.
    IT 지원팀"
```

**핵심 포인트:**
- **타이밍**: 해결 후 1시간 대기 (사용자가 확인할 시간)
- **자동 발송**: 100% 누락 없이 발송
- **데이터 수집**: 만족도 통계 자동 축적

**테스트:**
```
1. 티켓 상태를 "Resolved"로 변경
2. 1시간 대기
3. 확인: 만족도 조사 이메일이 발송되었는가?
```

---

## 🔰 패턴 5: 장시간 방치 티켓 자동 알림 (Idle Ticket Alert)

### 문제 상황
```
티켓 생성
  ↓ (배정됨)
담당자: 💤 (바쁨, 잊어버림)
  ↓ (3일 경과)
요청자: 😡 "왜 답이 없어요?"
  ↓ (1주일 경과)
매니저: "이 티켓 왜 방치됐어?"
```

### 해결: 일정 시간 후 자동 리마인더 + 에스컬레이션

**실생활 비유:**
- 식당 주문: 20분 경과 → 주방에 자동 알림
- 택배: 2일 경과 → 배송팀 매니저에게 자동 알림

**Freshservice 설정:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "24시간 미처리 티켓 자동 알림"

WHEN (이벤트):
  Time based (scheduled)
    Run every: 1 hour

IF (조건):
  Status is "Open"
  AND
  Updated at is older than 24 hours
  AND
  Priority is not "Low"

THEN (액션):
  Send email to Agent (담당자):
    제목: "[리마인더] 처리 필요: {{ticket.subject}}"
    본문:
    "{{ticket.agent.name}}님,

    아래 티켓이 24시간 동안 업데이트되지 않았습니다.

    티켓 번호: {{ticket.id}}
    제목: {{ticket.subject}}
    생성 시간: {{ticket.created_at}}
    마지막 업데이트: {{ticket.updated_at}}

    확인 부탁드립니다."

  Add note (private):
    "자동 리마인더 발송: {{current_time}}"
```

**고급 버전 (48시간 경과 시 에스컬레이션):**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "48시간 미처리 티켓 에스컬레이션"

WHEN (이벤트):
  Time based (scheduled)
    Run every: 1 hour

IF (조건):
  Status is "Open"
  AND
  Updated at is older than 48 hours

THEN (액션):
  Assign to Group: "IT 매니저"
  Set Priority to "High"
  Send email to Group: "IT 매니저"
    "티켓 {{ticket.id}}가 48시간 동안 처리되지 않아 에스컬레이션되었습니다."

  Send email to original Agent:
    "티켓 {{ticket.id}}가 IT 매니저에게 에스컬레이션되었습니다."
```

**핵심 포인트:**
- **시간 기반 트리거**: 매 시간 자동 체크
- **다단계 알림**: 24시간 → 리마인더, 48시간 → 에스컬레이션
- **우선순위 필터**: Low 티켓은 제외

**테스트:**
```
1. 오래된 테스트 티켓 생성 (Updated at을 24시간 이전으로 설정)
2. 워크플로우 수동 실행 (또는 1시간 대기)
3. 확인: 담당자에게 리마인더 이메일 발송되었는가?
```

---

## 💡 핵심 정리

### 5가지 기본 패턴 요약

| 패턴 | 언제 사용? | 효과 |
|------|----------|------|
| **자동 배정** | 키워드로 팀 분류 | 배정 시간 -95% |
| **우선순위 상향** | 긴급 키워드 감지 | 대응 시간 -80% |
| **자동 회신** | 티켓 생성 즉시 | 고객 불안 -100% |
| **만족도 조사** | 해결 후 자동 발송 | 데이터 수집률 100% |
| **방치 티켓 알림** | 24시간 미처리 | 방치율 -90% |

### 다음 단계

이제 기본 패턴을 배웠으니:
1. ✅ 각 패턴을 실제로 설정해보기
2. ✅ 테스트 티켓으로 동작 확인
3. ✅ 실제 환경에 적용

**다음 섹션에서 심화 설정을 배워봅시다!**
',
  4,
  10,
  true
);

-- 5. Feature - Advanced (Enriched)
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'feature-advanced',
  'basic',
  '심화 설정: SLA·승인·통합',
  'Advanced Settings: SLA·Approval·Integration',
  '
## 🚀 더 강력한 자동화로 업그레이드

### 학습 목표

기본 패턴을 마스터했다면, 이제:
1. ✅ **SLA 위반 방지 자동화**
2. ✅ **승인 워크플로우 설정**
3. ✅ **외부 시스템 통합 (Orchestration)**

---

## ⏰ 고급 기능 1: SLA 기반 자동 에스컬레이션

### 문제 상황

**현재:**
```
티켓 생성 (우선순위: 긴급, SLA: 4시간)
  ↓ (2시간 경과)
담당자: (바쁨, 아직 확인 안 함)
  ↓ (4시간 경과)
SLA 위반! 😱
  ↓
매니저: "왜 SLA 위반됐어?"
```

**SLA (Service Level Agreement)란?**
- **약속한 처리 시간**
- 예: 긴급 티켓 → 4시간 내 해결
- 예: 보통 티켓 → 24시간 내 해결

---

### 해결: SLA 위반 전 자동 에스컬레이션

**실생활 비유:**
- 피자 배달: 30분 약속 → 20분 경과 시 자동 알림 → 배달원 독촉

**Freshservice 설정:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "SLA 위반 방지 - 긴급 티켓"

WHEN (이벤트):
  Time based (scheduled)
    Run every: 30 minutes

IF (조건):
  Priority is "Urgent"
  AND
  Status is not "Resolved"
  AND
  SLA breach time is within 1 hour (SLA 위반 1시간 전)

THEN (액션):
  [1단계] 담당자에게 긴급 알림
    Send SMS to Agent:
      "⚠️ 긴급: 티켓 {{ticket.id}}의 SLA가 1시간 후 위반됩니다!"

  [2단계] 우선순위 시각적 강조
    Add tag: "SLA-CRITICAL"
    Set Status to "Open" (if still New)

  [3단계] 매니저에게 모니터링 알림
    Send email to Group: "IT 매니저"
      "티켓 {{ticket.id}}가 SLA 위반 위기입니다.
       담당자: {{ticket.agent.name}}
       남은 시간: 1시간"
```

**2단계 에스컬레이션 (SLA 위반 시):**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "SLA 위반 시 자동 재배정"

WHEN (이벤트):
  SLA is breached

IF (조건):
  Priority is "Urgent"

THEN (액션):
  [긴급 조치]
    Assign to Group: "IT 매니저"
    Set Priority to "Critical" (최고 우선순위)
    Send email to CTO:
      "SLA 위반 발생: {{ticket.id}}
       원래 담당자: {{ticket.agent.name}}
       위반 시간: {{current_time}}"

  [원래 담당자에게 통보]
    Send email to previous Agent:
      "티켓 {{ticket.id}}가 SLA 위반으로 인해 IT 매니저에게 재배정되었습니다."

  [티켓에 기록]
    Add note (private):
      "자동 에스컬레이션: SLA 위반으로 인한 재배정
       원래 담당자: {{previous_agent.name}}
       시간: {{current_time}}"
```

**효과:**
| 구분 | 수동 | 자동 (SLA 기반) |
|------|------|----------------|
| SLA 위반률 | 40% | 5% |
| 평균 대응 시간 | 6시간 | 2시간 |
| 매니저 개입 | 수동 모니터링 | 자동 알림만 |

---

## ✅ 고급 기능 2: 다단계 승인 워크플로우

### 문제 상황

**현재:**
```
직원: "노트북 300만원짜리 구매 요청"
  ↓ (수동)
IT팀: "팀장 승인 받으세요"
  ↓ (이메일 왔다갔다)
팀장: "IT 매니저도 승인 받으세요"
  ↓ (이메일 왔다갔다)
IT매니저: "CFO도 승인 받으세요"
  ↓ (이메일 왔다갔다)
CFO: "승인"
  ↓
총 소요 시간: 1주일
```

---

### 해결: 금액별 자동 승인 라우팅

**실생활 비유:**
- 회사 지출 결재:
  - 5만원 미만 → 팀장만
  - 50만원 미만 → 팀장 + 부서장
  - 50만원 이상 → 팀장 + 부서장 + 재무팀

**Freshservice 설정:**

**Step 1: 커스텀 필드 생성**

```
[Admin] → [Ticket Fields] → [Add Field]

필드 이름: "예상 금액"
필드 타입: Number
필수: Yes
```

**Step 2: 승인 워크플로우 생성**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "노트북 구매 승인 - 금액별 자동 라우팅"

WHEN (이벤트):
  Ticket is created

IF (조건):
  Subject contains "노트북" OR "구매"
  AND
  Custom Field "예상 금액" is not empty

THEN (액션):
  [조건 1] IF 예상 금액 < 100만원
    → Trigger Approval:
        Approvers: 팀장 (순차)
        Approval type: Sequential (순차 승인)

  [조건 2] ELSE IF 예상 금액 < 300만원
    → Trigger Approval:
        Approvers:
          1. 팀장
          2. IT 매니저
        Approval type: Sequential

  [조건 3] ELSE (300만원 이상)
    → Trigger Approval:
        Approvers:
          1. 팀장
          2. IT 매니저
          3. CFO
        Approval type: Sequential

  [모든 케이스] 승인 요청 이메일 자동 발송
    Send email to Approvers:
      "새로운 구매 승인 요청이 있습니다.
       요청자: {{ticket.requester.name}}
       금액: {{ticket.custom_fields.예상_금액}}원
       사유: {{ticket.description}}

       [승인] [거부] 버튼"
```

**Step 3: 승인 완료 후 자동 처리**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "승인 완료 후 자동 구매 발주"

WHEN (이벤트):
  Approval is granted (모든 승인자 승인 완료)

IF (조건):
  Subject contains "노트북" OR "구매"

THEN (액션):
  [1] 구매팀에 티켓 자동 생성
    Create Child Ticket:
      Subject: "[승인완료] {{parent_ticket.subject}}"
      Description: "승인 금액: {{parent_ticket.custom_fields.예상_금액}}원
                    요청자: {{parent_ticket.requester.name}}
                    승인자: {{approvers.names}}
                    승인 완료 시간: {{current_time}}"
      Assign to Group: "구매팀"
      Priority: "High"

  [2] 요청자에게 알림
    Send email to Requester:
      "귀하의 구매 요청이 승인되었습니다.
       승인 금액: {{ticket.custom_fields.예상_금액}}원
       구매팀에서 곧 진행할 예정입니다."

  [3] 원본 티켓 상태 업데이트
    Set Status to "Pending" (구매 대기)
    Add tag: "APPROVED"
```

**Step 4: 거부 시 자동 처리**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "승인 거부 시 자동 알림"

WHEN (이벤트):
  Approval is rejected (1명이라도 거부)

IF (조건):
  Subject contains "노트북" OR "구매"

THEN (액션):
  Send email to Requester:
    "귀하의 구매 요청이 거부되었습니다.
     거부자: {{rejector.name}}
     거부 사유: {{rejection.reason}}

     추가 문의사항이 있으시면 담당자에게 연락 바랍니다."

  Set Status to "Closed"
  Add tag: "REJECTED"
  Add note (private):
    "자동 거부 처리: {{rejector.name}} ({{current_time}})"
```

**효과:**
| 구분 | 수동 | 자동 (승인 워크플로우) |
|------|------|----------------------|
| 승인 소요 시간 | 1주일 | 4시간 |
| 승인 누락 | 자주 | 0% |
| 이메일 왔다갔다 | 10회+ | 0회 (자동) |
| 요청자 만족도 | 😡 | 😊 |

---

## 🔗 고급 기능 3: 외부 시스템 통합 (Orchestration)

### 문제 상황

**현재:**
```
신입사원 입사 티켓 생성
  ↓ (수동)
IT팀: Active Directory에 수동으로 계정 생성
  ↓ (수동)
IT팀: Microsoft 365 라이선스 수동 할당
  ↓ (수동)
IT팀: Slack 계정 수동 생성
  ↓
총 소요 시간: 3일
누락 가능성: 40%
```

---

### 해결: Orchestration (외부 API 자동 호출)

**Orchestration이란?**
- **다른 시스템과 자동으로 연동**
- Freshservice → 외부 API 호출 → 자동 처리

**실생활 비유:**
- 스마트홈: "집 나갈게" → 자동으로:
  - 난방 OFF
  - 조명 OFF
  - 보안 시스템 ON

---

### 예시: Active Directory 계정 자동 생성

**Freshservice 설정 (Orchestration):**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "신입사원 AD 계정 자동 생성"

WHEN (이벤트):
  Ticket is created

IF (조건):
  Subject contains "신입사원"
  AND
  Custom Field "부서" is not empty

THEN (액션):
  [1] Orchestration: Active Directory API 호출
    API Endpoint: https://your-company.com/api/ad/create-user
    Method: POST
    Headers:
      Authorization: Bearer {{api_token}}
      Content-Type: application/json
    Body:
      {
        "username": "{{ticket.custom_fields.email}}",
        "displayName": "{{ticket.custom_fields.이름}}",
        "department": "{{ticket.custom_fields.부서}}",
        "password": "TempPass123!",
        "groups": ["AllUsers", "{{ticket.custom_fields.부서}}"]
      }

  [2] API 응답 저장
    Store response as: {{ad_account_result}}

  [3] 성공 시 자동 처리
    IF {{ad_account_result.status}} == "success"
      → Add note (private):
          "AD 계정 생성 완료:
           Username: {{ad_account_result.username}}
           시간: {{current_time}}"

      → Send email to Requester:
          "신입사원 AD 계정이 생성되었습니다.
           Username: {{ad_account_result.username}}
           임시 비밀번호: TempPass123!

           첫 로그인 후 비밀번호를 변경해주세요."

  [4] 실패 시 자동 처리
    ELSE
      → Assign to Group: "IT 인프라팀"
      → Set Priority to "High"
      → Add note (private):
          "⚠️ AD 계정 자동 생성 실패:
           Error: {{ad_account_result.error}}
           수동 처리 필요"

      → Send email to Group: "IT 인프라팀"
          "신입사원 AD 계정 자동 생성이 실패했습니다. 수동 처리 필요."
```

---

### 체인 Orchestration: 연속 API 호출

**Step 1 → Step 2 → Step 3 자동 연결**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

이름: "신입사원 온보딩 - 전체 자동화"

WHEN (이벤트):
  Ticket is created

IF (조건):
  Subject contains "신입사원"

THEN (액션):
  [Step 1] Active Directory 계정 생성
    Orchestration: AD API 호출
    Store response: {{ad_result}}
    ↓ (성공 시 자동으로 Step 2 실행)

  [Step 2] Microsoft 365 라이선스 할당
    Orchestration: Microsoft Graph API 호출
    API Endpoint: https://graph.microsoft.com/v1.0/users/{{ad_result.username}}/assignLicense
    Body:
      {
        "addLicenses": [
          {
            "skuId": "{{microsoft_365_e3_sku_id}}"
          }
        ]
      }
    Store response: {{m365_result}}
    ↓ (성공 시 자동으로 Step 3 실행)

  [Step 3] Slack 계정 생성 + 채널 초대
    Orchestration: Slack API 호출
    API Endpoint: https://slack.com/api/users.admin.invite
    Body:
      {
        "email": "{{ticket.custom_fields.email}}",
        "channels": ["C01234567", "C89ABCDEF"],
        "first_name": "{{ticket.custom_fields.이름}}",
        "last_name": "{{ticket.custom_fields.성}}"
      }
    Store response: {{slack_result}}

  [최종] 모든 단계 완료 시
    Set Status to "Resolved"
    Send email to Requester:
      "신입사원 온보딩이 완료되었습니다!

       ✅ AD 계정: {{ad_result.username}}
       ✅ Microsoft 365: {{m365_result.license}}
       ✅ Slack: {{slack_result.email}}

       첫 출근일에 사용하시면 됩니다.
       임시 비밀번호: TempPass123!"

    Send email to HR:
      "신입사원 {{ticket.custom_fields.이름}}님의 IT 계정이 모두 준비되었습니다."
```

**효과:**
| 구분 | 수동 | 자동 (Orchestration) |
|------|------|---------------------|
| 소요 시간 | 3일 | 10분 |
| 누락 가능성 | 40% | 0% |
| IT팀 개입 | 15번 | 0번 (실패 시만) |
| 일관성 | 낮음 | 100% |

---

## 💡 핵심 정리

### 3가지 고급 기능 비교

| 기능 | 언제 사용? | 난이도 | 효과 |
|------|----------|--------|------|
| **SLA 에스컬레이션** | SLA 위반 방지 필요 | ⭐⭐ | SLA 위반 -35% |
| **승인 워크플로우** | 권한/예산 통제 필요 | ⭐⭐⭐ | 승인 시간 -85% |
| **Orchestration** | 외부 시스템 연동 필요 | ⭐⭐⭐⭐ | 수동 작업 -95% |

### 구현 순서 추천

```
1주차: SLA 에스컬레이션 구현
  → 가장 빠른 효과, 비교적 쉬움

2주차: 승인 워크플로우 구현
  → 중간 난이도, 큰 효과

3주차: Orchestration 구현
  → 어렵지만 최고의 효과
  → IT 인프라팀과 협업 필요
```

**다음 섹션에서 실제 승인 워크플로우를 직접 만들어봅시다!**
',
  5,
  12,
  true
);

-- 6. Practice (Enriched)
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'practice',
  'basic',
  '실습: 노트북 구매 승인 자동화',
  'Practice: Laptop Purchase Approval Automation',
  '
## 🎓 실습 목표

이제까지 배운 모든 패턴을 조합해서 **실제 업무 시나리오**를 자동화해봅시다!

**실습 시나리오:**
"노트북 구매 요청 승인 자동화 시스템 구축"

**사용할 패턴:**
1. ✅ 조건부 분기 (금액별 다른 처리)
2. ✅ 승인 워크플로우 (자동 승인 라우팅)
3. ✅ SLA 에스컬레이션 (승인 지연 방지)
4. ✅ 체인 워크플로우 (승인 후 자동 발주)

**예상 소요 시간:** 20분

---

## 📋 비즈니스 요구사항

### 현재 문제 상황

**ABC 회사의 노트북 구매 프로세스:**

```
직원: "노트북 구매 요청" 제출
  ↓ (1일 대기)
IT팀: 확인 → "팀장 승인 받으세요"
  ↓ (이메일 왔다갔다, 2일 대기)
팀장: "금액이 크네요. IT 매니저도 승인 받으세요"
  ↓ (이메일 왔다갔다, 2일 대기)
IT매니저: (300만원 이상) "CFO도 승인 받으세요"
  ↓ (이메일 왔다갔다, 3일 대기)
CFO: "승인"
  ↓ (1일 대기)
구매팀: 발주
  ↓
**총 소요 시간: 9일**
**승인 누락률: 30%**
**직원 불만: 😡😡😡**
```

---

### 목표: 완전 자동화

**자동화 후:**

```
직원: "노트북 구매 요청" 제출 (금액 입력)
  ↓ (1초 - 자동)
시스템: 금액 분석 → 자동으로 승인자 결정
  ↓ (1초 - 자동)
승인자들에게 이메일 + SMS 자동 발송
  ↓ (4시간 - 승인자가 버튼 클릭)
모든 승인 완료
  ↓ (1초 - 자동)
구매팀에 자동 발주 티켓 생성
  ↓
**총 소요 시간: 4시간**
**승인 누락률: 0%**
**직원 만족도: 😊😊😊**
```

---

## 🛠️ 실습 단계

### Step 1: 커스텀 필드 생성 (5분)

**목적:** 금액과 사유를 입력받기 위한 필드 생성

**작업:**

```
[Admin] → [Ticket Fields] → [New Field]

1. 예상 금액 필드
   - Field Label: "예상 금액"
   - Field Name: expected_amount
   - Field Type: Number
   - Mandatory: Yes
   - Hint: "원 단위로 입력 (예: 1500000)"
   - Visible: Only for tickets containing "노트북" or "구매"

2. 구매 사유 필드
   - Field Label: "구매 사유"
   - Field Name: purchase_reason
   - Field Type: Paragraph (Multi-line text)
   - Mandatory: Yes
   - Hint: "노트북이 필요한 구체적인 사유를 입력하세요"
   - Visible: Only for tickets containing "노트북" or "구매"

3. 현재 장비 상태 필드
   - Field Label: "현재 장비 상태"
   - Field Name: current_equipment_status
   - Field Type: Dropdown
   - Options:
     * "없음 (신규 입사)"
     * "고장 (수리 불가)"
     * "성능 부족 (업무 지장)"
     * "분실/도난"
   - Mandatory: Yes
```

**✅ 체크포인트:**
- [ ] 3개 커스텀 필드가 생성되었는가?
- [ ] 테스트 티켓 생성 시 필드가 보이는가?

---

### Step 2: 금액별 자동 승인 라우팅 (10분)

**목적:** 금액에 따라 자동으로 승인자를 다르게 배정

**작업:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

Name: "노트북 구매 - 금액별 자동 승인 라우팅"

WHEN (Events):
  ✅ Ticket is created

IF (Conditions):
  Subject contains any of "노트북", "구매"
  AND
  Custom Field "예상 금액" is not empty

THEN (Actions):

  [공통 액션 1] 티켓 상태 업데이트
    Set Status to "Pending Approval"
    Add tag: "PURCHASE-REQUEST"

  [공통 액션 2] 요청자에게 즉시 회신
    Send email to Requester:
      Subject: "구매 요청이 접수되었습니다 (티켓 #{{ticket.id}})"
      Body:
        "안녕하세요 {{ticket.requester.name}}님,

        노트북 구매 요청이 성공적으로 접수되었습니다.

        📌 요청 정보:
        - 티켓 번호: #{{ticket.id}}
        - 예상 금액: {{ticket.custom_fields.expected_amount}}원
        - 사유: {{ticket.custom_fields.purchase_reason}}

        승인 프로세스가 자동으로 시작되었습니다.
        승인 완료 시 다시 알려드리겠습니다.

        감사합니다.
        IT팀"

  [조건부 액션 - 금액별 분기]

    IF Custom Field "예상 금액" < 1000000 (100만원 미만)
      → Trigger Approval:
          Approvers:
            1. {{ticket.requester.manager}} (요청자의 팀장)
          Approval Type: Sequential
          Approval Message:
            "노트북 구매 승인 요청
             요청자: {{ticket.requester.name}}
             금액: {{ticket.custom_fields.expected_amount}}원
             사유: {{ticket.custom_fields.purchase_reason}}

             [승인] [거부]"

    ELSE IF Custom Field "예상 금액" < 3000000 (300만원 미만)
      → Trigger Approval:
          Approvers:
            1. {{ticket.requester.manager}} (팀장)
            2. IT 매니저 (고정 배정)
          Approval Type: Sequential (순차 승인)

    ELSE (300만원 이상)
      → Trigger Approval:
          Approvers:
            1. {{ticket.requester.manager}} (팀장)
            2. IT 매니저
            3. CFO
          Approval Type: Sequential (순차 승인)

  [공통 액션 3] 승인자에게 SMS 알림 (선택사항)
    Send SMS to Approvers:
      "새로운 노트북 구매 승인 요청이 있습니다.
       금액: {{ticket.custom_fields.expected_amount}}원
       Freshservice에서 확인하세요."
```

**✅ 체크포인트:**
- [ ] 워크플로우가 활성화되었는가?
- [ ] 테스트 티켓 생성 시 승인 프로세스가 시작되는가?
- [ ] 금액에 따라 승인자가 다르게 배정되는가?

---

### Step 3: 승인 지연 방지 (SLA 에스컬레이션) (3분)

**목적:** 승인자가 4시간 동안 응답하지 않으면 자동 리마인더

**작업:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

Name: "승인 지연 방지 - 자동 리마인더"

WHEN (Events):
  ✅ Time based (scheduled)
      Run every: 1 hour

IF (Conditions):
  Status is "Pending Approval"
  AND
  Tag contains "PURCHASE-REQUEST"
  AND
  Updated at is older than 4 hours

THEN (Actions):

  [1단계 - 4시간 경과] 승인자에게 리마인더
    Send email to Pending Approver:
      Subject: "[리마인더] 노트북 구매 승인 대기 중"
      Body:
        "{{approver.name}}님,

        아래 노트북 구매 승인이 대기 중입니다.

        티켓: #{{ticket.id}}
        요청자: {{ticket.requester.name}}
        금액: {{ticket.custom_fields.expected_amount}}원
        요청 시간: {{ticket.created_at}}

        빠른 승인 부탁드립니다.

        [승인 바로가기]"

    Send SMS to Pending Approver:
      "노트북 구매 승인 대기 중 (4시간 경과)
       티켓 #{{ticket.id}}, {{ticket.custom_fields.expected_amount}}원"

  [티켓에 기록]
    Add note (private):
      "자동 리마인더 발송: {{current_time}}
       승인 대기 중: {{pending_approver.name}}"
```

---

### Step 4: 승인 완료 시 자동 발주 (체인 워크플로우) (2분)

**목적:** 모든 승인이 완료되면 자동으로 구매팀에 티켓 생성

**작업:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

Name: "승인 완료 후 자동 구매 발주"

WHEN (Events):
  ✅ Approval is granted (모든 승인자 승인 완료)

IF (Conditions):
  Subject contains any of "노트북", "구매"
  AND
  Tag contains "PURCHASE-REQUEST"

THEN (Actions):

  [1] 구매팀에 자동 티켓 생성
    Create Child Ticket:
      Subject: "[승인완료] 노트북 구매 발주 - {{parent_ticket.requester.name}}"
      Description:
        "✅ 승인이 완료된 노트북 구매 요청입니다.

        📌 요청 정보:
        - 요청자: {{parent_ticket.requester.name}} ({{parent_ticket.requester.department}})
        - 금액: {{parent_ticket.custom_fields.expected_amount}}원
        - 사유: {{parent_ticket.custom_fields.purchase_reason}}
        - 현재 장비 상태: {{parent_ticket.custom_fields.current_equipment_status}}

        ✅ 승인 정보:
        - 승인자: {{approvers.names}}
        - 승인 완료 시간: {{current_time}}

        📋 다음 단계:
        1. 노트북 모델 선정 (예산: {{parent_ticket.custom_fields.expected_amount}}원)
        2. 견적 요청
        3. 발주
        4. 배송 추적

        원본 티켓: #{{parent_ticket.id}}"

      Assign to Group: "구매팀"
      Priority: "High"
      Due date: "+3 days"

  [2] 요청자에게 승인 완료 알림
    Send email to Requester:
      Subject: "🎉 노트북 구매 요청이 승인되었습니다!"
      Body:
        "안녕하세요 {{ticket.requester.name}}님,

        축하합니다! 노트북 구매 요청이 모든 승인자로부터 승인되었습니다.

        ✅ 승인 정보:
        - 승인 금액: {{ticket.custom_fields.expected_amount}}원
        - 승인자: {{approvers.names}}
        - 승인 완료 시간: {{current_time}}

        📦 다음 단계:
        구매팀에서 곧 진행할 예정이며, 예상 소요 기간은 3-5 영업일입니다.
        구매 진행 상황은 별도로 안내드리겠습니다.

        감사합니다.
        IT팀"

  [3] 승인자들에게 감사 알림
    Send email to All Approvers:
      Subject: "승인 감사드립니다 - 노트북 구매 (#{{ticket.id}})"
      Body:
        "{{approver.name}}님,

        노트북 구매 요청 승인에 감사드립니다.

        티켓 #{{ticket.id}}가 구매팀으로 전달되어 진행 중입니다.

        감사합니다.
        IT팀"

  [4] 원본 티켓 상태 업데이트
    Set Status to "Pending" (구매 진행 중)
    Add tag: "APPROVED"
    Add note (private):
      "자동 승인 완료 처리:
       승인자: {{approvers.names}}
       완료 시간: {{current_time}}
       구매팀 티켓: #{{child_ticket.id}}"
```

---

### Step 5: 승인 거부 시 자동 처리 (보너스)

**목적:** 1명이라도 거부하면 즉시 알림 + 티켓 종료

**작업:**

```
[Admin] → [Automation] → [Workflow Automator] → [New Automator]

Name: "승인 거부 시 자동 알림"

WHEN (Events):
  ✅ Approval is rejected (1명이라도 거부)

IF (Conditions):
  Subject contains any of "노트북", "구매"
  AND
  Tag contains "PURCHASE-REQUEST"

THEN (Actions):

  [1] 요청자에게 거부 알림
    Send email to Requester:
      Subject: "❌ 노트북 구매 요청이 거부되었습니다"
      Body:
        "안녕하세요 {{ticket.requester.name}}님,

        안타깝게도 노트북 구매 요청이 거부되었습니다.

        ❌ 거부 정보:
        - 거부자: {{rejector.name}} ({{rejector.role}})
        - 거부 사유: {{rejection.reason}}
        - 거부 시간: {{current_time}}

        💡 다음 단계:
        거부 사유를 확인하시고, 필요하다면 추가 설명과 함께 새로운 요청을 제출해주세요.

        감사합니다.
        IT팀"

  [2] 티켓 상태 업데이트
    Set Status to "Rejected"
    Set Resolution to "Approval Rejected"
    Add tag: "REJECTED"
    Add note (private):
      "자동 거부 처리:
       거부자: {{rejector.name}}
       거부 사유: {{rejection.reason}}
       시간: {{current_time}}"

  [3] 매니저에게 통보 (선택사항)
    Send email to {{ticket.requester.manager}}:
      "{{ticket.requester.name}}님의 노트북 구매 요청이 거부되었습니다.
       거부자: {{rejector.name}}
       거부 사유: {{rejection.reason}}

       필요하다면 팀원과 상담 후 재요청하시기 바랍니다."
```

---

## 🧪 테스트 시나리오

### 테스트 1: 100만원 미만 (팀장만 승인)

```
1. 새 티켓 생성:
   - Subject: "노트북 구매 요청 - 개발용"
   - 예상 금액: 800000
   - 구매 사유: "신규 프로젝트 개발용"
   - 현재 장비 상태: "성능 부족 (업무 지장)"

2. 예상 결과:
   ✅ 요청자에게 즉시 회신 이메일 발송
   ✅ 팀장에게만 승인 요청 발송
   ✅ 상태: "Pending Approval"

3. 팀장이 승인:
   ✅ 구매팀에 자동 티켓 생성
   ✅ 요청자에게 "승인 완료" 이메일
   ✅ 상태: "Pending" (구매 진행 중)
```

### 테스트 2: 150만원 (팀장 + IT매니저 승인)

```
1. 새 티켓 생성:
   - Subject: "노트북 구매 요청 - 디자인용"
   - 예상 금액: 1500000
   - 구매 사유: "고사양 디자인 작업용"
   - 현재 장비 상태: "고장 (수리 불가)"

2. 예상 결과:
   ✅ 팀장 → IT매니저 순차 승인 요청
   ✅ 팀장 승인 후 → IT매니저에게 자동 요청

3. 모든 승인 완료:
   ✅ 구매팀 티켓 자동 생성
   ✅ 모든 이해관계자에게 알림
```

### 테스트 3: 350만원 (팀장 + IT매니저 + CFO 승인)

```
1. 새 티켓 생성:
   - Subject: "노트북 구매 요청 - 고사양 워크스테이션"
   - 예상 금액: 3500000
   - 구매 사유: "AI 모델 훈련용 고사양 장비 필요"
   - 현재 장비 상태: "성능 부족 (업무 지장)"

2. 예상 결과:
   ✅ 팀장 → IT매니저 → CFO 순차 승인
   ✅ 3단계 승인 프로세스
   ✅ 각 승인자에게 순차적으로 요청
```

### 테스트 4: 승인 지연 (4시간 초과)

```
1. 승인 요청 티켓 생성 후 4시간 대기

2. 예상 결과 (4시간 후):
   ✅ 승인자에게 리마인더 이메일 + SMS
   ✅ 티켓에 "리마인더 발송" 메모 추가
```

### 테스트 5: 승인 거부

```
1. 승인자가 "거부" 버튼 클릭

2. 예상 결과:
   ✅ 요청자에게 "거부" 이메일 발송
   ✅ 상태: "Rejected"
   ✅ 티켓 종료
```

---

## 📊 성과 측정

### Before vs After

| 지표 | 자동화 전 | 자동화 후 | 개선율 |
|------|----------|----------|--------|
| **평균 승인 시간** | 9일 | 4시간 | **-98%** |
| **승인 누락률** | 30% | 0% | **-100%** |
| **IT팀 수동 개입** | 5회/건 | 0회/건 | **-100%** |
| **요청자 만족도** | 2.1/5.0 | 4.8/5.0 | **+229%** |
| **처리 비용** | 5만원/건 | 500원/건 | **-99%** |

### ROI (투자 대비 효과)

```
월평균 노트북 구매 요청: 20건

자동화 전 비용:
- IT팀 처리 시간: 20건 × 2시간 × 5만원/시간 = 200만원/월
- 승인 지연으로 인한 기회 비용: 약 100만원/월
→ 총 300만원/월

자동화 후 비용:
- IT팀 모니터링: 20건 × 5분 × 5만원/시간 = 8만원/월
→ 총 8만원/월

절감액: 292만원/월 (3,504만원/년)
자동화 구축 비용: 40만원 (1회)

ROI: (3,504만원 - 40만원) / 40만원 = 8,660% (1년 기준)
투자 회수 기간: 0.4개월
```

---

## 💡 핵심 정리

### 배운 내용

1. ✅ **커스텀 필드 활용**: 동적 데이터 수집
2. ✅ **조건부 분기**: 금액별 다른 처리
3. ✅ **승인 워크플로우**: 자동 라우팅
4. ✅ **SLA 에스컬레이션**: 지연 방지
5. ✅ **체인 워크플로우**: 승인 후 자동 발주

### 다음 단계

```
✅ 이 실습을 완료했다면:
  → Freshservice 자동화 기본 과정 수료!

📚 추가 학습 추천:
  1. Asset Management 자동화
  2. Change Management 자동화
  3. Incident Management 자동화

🚀 실무 적용:
  1. 팀 내 반복 업무 식별
  2. 자동화 가능성 평가
  3. POC (Proof of Concept) 시작
  4. 단계적 롤아웃
```

**축하합니다! Freshservice 자동화 워크플로우 실습을 완료하셨습니다! 🎉**
',
  6,
  20,
  true
);
