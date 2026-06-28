---
name: computer-use-test
description: Runs app test scenarios through Computer Use MCP and produces a structured UI/UX feedback report with screenshot evidence. Use when the user says computer use 테스트, 앱 테스트, UI 테스트, cu test, computer use test, or 앱 QA.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
context: main
agent: general-purpose
metadata:
  public: true
---

# Computer Use Test

Computer Use MCP로 앱의 사용 시나리오를 실행하고, 기능/UI·UX 이슈를 구조화된 피드백 리포트로 만든다.

## 원칙

- **Scenario-driven** — 사전 작성된 시나리오 기반. 없으면 먼저 생성한다.
- **Template-driven** — 시나리오·피드백·리포트 모두 정해진 템플릿을 따른다. **자유 형식 금지.**
- **Screenshot evidence** — 이슈 발견 시 반드시 스크린샷으로 증거를 남긴다.
- **Non-blocking** — 스텝 실패 시 이슈만 기록하고 다음 스텝으로 진행한다. **테스트 전체를 중단하지 않는다.**

MCP 동작 이슈(타임아웃·세션 만료·멀티모니터 등)는 [known-issues.md](known-issues.md) 참조.

## 산출물 위치 (대상 프로젝트 루트)

- 시나리오 — `test-cases/{app-name}/{scenario-name}.md`
- 리포트 — `test-cases/{app-name}/reports/{YYYY-MM-DD}-report.md`
- 1-depth 서브디렉토리만 허용, 파일명은 lowercase-with-hyphens

## Phase 1 — Setup

- [ ] 앱 이름과 실행 방법(URL 또는 앱 이름) 확보 — 없으면 `AskUserQuestion`
- [ ] Computer Use MCP 활성 확인(`/mcp`) 후 `request_access` — 타임아웃 시 최대 3회 재시도
- [ ] `Glob test-cases/**/*.md`로 기존 시나리오 확인 → Phase 2 분기

## Phase 2 — Scenario Preparation

**기존 시나리오가 있으면** 목록을 보여주고 `AskUserQuestion`으로 택1 — 그대로 실행 / 보완 후 실행 / 신규 추가 생성.

**없으면**:

- [ ] 코드베이스 탐색으로 주요 기능 파악 (웹앱은 라우트·컴포넌트·페이지, 네이티브앱은 화면·메뉴)
- [ ] [templates/scenario-template.md](templates/scenario-template.md)를 따라 주요 흐름별 시나리오 생성 (예: basic-flow, error-handling, navigation, data-input)
- [ ] `test-cases/{app-name}/`에 저장하고 사용자 확인을 받는다

## Phase 3 — Scenario Execution

각 시나리오 파일을 순서대로:

1. 시나리오를 읽고 Preconditions 확인 → 앱 실행
2. Steps 테이블 각 행 — Action 수행 → 스크린샷 촬영 → Expected Result와 실제 화면 비교
3. 불일치 시 [templates/feedback-template.md](templates/feedback-template.md)를 따라 이슈 기록 (ID는 F-001부터 순차, Severity·Category 판단) — **기록 후 다음 스텝 계속**
4. 시나리오 완료 시 통과/실패 스텝 수 요약

## Phase 4 — Ad-hoc Exploration

**시나리오만 돌리고 끝내지 않는다.** 커버하지 못한 영역을 자유 탐색:

- 엣지 케이스 (빈 입력, 긴 텍스트, 특수문자) / UI 일관성 (폰트, 색상, 간격, 정렬) / 반응성 (버튼 피드백, 로딩, 전환) / 접근성 (키보드 네비게이션, 포커스) / 에러 상태 (네트워크 끊김, 잘못된 입력)
- 탐색마다 **Exploration**(무엇을) / **Intent**(왜) / **Finding**(발견, 이슈 또는 "정상") 기록
- 이슈는 피드백 항목에 추가 (Scenario 필드에 "ad-hoc" 표기)

## Phase 5 — Report

- [ ] [templates/report-template.md](templates/report-template.md)를 채운다 — Summary(1-3문장), Scenario Results(시나리오별 통과/실패), Issues(시나리오 + ad-hoc 전체), Ad-hoc Exploration 내역, Recommendations(우선순위별)
- [ ] `test-cases/{app-name}/reports/{YYYY-MM-DD}-report.md`에 저장
- [ ] 사용자에게 요약 출력 — 총 이슈 수(severity별), 가장 중요한 이슈 3개, 리포트 경로

## Anti-patterns

- **WRONG**: 스텝 실패 → 테스트 중단. **RIGHT**: 이슈 기록 후 다음 스텝 진행.
- **WRONG**: 자유 형식으로 리포트 작성. **RIGHT**: 템플릿 3종을 그대로 채운다.
- **WRONG**: 스크린샷 없이 이슈만 서술. **RIGHT**: 모든 이슈에 스크린샷 증거 첨부.
