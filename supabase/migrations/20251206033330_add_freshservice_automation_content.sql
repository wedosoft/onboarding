-- Freshservice Automation Module Content (6-step structure)
-- Module ID: d84102b8-c3a1-49de-878d-d03be03e1388

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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'overview',
  'basic',
  '왜 자동화 워크플로우인가?',
  'Why Automation Workflows?',
  '
## 🎯 IT 서비스 자동화의 가치

### 반복 작업 제거
매일 똑같은 작업을 반복하고 계신가요?

- 신입 사원 입사 시 계정 생성, 장비 배정, 권한 설정
- 퇴사 시 계정 비활성화, 장비 회수, 접근 권한 제거
- 정기 점검 티켓 생성 및 배정

이런 작업들을 **자동화**하면:
- ⏱️ 시간 절약: 수동 작업 90% 감소
- ✅ 오류 감소: 사람이 빠뜨리는 단계 제거
- 🎯 일관성: 모든 요청이 동일한 품질로 처리

### Freshservice 자동화의 3가지 유형

| 유형 | 설명 | 예시 |
|------|------|------|
| **Workflow Automator** | 이벤트 기반 자동 실행 | 티켓 생성 시 자동 배정 |
| **Business Rule** | 조건부 액션 | 긴급 티켓 → 관리자 알림 |
| **Orchestration** | 외부 시스템 연동 | AD 계정 자동 생성 |

### 실제 효과
한 고객사는 신입사원 온보딩 자동화로:
- 처리 시간: 4시간 → 30분
- 오류율: 15% → 0%
- IT 팀 만족도: 65% → 92%
',
  1,
  8,
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'overview',
  'intermediate',
  '고급 워크플로우 패턴',
  'Advanced Workflow Patterns',
  '
## 🔄 복잡한 시나리오 자동화

### 조건부 분기 (If-Then-Else)
```
IF 요청자 부서 = "영업팀" AND 금액 > 100만원
  THEN 영업이사 승인 필요
ELSE IF 금액 > 50만원
  THEN 팀장 승인 필요
ELSE
  THEN 자동 승인
```

### 시간 기반 자동화
| 트리거 | 액션 | 비즈니스 가치 |
|--------|------|---------------|
| SLA 50% 경과 | 담당자에게 알림 | SLA 준수율 향상 |
| 72시간 응답 없음 | 에스컬레이션 | 고객 만족도 유지 |
| 매주 월요일 9시 | 주간 점검 티켓 생성 | 예방적 유지보수 |

### 승인 체인 (Approval Chain)

```mermaid
graph LR
    A[요청 접수] --> B{금액 체크}
    B -->|50만 미만| C[자동 승인]
    B -->|50만 이상| D[팀장 승인]
    D --> E{승인 여부}
    E -->|승인| F[IT 팀 배정]
    E -->|반려| G[요청자 통지]
    F --> H[작업 진행]
```

### 외부 시스템 연동 (Orchestration)

**Active Directory 연동 예시:**
1. 신입사원 온보딩 티켓 생성
2. 자동으로 AD 계정 생성 요청
3. API로 AD에 계정 생성
4. 생성된 계정 정보를 티켓에 자동 기록
5. 요청자에게 완료 통지

**성과:**
- 수동 작업: 30분 → 자동화: 2분
- 오류율: 0%
',
  2,
  10,
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'overview',
  'advanced',
  '복합 자동화 시나리오',
  'Complex Automation Scenarios',
  '
## 🏢 엔터프라이즈급 자동화

### 시나리오 1: 퇴사자 처리 완전 자동화

```yaml
Trigger: 퇴사 티켓 생성
Steps:
  1. AD 계정 비활성화 (즉시)
  2. 이메일 전달 설정 (7일간)
  3. 파일 서버 접근 제거
  4. VPN 계정 삭제
  5. 장비 회수 티켓 생성
  6. 보안팀에 알림
  7. 30일 후 계정 완전 삭제 예약
```

**효과:**
- 보안 리스크 90% 감소
- 퇴사 처리 시간: 4시간 → 15분

### 시나리오 2: 인텔리전트 티켓 라우팅

**AI 기반 자동 배정:**
```
IF 티켓 제목 포함 ["비밀번호", "로그인", "계정"]
  THEN IT 보안팀 배정
ELSE IF 티켓 제목 포함 ["프린터", "복사기"]
  THEN 시설팀 배정
ELSE IF 티켓 내용 유사도 > 85% (기존 티켓 대비)
  THEN 이전 처리자에게 자동 배정
ELSE
  THEN 라운드 로빈 방식 배정
```

