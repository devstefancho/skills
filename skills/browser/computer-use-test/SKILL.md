---
name: computer-use-test
description: "Computer Use MCP로 앱 테스트 시나리오 실행 및 UI/UX 피드백 리포트 생성. Trigger: computer use 테스트, 앱 테스트, UI 테스트, cu test, computer use test, 앱 QA"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
context: main
agent: general-purpose
---

# Computer Use Test

Computer Use MCP를 사용하여 앱의 사용 시나리오를 실행하고, 기능/UI·UX 문제를 발견하여 구조화된 피드백 리포트를 생성한다.

## Principles

1. **Scenario-driven** - 사전 작성된 시나리오 기반으로 테스트를 진행한다. 시나리오가 없으면 먼저 생성한다.
2. **Template-driven** - 시나리오, 피드백, 리포트 모두 정해진 템플릿을 따른다. 자유 형식 금지.
3. **Screenshot evidence** - 이슈 발견 시 반드시 스크린샷을 촬영하여 증거를 남긴다.
4. **Ad-hoc complements scenario** - 시나리오 테스트 후 반드시 자유 탐색을 수행하여 누락된 이슈를 보완한다.
5. **Non-blocking execution** - 스텝 실패 시 이슈를 기록하고 다음 스텝으로 계속 진행한다. 테스트 전체를 중단하지 않는다.

## Known Issues (from past experience)

Computer Use MCP 사용 시 알려진 문제들:
- **request_access 타임아웃**: 리모트 환경에서 데스크톱 권한 승인 팝업 확인 불가. 재시도로 해결.
- **세션 만료**: 장시간 대기 후 세션 리셋 발생. request_access 재요청 필요.
- **멀티모니터**: switch_display로 앱이 있는 모니터로 전환 필요.
- **메뉴바 auto-hide**: 마우스를 y=0으로 이동 후 1초 대기해야 메뉴바 표시됨.
- **앱 실행**: open -a 명령 시 dangerouslyDisableSandbox: true 필요할 수 있음.

## Directory Rules

테스트 산출물은 대상 프로젝트 루트에 저장:
- 시나리오: `test-cases/{app-name}/{scenario-name}.md`
- 리포트: `test-cases/{app-name}/reports/{YYYY-MM-DD}-report.md`
- 1-depth 서브디렉토리만 허용
- 파일명: lowercase-with-hyphens

## Workflow

### Phase 1: Setup

1. 대상 앱 정보를 확인한다
   - 사용자가 앱 이름과 실행 방법(URL 또는 앱 이름)을 제공하지 않았으면 `AskUserQuestion`으로 질문
2. Computer Use MCP가 활성화되어 있는지 확인한다
   - `/mcp`에서 computer use가 활성화되어 있어야 함
   - `request_access`로 접근 권한을 요청한다
   - 타임아웃 발생 시 최대 3회 재시도
3. 프로젝트 내 `test-cases/` 디렉토리를 탐색한다
   - `Glob test-cases/**/*.md`로 기존 시나리오 확인
   - 기존 시나리오 유무에 따라 Phase 2 분기

### Phase 2: Scenario Preparation

**기존 시나리오가 있는 경우:**
1. 기존 시나리오 목록을 사용자에게 보여준다
2. `AskUserQuestion`으로 선택 요청:
   - "기존 시나리오 그대로 실행"
   - "기존 시나리오 보완 후 실행"
   - "신규 시나리오 추가 생성"
3. 선택에 따라 시나리오 파일을 읽거나 수정/생성

**기존 시나리오가 없는 경우:**
1. 앱의 코드베이스를 탐색하여 주요 기능을 파악한다
   - 웹앱: 라우트, 컴포넌트, 페이지 구조 확인
   - 네이티브앱: 주요 화면, 메뉴 구조 확인
2. 시나리오 템플릿을 읽는다: [templates/scenario-template.md](templates/scenario-template.md)
3. 주요 사용 흐름별로 시나리오를 생성한다
   - 예: basic-flow, error-handling, navigation, data-input
4. `test-cases/{app-name}/` 디렉토리에 시나리오 파일을 저장한다
5. 생성된 시나리오를 사용자에게 보여주고 확인을 받는다

### Phase 3: Scenario Execution

각 시나리오 파일을 순서대로 실행한다:

1. 시나리오 파일을 읽는다
2. Preconditions를 확인하고 앱을 실행한다
3. Steps 테이블의 각 행을 순서대로 실행:
   a. Computer Use MCP로 Action을 수행한다
   b. 스크린샷을 촬영한다
   c. Expected Result와 실제 화면을 비교한다
   d. 불일치 발견 시:
      - 피드백 템플릿을 읽는다: [templates/feedback-template.md](templates/feedback-template.md)
      - 이슈 항목을 메모리에 기록한다 (ID는 F-001부터 순차 부여)
      - Severity와 Category를 판단한다
   e. 다음 스텝으로 계속 진행한다 (실패해도 중단하지 않음)
4. 시나리오 완료 시 결과를 요약한다 (통과/실패 스텝 수)

### Phase 4: Ad-hoc Exploration

시나리오 테스트 완료 후 자유 탐색을 수행한다:

1. 시나리오에서 커버하지 못한 영역을 식별한다
   - 엣지 케이스 (빈 입력, 긴 텍스트, 특수문자 등)
   - UI 일관성 (폰트, 색상, 간격, 정렬)
   - 반응성 (버튼 피드백, 로딩 상태, 전환 애니메이션)
   - 접근성 (키보드 네비게이션, 포커스 표시)
   - 에러 상태 (네트워크 끊김, 잘못된 입력)
2. 각 탐색에 대해 기록한다:
   - **Exploration**: 무엇을 탐색했는지
   - **Intent**: 왜 이것을 탐색했는지
   - **Finding**: 발견한 것 (이슈 또는 "정상")
3. 이슈 발견 시 피드백 항목에 추가한다 (Scenario 필드에 "ad-hoc" 표기)

### Phase 5: Report

1. 리포트 템플릿을 읽는다: [templates/report-template.md](templates/report-template.md)
2. 모든 수집된 정보를 채운다:
   - Summary: 전체 테스트 결과 1-3문장 요약
   - Scenario Results: 각 시나리오별 통과/실패 통계
   - Issues: 모든 피드백 항목 (시나리오 + ad-hoc)
   - Ad-hoc Exploration: 수행한 자유 탐색 내역 전체
   - Recommendations: 우선순위별 개선 제안
3. `test-cases/{app-name}/reports/{YYYY-MM-DD}-report.md`에 저장한다
4. 리포트 요약을 사용자에게 출력한다:
   - 총 이슈 수 (severity별 breakdown)
   - 가장 중요한 이슈 3개
   - 리포트 파일 경로
