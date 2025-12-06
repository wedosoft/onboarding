-- Freshservice Asset Management (CMDB) Module - Complete remaining 3 sections
-- Module ID: 7a87a6ff-9f2c-4d43-81c9-a7ea08051baf
-- Current: 3 sections (overview/basic, overview/intermediate, concept/basic)
-- Adding: feature-basic, feature-advanced, practice

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
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'feature-basic',
  'basic',
  '자산 등록 및 관리 기초',
  'Asset Registration and Basic Management',
  '
## 💻 자산 등록 시작하기

### 자산 유형 (Asset Types)

Freshservice 기본 제공 자산 유형:

| 유형 | 예시 | 주요 필드 |
|------|------|-----------|
| **Hardware** | 노트북, 데스크톱, 서버 | 제조사, 모델, 시리얼 번호 |
| **Software** | MS Office, Adobe CC | 라이선스 키, 버전, 만료일 |
| **Mobile** | iPhone, iPad, Android | IMEI, 전화번호, 통신사 |
| **Network** | 라우터, 스위치, 방화벽 | IP주소, MAC주소, 위치 |

### 자산 등록 방법

**방법 1: 수동 등록**
```
Admin → Assets → Add Asset
1. Asset Type 선택
2. 필수 정보 입력:
   - Asset Name (예: MacBook Pro M2)
   - Asset Tag (예: IT-LAP-001)
   - Serial Number
   - Assigned To (사용자)
3. 추가 정보:
   - Department
   - Location
   - Purchase Date
   - Warranty Expiry
```

**방법 2: CSV 대량 등록**
```
Admin → Assets → More → Import Assets
1. 샘플 CSV 다운로드
2. 정보 입력:
   - Name, Asset Tag, Serial Number
   - User Email (자동 매핑)
3. CSV 업로드
4. 매핑 확인 후 Import
```

**방법 3: Agent 기반 자동 탐지**
```
Admin → Assets → Discovery → Install Agent
- Windows/Mac/Linux 에이전트 배포
- 자동으로 H/W, S/W 정보 수집
- 변경 사항 자동 업데이트
```

### 필수 필드 vs 선택 필드

**필수 (Mandatory):**
- Asset Name
- Asset Type
- Asset Tag (고유 식별자)

**권장 (Recommended):**
- Serial Number (중복 구매 방지)
- Assigned To (책임 추적)
- Purchase Date (감가상각 계산)
- Warranty Expiry (유지보수 계획)

### 자산 상태 (Asset State)

| 상태 | 의미 | 다음 단계 |
|------|------|-----------|
| **In Stock** | 창고 보관 중 | 배정 대기 |
| **In Use** | 사용자에게 배정됨 | 정상 사용 중 |
| **In Transit** | 이동 중 | 수령 대기 |
| **In Repair** | 수리 중 | 복구 후 재배정 |
| **Retired** | 폐기/처분 | 자산 제거 |
| **Missing** | 분실 | 조사 필요 |

### 빠른 시작 체크리스트

- [ ] Asset Type 확인 (기본 제공 또는 커스텀)
- [ ] Asset Tag 명명 규칙 정의
- [ ] 첫 자산 수동 등록
- [ ] 사용자에게 자산 배정
- [ ] 자산 상세 페이지에서 정보 확인
',
  4,
  10,
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
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'feature-advanced',
  'advanced',
  'CMDB와 관계 관리',
  'CMDB and Relationship Management',
  '
## 🔗 Configuration Management Database (CMDB)

### CMDB란?

IT 자산 간의 **관계**를 추적하는 데이터베이스

**예시 시나리오:**
```
이메일 서버 다운 → 영향 받는 서비스는?

CMDB에서 확인:
Email Server (물리 서버)
  ↓ 호스팅
Exchange Service (애플리케이션)
  ↓ 사용
  - Sales Department (100명)
  - Marketing Department (50명)
  ↓ 연결
  - CRM System
  - Marketing Automation Tool

→ 결론: 150명 + 2개 시스템 영향
```

### CI (Configuration Item) 관계 유형

| 관계 타입 | 설명 | 예시 |
|-----------|------|------|
| **Hosts** | A가 B를 호스팅 | 서버 → 가상머신 |
| **Runs** | A가 B를 실행 | 서버 → 애플리케이션 |
| **Connects** | A와 B가 연결됨 | 앱 ↔ 데이터베이스 |
| **Depends On** | A가 B에 의존 | 웹사이트 → CDN |
| **Uses** | A가 B를 사용 | 팀 → 소프트웨어 |

### CMDB 구축 예시

**시나리오: 웹 서비스 인프라**

```mermaid
graph TD
    A[Physical Server] -->|Hosts| B[VMware ESXi]
    B -->|Runs| C[Web Server VM]
    B -->|Runs| D[DB Server VM]
    C -->|Runs| E[Apache Webserver]
    D -->|Runs| F[MySQL Database]
    E -->|Connects| F
    E -->|Uses| G[CDN Service]
    C -->|Depends On| H[Network Switch]
    D -->|Depends On| H
```