### 시나리오 3: SLA 보장 자동화

| 시간 | 자동 액션 | 목적 |
|------|-----------|------|
| SLA 25% 경과 | 담당자 Slack 알림 | 조기 경고 |
| SLA 50% 경과 | 담당자 이메일 + 우선순위 상향 | 주의 환기 |
| SLA 75% 경과 | 매니저 알림 + 티켓 하이라이트 | 에스컬레이션 준비 |
| SLA 90% 경과 | 시니어 엔지니어 자동 배정 | SLA 위반 방지 |

### 측정 가능한 성과

**도입 전 vs 도입 후:**
| 지표 | 도입 전 | 도입 후 | 개선율 |
|------|---------|---------|--------|
| 평균 처리 시간 | 4.2시간 | 1.1시간 | 74% ↓ |
| SLA 준수율 | 78% | 96% | 23% ↑ |
| 수동 작업 시간 | 120시간/월 | 12시간/월 | 90% ↓ |
| 고객 만족도 | 3.2/5 | 4.6/5 | 44% ↑ |
',
  3,
  12,
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'feature-basic',
  'basic',
  '기본 자동화 패턴',
  'Basic Automation Patterns',
  '
## ⚙️ Workflow Automator 시작하기

### 자동화 생성 단계

**Admin → Workflow Automator → New Automator**

1. **Trigger (트리거)**: 언제 실행?
2. **Condition (조건)**: 어떤 경우에?
3. **Action (액션)**: 무엇을 할 것인가?

### 패턴 1: 자동 티켓 배정

**시나리오:** VIP 고객 티켓은 시니어 엔지니어에게

```
Trigger: Ticket is created
Condition:
  - Requester.VIP_Status = true
Action:
  - Assign to: Senior Engineer Group
  - Priority: High
  - Add note: "VIP 고객 티켓입니다"
```

### 패턴 2: 자동 알림

**시나리오:** 긴급 티켓 생성 시 매니저에게 즉시 알림

```
Trigger: Ticket is created
Condition:
  - Priority = Urgent
Action:
  - Send email to: it-manager@company.com
  - Subject: "[긴급] 새 티켓 생성"
```

### 패턴 3: 자동 필드 업데이트

**시나리오:** 특정 카테고리 선택 시 자동으로 담당 그룹 설정

```
Trigger: Ticket is updated
Condition:
  - Category changed to "Network"
Action:
  - Set Group: Network Team
  - Set Type: Incident
```

### 실습 체크리스트

- [ ] Workflow Automator 메뉴 접근
- [ ] 첫 번째 자동화 규칙 생성
- [ ] 테스트 티켓으로 동작 확인
- [ ] 실행 로그 확인
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
  'd84102b8-c3a1-49de-878d-d03be03e1388',
  'feature-advanced',
  'advanced',
  '심화 설정: SLA · 승인 · 통합',
  'Advanced Settings: SLA, Approval, Integration',
  '
## 🚀 고급 자동화 기능

### 1. SLA 기반 자동화

**SLA Escalation Policy:**
```
Event: SLA Due Date approaching (2 hours before)
Condition: Resolution SLA < 2 hours remaining
Actions:
  1. Escalate to: Manager
  2. Change Priority: Urgent
  3. Send SMS to: Assigned Agent
  4. Add watchers: [Team Lead, Department Head]
```

### 2. 승인 워크플로우 (Approval Automation)

**멀티 레벨 승인:**
```yaml
Trigger: Service Request submitted
Conditions:
  - Item: "New Laptop"
  - Estimated Cost > $1000

Approval Chain:
  Level 1:
    Approver: Direct Manager
    Timeout: 24 hours
    If rejected: Close ticket
    If timeout: Auto-escalate

  Level 2:
    Approver: IT Director
    Timeout: 48 hours
    If approved: Trigger procurement workflow
    If rejected: Notify requester
```

### 3. Orchestration (외부 시스템 연동)

**API 연동 예시 - AD 계정 생성:**

```javascript
// Orchestration Workflow
{
  "trigger": "Service Request Approved",
  "condition": "Item = New Employee Onboarding",
  "actions": [
    {
      "type": "api_call",
      "endpoint": "https://api.company.com/ad/create-user",
      "method": "POST",
      "body": {
        "username": "{{ticket.requester.email}}",
        "firstname": "{{ticket.custom_field.first_name}}",
        "lastname": "{{ticket.custom_field.last_name}}",
        "department": "{{ticket.requester.department}}"
      },
      "on_success": {
        "update_ticket": {
          "status": "In Progress",
          "note": "AD 계정 생성 완료: {{response.username}}"
        }
      },
      "on_failure": {
        "update_ticket": {
          "status": "Pending",
          "note": "AD 계정 생성 실패. IT 팀 확인 필요"
        },
        "notify": "it-admin@company.com"
      }
    }
  ]
}
```

