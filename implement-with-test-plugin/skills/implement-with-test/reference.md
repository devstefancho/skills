# Reference — implement-with-test

Detail for SKILL.md phases. Same authority as SKILL.md.

## Test framework detection (priority order)

1. Check `package.json` for a `test` script — this tells you how tests are actually run.
2. `vitest.config.*` or `vite.config.*` with test config → vitest.
3. `jest.config.*` or `package.json` with `"jest"` key → jest.
4. `pytest.ini`, `setup.cfg [tool:pytest]`, or `pyproject.toml [tool.pytest]` → pytest.
5. `go.mod` → go test.
6. `Cargo.toml` → cargo test.
7. Nothing detected → ask the user via `AskUserQuestion` (or apply the non-interactive default below).

## Test commands (Phase 6)

- JS/TS: the `test` script from package.json, or `npx vitest run` / `npx jest` with the specific test file.
- Python: `python -m pytest {test_file}`
- Go: `go test ./{package}/...`
- Rust: `cargo test`

## Report section rules (Phase 6)

Fill all five sections of [templates/report-template.md](templates/report-template.md): 완료한 기능 / 기술 구현 / 테스트 / 사용자 조치 필요 / 다음 단계.

- "사용자 조치 필요" 섹션은 env 설정, 마이그레이션, 수동 설치 등 Claude가 실행하지 않은 작업을 명시. 없으면 "없음".
- "다음 단계" 섹션은 관련된 후속 작업 1-3개를 구체적으로 제시.
- Output the completed report as the final message.

## Task document update rules (Phase 7)

Phase 1 argument가 **파일 경로**였을 때만 실행한다. 직접 설명이나 대화 기반 task는 대상 문서가 없으므로 건너뛴다.

목적: 해당 task 문서의 상태를 갱신해 추적 가능하게 만든다. **Surgical edit만 허용** — 요청한 필드/체크박스 외의 내용은 수정·정렬·재포맷하지 않는다.

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

## Error handling

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