**관계 설정 방법:**
```
1. Asset 상세 페이지 → Relationships 탭
2. Add Relationship 클릭
3. 관계 유형 선택 (예: Runs)
4. 연결할 CI 선택 (예: Apache Webserver)
5. 저장
```

### Impact Analysis (영향 분석)

**물리 서버 장애 시 영향 범위:**
```
Physical Server 다운
  ↓
VMware ESXi 중단
  ↓
Web Server VM 중단
  ↓
Apache Webserver 중단
  ↓
웹사이트 다운
  ↓
고객 1,000명 영향
```

**Freshservice에서 확인:**
```
Asset → Impact View
→ Downstream Dependencies 확인
→ 영향 받는 서비스/사용자 파악
```

### Service Mapping

**비즈니스 서비스와 IT 자산 연결:**

```
[비즈니스 서비스: 온라인 쇼핑몰]
  ├─ [애플리케이션: Web App]
  │   ├─ [서버: Web Server]
  │   └─ [네트워크: Load Balancer]
  ├─ [애플리케이션: Payment Gateway]
  │   ├─ [서버: API Server]
  │   └─ [소프트웨어: PG Solution]
  └─ [데이터베이스: Product DB]
      ├─ [서버: DB Server]
      └─ [스토리지: SAN Storage]
```

**장점:**
- 비즈니스 관점에서 IT 자산 관리
- 장애 발생 시 비즈니스 영향 즉시 파악
- 변경 관리 시 리스크 평가

### Contract Management (계약 관리)

**자산과 계약 연결:**

```
Software Asset: Adobe Creative Cloud
  ↓ 연결
Contract:
  - Vendor: Adobe
  - Contract Type: Subscription
  - Start Date: 2024-01-01
  - End Date: 2024-12-31
  - Cost: $54.99/월 × 50 라이선스
  - Renewal Alert: 30일 전
```

**자동 알림 설정:**
- 계약 만료 30일 전 → IT 매니저 이메일
- 라이선스 사용률 > 90% → 추가 구매 검토

### 고급 활용

**1. Software License Compliance**
```
Total Licenses: 100
Installed: 95
Unused: 5
→ 추가 구매 불필요, 비용 절감
```

**2. Warranty Tracking**
```
Expiring in 30 days: 12 assets
→ 자동 티켓 생성 → 연장 또는 교체 검토
```

**3. Depreciation Tracking**
```
Purchase Price: $2,000
Useful Life: 4 years
Current Value: $1,000 (2년 경과)
→ 교체 예산 계획
```
',
  5,
  15,
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
  '7a87a6ff-9f2c-4d43-81c9-a7ea08051baf',
  'practice',
  'basic',
  '실습: 노트북 자산 관리 전 과정',
  'Practice: Complete Laptop Asset Management',
  '
## 💼 실습 시나리오: 신입사원 노트북 지급

### 시나리오 개요
신입사원 김철수에게 MacBook Pro를 지급하는 전체 프로세스를 자산 관리 시스템에서 처리합니다.

---

## Step 1: 자산 등록

**Admin → Assets → Add Asset**

```yaml
Asset Type: Laptop
Asset Name: MacBook Pro 14" M2
Asset Tag: LAP-2024-001
Serial Number: C02XK0JHJG5H

Hardware Details:
  Manufacturer: Apple
  Model: MacBook Pro 14-inch (2023)
  Processor: Apple M2 Pro
  RAM: 16GB
  Storage: 512GB SSD

Purchase Information:
  Vendor: Apple Korea
  Purchase Date: 2024-01-15
  Purchase Cost: 2,890,000원
  Invoice Number: INV-2024-0115
  Warranty Expiry: 2025-01-14

Location:
  Department: IT
  Location: 서울 본사
  Building: 강남빌딩
  Floor: 10F
  Room: IT 창고

Status: In Stock
```

**체크포인트:**
- [ ] Asset Tag가 고유한지 확인
- [ ] Serial Number 정확히 입력
- [ ] Purchase Cost 기록 (감가상각용)
- [ ] Warranty Expiry 입력 (알림 설정용)

---

## Step 2: 사용자에게 배정

**Asset 상세 → Assign Asset**

```yaml
Assigned To: 김철수 (chulsoo.kim@company.com)
Assignment Date: 2024-02-01
Assignment Type: Permanent
Notes: 신입사원 온보딩 - 개발팀 배정
```

**자동 처리:**
- ✅ Status: In Stock → In Use
- ✅ 김철수에게 이메일 발송:
  ```
  제목: 자산 배정 안내
  내용:
    - Asset: MacBook Pro 14" M2
    - Asset Tag: LAP-2024-001
    - 수령 후 서명 필요
    - 관리 책임: 사용자
  ```

