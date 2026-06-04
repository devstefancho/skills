---
name: implement-with-test
description: Implement a task with tests. Task information comes from an argument (task description or path to a task file) or is inferred from the current conversation. Auto-detects test framework (jest, vitest, pytest, go test, cargo test) and follows existing project patterns. Use when user asks to implement a task, build a feature with tests, or says "implement", "구현", "구현해줘", "테스트와 함께 구현". Proactively trigger whenever the user wants to turn a task or requirement into working code with tests.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
context: main
agent: general-purpose
---

# Implement with Test

Implements a task into production code with accompanying tests. Detects the project's language, test framework, and coding conventions to produce code that fits naturally into the existing codebase.

## Principles

1. **Task-first** - Never start coding without a clear task definition. Extract the task (Purpose / Requirements / Approach / Verification) from the argument or recent conversation before writing any code. This prevents aimless coding and scope creep.

2. **Pattern-follower** - The project already has conventions for imports, naming, directory structure, and test organization. Detect and follow them rather than imposing external conventions. Code that looks foreign to the project creates maintenance burden, even if it's technically correct.

3. **Test-alongside** - Write tests as part of the implementation, not as an afterthought. Each Verification item maps to at least one test. This ensures the tests actually verify what the task intended, not just what happened to get implemented.

4. **Run-to-green** - After writing code and tests, run the test suite. If tests fail, diagnose and fix (up to 3 attempts). Do not report success until tests pass. A green test suite is the definition of "done."

5. **Minimal diff** - Only create or modify files necessary for the task. Do not refactor surrounding code, add unrelated type annotations, or "improve" existing patterns. The goal is a focused, reviewable changeset.

## Workflow

### Phase 1: Task Resolution

Determine what to implement. There are exactly two sources:

1. **Argument provided** — The argument is either:
   - A path to a task/spec file (e.g. `specs/foo.md`, `tasks/bar.md`, any `.md` describing the task) → `Read` the file and parse its content.
   - A direct task description (natural language) → Parse the description in place.

2. **No argument** — Infer the task from the current conversation context. Summarize what the user has asked for across recent turns.

Regardless of source, extract the task into this structure before proceeding:

- **Purpose**: What needs to be done and why (1-2 sentences)
- **Requirements**: Concrete requirements (3-5 bullets)
- **Approach**: Technical approach (2-5 sentences)
- **Verification**: Testable scenarios (2-5 bullets)

Display the extracted task summary to the user for alignment. If the argument was a file, you can skip confirmation unless something was ambiguous. If the task came from conversation, **always confirm** before moving on — conversation-inferred tasks are the most error-prone.

### Phase 2: Project Reconnaissance

Scan the project to understand its conventions. This phase determines how to write code that fits in.

**Language & framework detection:**
- Check for `package.json`, `tsconfig.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`
- Read the relevant config to understand dependencies and project type

**Test framework detection (in priority order):**
1. Check `package.json` for a `test` script — this tells you how tests are actually run
2. `vitest.config.*` or `vite.config.*` with test config → vitest
3. `jest.config.*` or `package.json` with `"jest"` key → jest
4. `pytest.ini`, `setup.cfg [tool:pytest]`, or `pyproject.toml [tool.pytest]` → pytest
5. `go.mod` → go test
6. `Cargo.toml` → cargo test
7. If no framework detected → ask the user via `AskUserQuestion`

**Existing test pattern analysis:**
- Run `Glob **/*.test.* **/*.spec.* **/test_* **/*_test.* **/__tests__/**`
- Read 1-2 existing test files to learn:
  - Import style (ES modules vs CommonJS, relative vs alias paths)
  - Assertion library (expect, assert, chai)
  - Test structure (describe/it nesting, flat test() calls, test class methods)
  - Setup/teardown patterns (beforeEach, fixtures, factories)
  - Mocking approach (jest.mock, vi.mock, unittest.mock, testify)
- Note the test file naming convention: `*.test.ts` vs `*.spec.ts` vs `test_*.py` vs `*_test.go`
- Note the test file location: colocated with source, `__tests__/` directory, or separate `tests/` directory

**Source code pattern analysis:**
- Identify the source directory structure (src/, lib/, app/, etc.)
- Read 1-2 existing source files similar to what will be implemented
- Note import patterns, export style, error handling conventions

### Phase 3: Implementation Planning

Based on the task and reconnaissance:

1. List the production code files to create or modify, with brief descriptions
2. List the test files to create, following the detected naming convention and location pattern
3. Map each Verification item to the test(s) that will cover it

Display the file plan to the user as an informational summary (no confirmation needed — just transparency).

### Phase 4: Code Implementation

Write the production code:

- Follow the Approach for architecture and design decisions
- Match existing code patterns: import style, naming conventions, error handling
- Handle edge cases mentioned in the Requirements
- Keep functions focused — each should do one thing well
- Add only necessary exports for testability

