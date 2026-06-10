---
description: 기존 팀에 새 팀원을 추가. 역할 카탈로그에서 선택하거나 커스텀 역할 생성.
argument-hint: [role-name]
allowed-tools: Bash, Agent, SendMessage, TaskCreate, TaskList, TaskUpdate, Read, AskUserQuestion
---

# Expand Team

기존 agent team에 새 팀원을 추가한다. 역할 카탈로그를 보여주고 작업에 맞는 역할을 추천한다.

## Role Catalog

| # | Role | Description | Best For |
|---|------|-------------|----------|
| 1 | **tester** | 테스트 작성, 커버리지 분석, edge case 탐지 | 구현 완료 후 품질 검증 |
| 2 | **reviewer** | 코드 리뷰, 보안/성능/가독성 체크 | PR 전 코드 품질 게이트 |
| 3 | **researcher** | 코드베이스 탐색, 기술 조사, 문서 정리 | 새 기술 도입, 레거시 분석 |
| 4 | **architect** | 시스템 설계, 컴포넌트 구조, API 설계 | 대규모 기능, 리팩토링 |
| 5 | **devops** | CI/CD, Docker, IaC, 배포 자동화 | 인프라 작업, 파이프라인 구축 |
| 6 | **ui-designer** | UI 컴포넌트, 디자인 시스템, 접근성 | 프론트엔드 중심 작업 |
| 7 | **security-auditor** | 보안 취약점 분석, 의존성 CVE 검사 | 보안 감사, 릴리스 전 점검 |
| 8 | **custom** | 사용자 정의 역할 | 위 역할에 없는 특수 작업 |

## Workflow

### Step 1: 팀 이름 파악

Run `git branch --show-current` to get the current branch name. Convert to team name:
- Remove `worktree-` prefix if present
- Replace `+` with `-`
- Example: `worktree-feat+electron-app` → `feat-electron-app`

### Step 2: 팀 설정 확인

Read `~/.claude/teams/{team-name}/config.json` to verify the team exists.
If team does not exist, report "팀이 존재하지 않습니다. 먼저 팀을 생성해주세요." and stop.

### Step 3: 역할 선택

**If a role name is provided as argument** (e.g., `/expand-team tester`):
- Use that role directly. Skip to Step 4.

**If no argument provided** (interactive mode):
1. Check current team members to show who already exists
2. Analyze the current project context:
   - `specs/` directory exists → spec-driven workflow active
   - Test files exist → testing in progress
   - `Dockerfile`, `.github/workflows/`, `terraform/` → infrastructure present
   - `src/components/`, `*.tsx`, `*.vue` → frontend project
3. Based on context, recommend 1-2 roles with rationale
4. Display the role catalog table above with recommendations highlighted
5. Use `AskUserQuestion` to ask:

```
현재 팀원: planner, implementer
추천: tester (구현 후 테스트 검증에 적합)

역할을 선택하세요 (번호, 이름, 또는 "custom"):
```

### Step 4: 팀원 생성

**For catalog roles (1-7)**:

Read the corresponding prompt template from the templates directory:
- tester → `../templates/tester-prompt.md`
- reviewer → `../templates/reviewer-prompt.md`
- researcher → `../templates/researcher-prompt.md`
- architect → `../templates/architect-prompt.md`
- devops → `../templates/devops-prompt.md`
- ui-designer → `../templates/ui-designer-prompt.md`
- security-auditor → `../templates/security-auditor-prompt.md`

Spawn the teammate using the Agent tool:
- `team_name`: the team name
- `name`: the role name (e.g., "tester")
- `description`: role description from catalog
- `prompt`: full content of the prompt template file
- `run_in_background`: true

**For custom role (8)**:

Use `AskUserQuestion` to ask:
1. Role name (kebab-case)
2. Brief description of what this role does
3. What this role should NOT do

Then generate a prompt following the same structure as catalog templates:
- Role description
- Workflow (wait → receive task → execute → report)
- Communication rules (only with team-lead)
- Initial behavior (send ready message)

Spawn the teammate with the generated prompt.

### Step 5: 결과 보고

Display confirmation:

```
✓ tester 팀원이 추가되었습니다.

현재 팀 구성:
| Member | Role |
|--------|------|
| team-lead | 오케스트레이션 |
| planner | spec 작성 |
| implementer | 코드 구현 |
| tester | 테스트 작성 (NEW) |
```

## Notes

- 동일한 역할의 팀원을 중복 추가할 수 없음. 이미 존재하면 알림 후 중단.
- 모든 팀원은 team-lead를 통해서만 소통 (직접 통신 불가)
- 팀원 종료는 `/cleanup-team`을 사용