### 4. 조건부 로직 (Advanced Conditions)

**복합 조건:**
```
(Priority = High OR Priority = Urgent)
AND
(Requester.Department = "Sales" OR Requester.VIP = true)
AND
Business Hours = true
AND
Agent.Available_Capacity > 5
```

### 5. 자동화 성과 측정

**Automation Dashboard에서 확인:**
| 지표 | 측정 방법 |
|------|-----------|
| 실행 횟수 | Admin → Automations → Usage Stats |
| 성공률 | Success Rate % |
| 평균 실행 시간 | Avg Execution Time |
| 오류 로그 | Error Logs 탭 |

**최적화 팁:**
1. 실행 빈도가 낮은 규칙은 비활성화
2. 오류율 > 10% 규칙은 조건 재검토
3. 실행 시간 > 30초 규칙은 액션 분리 검토
',
  5,
  12,
  true
);

-- 6. Practice
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
  '실습 시나리오: 승인 필요 요청 자동화',
  'Practice: Approval Request Automation',
  '
## 💼 실습 과제: 노트북 구매 승인 자동화

### 시나리오
직원이 노트북 구매를 요청하면:
1. 50만원 미만 → 팀장 승인만 필요
2. 50만원 이상 → 팀장 + IT 디렉터 승인 필요
3. 승인 완료 시 구매팀에 자동 배정
4. 반려 시 요청자에게 사유 통지

---

### Step 1: Service Catalog Item 생성

**Admin → Service Catalog → New Item**

```yaml
Item Name: 노트북 구매 요청
Category: Hardware
Fields:
  - 모델명 (Text)
  - 사양 (Dropdown: Basic, Standard, Premium)
  - 예상 금액 (Number)
  - 사용 목적 (Textarea)
```

---

### Step 2: Approval Policy 설정

**Admin → Approval → New Policy**

**Policy 1: 팀장 승인 (50만원 미만)**
```
Condition: 예상 금액 < 500000
Approver: Requester의 Manager
Approval Type: Manual
Timeout: 2 days
```

**Policy 2: 이중 승인 (50만원 이상)**
```
Condition: 예상 금액 >= 500000
Approval Levels:
  Level 1: Requester의 Manager (2일)
  Level 2: IT Director (3일)
```

---

### Step 3: Workflow Automator 설정

**Automation 1: 승인 완료 시 구매팀 배정**

```
Trigger: Service Request Approval Status Changed
Condition:
  - Approval Status = Approved
  - Item = "노트북 구매 요청"
Actions:
  - Assign to Group: Procurement Team
  - Status: Open
  - Priority: Medium
  - Add note: "승인 완료. 구매 진행 바랍니다."
```

**Automation 2: 반려 시 요청자 통지**

```
Trigger: Service Request Approval Status Changed
Condition:
  - Approval Status = Rejected
Actions:
  - Status: Closed
  - Add note: "승인 반려: {{approval.rejection_reason}}"
  - Send email to Requester:
      Subject: "노트북 구매 요청이 반려되었습니다"
      Body: "반려 사유: {{approval.rejection_reason}}"
```

---

### Step 4: 테스트

**테스트 케이스 1: 40만원 노트북**
- [ ] 요청 생성
- [ ] 팀장에게만 승인 요청 전송 확인
- [ ] 승인 후 구매팀 배정 확인

**테스트 케이스 2: 150만원 노트북**
- [ ] 요청 생성
- [ ] 팀장 승인 → IT 디렉터 승인 순서 확인
- [ ] 최종 승인 후 구매팀 배정 확인

**테스트 케이스 3: 반려**
- [ ] 팀장이 반려
- [ ] 요청자에게 이메일 전송 확인
- [ ] 티켓 자동 Close 확인

---

### 체크리스트

- [ ] Service Catalog Item 생성 완료
- [ ] Approval Policy 2개 생성 완료
- [ ] Workflow Automator 2개 생성 완료
- [ ] 테스트 3건 모두 성공
- [ ] Automation 실행 로그 확인

---

### 다음 단계

이 패턴을 응용하여:
- 📱 모바일 기기 구매
- 💳 법인카드 발급
- 🏢 회의실 예약
- 🚗 차량 배정

등 다양한 승인 프로세스에 적용 가능합니다.
',
  6,
  15,
  true
);