### Phase 5: Test Implementation

Write tests covering the Verification section:

- Use the detected test framework and assertion library
- Follow existing test file patterns (structure, naming, imports)
- Write at least one test per Verification bullet point
- Name tests descriptively — someone reading the test name should understand what's being verified
- Include edge case tests when the Requirements mention them
- Use the same mocking/setup patterns found in existing tests
- Avoid over-mocking: test real behavior where practical

### Phase 6: Verification & Report

1. **Run tests** using the detected test command via `Bash`
   - For JS/TS: use the `test` script from package.json, or `npx vitest run` / `npx jest` with the specific test file
   - For Python: `python -m pytest {test_file}`
   - For Go: `go test ./{package}/...`
   - For Rust: `cargo test`

2. **Handle failures** (max 3 attempts):
   - Read the error output carefully
   - Distinguish between implementation bugs and test bugs
   - Fix the root cause, not the symptom
   - Re-run after each fix

3. **Generate report** using the template: [templates/report-template.md](templates/report-template.md)
   - Fill in all five sections: 완료한 기능 / 기술 구현 / 테스트 / 사용자 조치 필요 / 다음 단계
   - "사용자 조치 필요" 섹션은 env 설정, 마이그레이션, 수동 설치 등 Claude가 실행하지 않은 작업을 명시. 없으면 "없음".
   - "다음 단계" 섹션은 관련된 후속 작업 1-3개를 구체적으로 제시
   - Output the completed report as the final message

### Phase 7: Task Document Update

Phase 1 argument가 **파일 경로**였을 때만 실행한다. 직접 설명이나 대화 기반 task는 대상 문서가 없으므로 이 단계를 건너뛴다.

목적: 해당 task 문서의 상태를 갱신해 추적 가능하게 만든다. **surgical edit만 허용** — 요청한 필드/체크박스 외의 내용은 수정·정렬·재포맷하지 않는다.

1. **Status 결정** (writing-tasks schema 와 호환되는 값을 사용)
   - 모든 Verification 테스트 통과 → `done`
   - 일부만 통과 (3회 재시도 후에도 실패 존재) → `review` (사람이 잔여 항목 확인 필요)
   - 모든 테스트 실패 → `blocked`

2. **Frontmatter 갱신**
   - Frontmatter 존재 (`---` 블록) → `status: {status}` 와 `completed_at: YYYY-MM-DD` 필드를 설정. 해당 키가 이미 있으면 값만 교체, 없으면 추가.
   - Frontmatter 없음 → 파일 맨 위에 YAML frontmatter 블록을 새로 만들지 말 것. 대신 파일 최상단 heading 바로 아래에 `> Status: {status} ({YYYY-MM-DD})` 한 줄을 추가(이미 있으면 교체).

3. **Verification 체크리스트 갱신**
   - 문서에 `- [ ]` 형태의 checklist 항목이 있으면:
     - 해당 항목에 매핑된 테스트가 **통과**한 경우만 `- [x]` 로 변경
     - 실패했거나 매핑 불명확한 항목은 그대로 둔다
   - 체크리스트가 없으면 생성하지 말 것

4. 위 1~3 항목 외의 본문(설명, 섹션, 코드 블록, 기타 frontmatter 필드 등)은 절대 수정하지 않는다.

## Error Handling

| Situation | Action |
|-----------|--------|
| No argument and conversation has no clear task | Ask user what to implement via `AskUserQuestion` |
| Test framework not detected | Ask user which framework to use |
| Existing tests use unfamiliar patterns | Follow patterns as-is; do not "modernize" |
| Tests fail after 3 fix attempts | Report the current state honestly in "테스트" section with error details, and list remaining failures under "다음 단계" |
| Task is ambiguous | Ask user to clarify before implementing |

## Non-interactive defaults

If `AskUserQuestion` is unavailable (auto mode, headless agent, scheduled run), use these defaults and document every defaulted decision in the report so the user can override.

| Decision point | Default | Rationale |
|---|---|---|
| Conversation-inferred task confirmation (Phase 1) | Skip the confirmation. Instead, restate the extracted Purpose/Requirements/Approach/Verification at the top of the Phase 3 plan so the user sees the assumption. | Keeps the workflow flowing while preserving auditability. |
| No argument and no clear conversation task | **Refuse**: report "no implementable task identified, please pass a task file path or describe the work." | Silent guessing produces wrong code. |
| Test framework not detected | Try in order: `python -m pytest --collect-only -q` → `npm test --silent --listTests` → `go test ./... -list .*` → `cargo test --list`. Use the first one that exits 0 with at least one test discovered. If all fail, refuse and report. | Detection order mirrors common project types. |
| Ambiguous task content | Pick the most conservative interpretation (smallest behavior change, fewest new files), and list the assumptions in the "기술 구현" section. | Minimal-diff principle is the project's tie-breaker. |
