---
name: split-work
description: Splits current project work into parallel-safe task groups with worktree branch names and structured starting prompts. Use only on manual /split-work invocation — no automatic trigger.
model: opus
context: fork
agent: work-status
allowed-tools: Read, Glob, Grep, Bash
---

# Split Work

시니어 개발자가 주니어들에게 업무를 분담하듯, 현재 프로젝트 작업을 충돌 없는 병렬 묶음으로 쪼개고 각 묶음의 worktree 시작 프롬프트를 생성한다.

## 인수

- 없음 → 프로젝트 전체 대상
- `phase-N` 또는 task 번호 목록 → 해당 범위만

## Phase 1 — 현황 수집

`tasks/`, `specs/`, `DEPENDENCIES.md`, `git worktree list`, 최근 커밋을 읽는다. `scripts/task-status.ts` 같은 상태 스크립트가 있으면 먼저 실행.

## Phase 2 — 병렬성 판단

각 후보의 `depends_on` 충족 + 파일/패턴 충돌 여부로 그룹화. **같은 그룹의 task 는 동시에 worktree 를 열어도 안전해야 한다.**

## Phase 3 — 브랜치명 추천

`git log` 로 기존 컨벤션 확인 후 `worktree-task-{번호}` 또는 `worktree-task-{범위}x` 제안.

## Phase 4 — 프롬프트 생성

[templates/prompt.xml](templates/prompt.xml) 을 읽어 각 task 에 채운다.

## Phase 5 — 파일 저장

[templates/output.md](templates/output.md) 포맷대로 채운 전문을 저장:

```
~/.claude/split-work/{project-slug}/{YYYY-MM-DD-HHmm}.md
```

`{project-slug}` 는 worktree 안에서도 main repo 기준으로 결정:

```bash
# --path-format=absolute 로 워크트리에서도 main repo 의 .git 절대 경로를 얻는다.
git_common_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
main_repo="$(dirname "$git_common_dir")"
slug="$(basename "$(dirname "$main_repo")")-$(basename "$main_repo")"
# 예: ~/works/runner/web → runner-web
```

- basename 만 쓰면 `web` 같은 generic 이름이 다른 repo 와 충돌 — 부모 한 단계를 결합한다.
- **`--path-format=absolute` 를 빠뜨리지 말 것.** 워크트리 안에서 `git_common_dir` 가 `../../.git` 상대 경로가 되어 슬러그가 `.-.` 으로 망가진다.
- 디렉토리 없으면 `mkdir -p`. 타임스탬프는 KST 기준.

## Phase 6 — 출력

저장한 파일의 **전체 내용을 그대로** 반환. 맨 앞에 `💾 저장됨: <절대경로>` 한 줄 추가.

## 출력 규칙 (호출자 assistant 에게)

이 스킬 결과는 **fork 컨텍스트** 에서 반환되어 사용자에겐 직접 보이지 않는다. 호출자 assistant 는:

- `<task>...</task>` XML 블록 **축약·요약·생략 금지** — 사용자가 다음 worktree 첫 메시지로 그대로 복사하는 원본이다.
- "위 결과에 포함됨" / "XML 로 첨부됨" 같은 참조 문구로 대체 금지.
- 응답 길이상 부득이 축약한다면 **반드시 `💾 저장됨` 경로를 노출** 해 파일을 직접 열 수 있게 한다.

## 자유도 원칙

구현 에이전트의 판단 영역을 침범하지 않는다. "어떻게" 는 에이전트가 스펙을 읽고 스스로 결정한다.

- **금지:** 파일 경로·함수명·라이브러리·구현 순서 지시
- **허용:** 사용자 가치·성공 기준·절대 제약(API 계약·보안·순수성·롤백성)·스펙 참조 위치