**체크포인트:**
- [ ] 사용자 이메일 정확한지 확인
- [ ] Assignment Date 기록
- [ ] 사용자가 수령 확인 이메일 받았는지 확인

---

## Step 3: 소프트웨어 라이선스 연결

**Asset → Software 탭 → Add Software**

```yaml
Software 1:
  Name: macOS Sonoma
  Version: 14.2
  License Type: OEM
  License Key: (Not required for macOS)

Software 2:
  Name: Microsoft Office 365
  Version: 2024
  License Type: Subscription
  License Key: XXXXX-XXXXX-XXXXX
  Assigned From: Microsoft 365 Contract
  Expiry Date: 2024-12-31

Software 3:
  Name: Slack Desktop
  Version: 4.36
  License Type: Free

Software 4:
  Name: Visual Studio Code
  Version: 1.85
  License Type: Free/OSS
```

**자동 컴플라이언스 체크:**
- Office 365 라이선스 풀: 100개 중 87개 사용 → 13개 남음
- 만료 90일 전 알림 설정 자동 생성

---

## Step 4: CMDB 관계 설정

**Asset → Relationships 탭**

```yaml
Relationship 1:
  Type: Connects To
  CI: WiFi Network - 10F
  Description: 강남빌딩 10층 무선 네트워크

Relationship 2:
  Type: Uses
  CI: VPN Service
  Description: 재택근무 시 VPN 필수

Relationship 3:
  Type: Depends On
  CI: Microsoft 365 Service
  Description: 이메일, Teams 사용

Relationship 4:
  Type: Used By
  CI: Development Team
  Description: 개발팀 소속 자산
```

**Impact View에서 확인:**
```
MacBook Pro (LAP-2024-001) 분실 시 영향:
  → 사용자: 김철수 (업무 중단)
  → 라이선스: Office 365 (재할당 필요)
  → 팀: 개발팀 (프로젝트 지연 가능)
```

---

## Step 5: 계약 정보 연결

**Asset → Contracts 탭 → Link Contract**

```yaml
Contract Name: Apple Care+ for Business
Contract Type: Support & Maintenance
Vendor: Apple Korea
Start Date: 2024-01-15
End Date: 2027-01-14 (3년)
Annual Cost: 290,000원
Coverage:
  - 하드웨어 수리
  - 배터리 교체
  - 전화 지원
```

**자동 알림:**
- 계약 만료 30일 전 → IT 매니저에게 알림
- 옵션: 연장 또는 신규 장비 구매 검토

---

## Step 6: 자산 변경 이력 확인

**Asset → History 탭**

```
Timeline:
2024-01-15: Asset created (In Stock)
2024-02-01: Assigned to 김철수 (In Use)
2024-02-01: Software added: Office 365
2024-02-01: Relationship added: Connects to WiFi
2024-02-01: Contract linked: Apple Care+
```

**변경 사항 자동 기록:**
- 누가 (Who)
- 무엇을 (What)
- 언제 (When)
→ 감사 추적 (Audit Trail)

---

## Step 7: 정기 점검 설정

**Admin → Workflow Automator → New Automator**

```yaml
Name: 분기별 노트북 점검
Trigger: Scheduled (Every 3 months)
Condition:
  - Asset Type = Laptop
  - Status = In Use
Action:
  - Create Ticket:
      Subject: "[정기점검] {{asset.name}} 점검 요청"
      Description: "사용자: {{asset.assigned_user}}"
      Assign to: IT Support Team
      Priority: Low
```

---

## 최종 체크리스트

### 자산 등록
- [x] Asset Tag, Serial Number 등록
- [x] Purchase 정보 입력
- [x] Warranty 정보 입력

### 사용자 배정
- [x] 김철수에게 배정
- [x] Assignment Date 기록
- [x] Status: In Use로 변경

### 소프트웨어 관리
- [x] 설치된 소프트웨어 4개 등록
- [x] Office 365 라이선스 연결
- [x] 라이선스 컴플라이언스 확인

### CMDB 구축
- [x] 네트워크 관계 설정
- [x] 서비스 의존성 설정
- [x] Impact View 확인

### 계약 관리
- [x] Apple Care+ 계약 연결
- [x] 만료 알림 설정

### 자동화
- [x] 정기 점검 자동화 설정

---

## 다음 단계

이 프로세스를 응용하여:

1. **대량 배정**: CSV Import로 50대 노트북 일괄 등록
2. **회수 프로세스**: 퇴사자 자산 회수 및 재배정
3. **수리 추적**: In Repair 상태 관리
4. **폐기 절차**: Retired 처리 및 데이터 삭제 확인

모든 IT 자산의 전체 라이프사이클을 관리할 수 있습니다!
',
  6,
  15,
  true
);
