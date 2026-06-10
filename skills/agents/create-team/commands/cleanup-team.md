---
description: 팀원 종료 및 팀 정리. 인자 없으면 팀원 목록을 보여주고 선택.
argument-hint: [--all | --unused | --default]
allowed-tools: Bash, SendMessage, TaskList, TaskGet, TeamDelete, Read, AskUserQuestion
---

# Cleanup Team

작업이 완료된 팀원을 종료하고 팀 리소스를 정리한다.

## Arguments

- **(없음)**: 인터랙티브 모드 — 팀원 목록 + 상태를 보여주고 종료 대상 선택
- `--all`: 모든 teammate 종료 + TeamDelete로 팀 삭제
- `--unused`: 활성 태스크 없는 teammate만 종료, 팀 유지
- `--default`: 초기 멤버(planner, implementer)만 유지하고 나머지 추가 팀원 종료

## Workflow

### Step 1: 팀 이름 파악

Run `git branch --show-current` to get the current branch name. Convert to team name:
- Remove `worktree-` prefix if present
- Replace `+` with `-`
- Example: `worktree-feat+electron-app` → `feat-electron-app`

### Step 2: 팀 설정 읽기

Read `~/.claude/teams/{team-name}/config.json` to get the member list.
Extract all non-lead members (filter out `team-lead`).

If the file does not exist or the team has no non-lead members:
- Report "팀을 찾을 수 없거나 종료할 팀원이 없습니다" and stop.

### Step 3: 태스크 상태 확인

Call `TaskList` to retrieve all tasks with their status and owner fields.

Build a per-teammate summary:
- For each teammate, collect tasks where `owner` matches
- Classify:
  - **active**: has any task with status `in_progress` or `pending`
  - **idle**: all owned tasks are `completed`, or owns zero tasks

### Step 4: 대상 결정

Based on the argument:

**`--all`**: Target ALL non-lead teammates.

**`--unused`**: Target only "idle" teammates (skip "active" ones).

**`--default`**: Target all non-lead teammates EXCEPT `planner` and `implementer`. Keep only the two initial members.

**(no argument — interactive mode)**:
Display teammate list with status using `AskUserQuestion`:

```
현재 팀원 상태:
1. planner — idle (완료 3개, 활성 0개)
2. implementer — active (진행중 1개, 대기 2개)
3. researcher — idle (태스크 없음)

종료할 팀원 번호를 선택하세요 (쉼표로 복수 선택, "all"로 전체):
```

Wait for user input and target the selected teammates.

If no teammates are targeted, report "종료할 팀원이 없습니다" and stop.

### Step 5: 종료 요청

For each targeted teammate, send a shutdown request via `SendMessage`:

```json
{
  "to": "{teammate-name}",
  "message": {"type": "shutdown_request", "reason": "Team cleanup requested"}
}
```

Send all shutdown requests **in parallel** (multiple SendMessage calls in one turn).

### Step 6: TeamDelete (전체 종료 시에만)

If ALL non-lead teammates were targeted (either via `--all` or user selected all in interactive mode):
- Call `TeamDelete` to remove team config and task directories
- If TeamDelete fails (active members still present), report: "일부 팀원이 아직 종료되지 않았습니다. 잠시 후 다시 시도해주세요."

If some teammates remain, skip TeamDelete.

### Step 7: 결과 보고

Display a cleanup summary table:

```
| Teammate     | 상태      | 조치              |
|--------------|-----------|-------------------|
| planner      | idle      | 종료 요청 완료     |
| implementer  | active    | 건너뜀 (--unused) |
| researcher   | idle      | 종료 요청 완료     |

팀 삭제: 아니오 (활성 팀원 존재)
```

## Notes

- Shutdown은 비동기 — SendMessage `shutdown_request` 전송 후 teammate가 승인하면 프로세스 종료
- TeamDelete는 shutdown 직후 호출 시 실패할 수 있음 (teammate 프로세스가 아직 살아있을 수 있음)
- 초기 멤버 목록 (planner, implementer)은 create-team 스킬의 기본 구성을 기준으로 함
