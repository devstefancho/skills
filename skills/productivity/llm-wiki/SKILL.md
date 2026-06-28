---
name: llm-wiki
description: Maintains an LLM-powered 3-layer personal wiki (raw → wiki → schema) from raw sources. Use when user mentions wiki init, wiki ingest, wiki query, wiki lint, wiki update, 위키 초기화, 위키 추가, 위키 질문, 위키 검사, 위키 업데이트, or wants to build a knowledge base from sources.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, AskUserQuestion
context: fork
agent: general-purpose
metadata:
  public: true
---

# LLM Wiki

3-layer (raw → wiki → schema) 개인 위키. **이 파일은 라우터다** — operation 본문은 `operations/{op}.md`에 있고, 의도 분류 후 그 파일만 Read한다.

## Phase 0 — Config & Wiki Discovery

모든 op 시작 전 1회 수행. 결과로 `wiki_root`(절대 경로)와 `wiki_exists`(SCHEMA.md 존재 여부)를 갖춘다.

1. 이 SKILL.md와 같은 디렉토리의 `config.json` 확인 (템플릿은 `config.example.json`). 없으면 `AskUserQuestion`으로 위키 루트 경로를 받는다 (빈 응답이면 `~/wiki` 기본). 받은 값을 `{ "wiki_root": "<path>" }`로 작성.
2. `wiki_root`의 `~`를 절대 경로로 확장.
3. `{wiki_root}/SCHEMA.md` 존재 여부 확인 → `wiki_exists`.

## Routes

| 발화 | op |
|---|---|
| "wiki init", "위키 초기화", "위키 만들어" | init |
| URL/파일 경로/"ingest"/"위키 추가"/"이거 읽어줘" — 단 wiki_root 안의 기존 파일 경로면 update 우선 | ingest |
| 위키 내용 질문/"wiki query"/"위키에서 찾아줘" | query |
| "wiki lint"/"위키 검사"/"위키 건강 체크" | lint |
| "wiki update"/"위키 수정"/특정 페이지 + 변경 의도 | update |

모호하면 `AskUserQuestion`으로 ingest/query/lint/update 중 선택.

## Dispatch

1. **op이 `init`이 아닌데 `wiki_exists=false`면 진행하지 않는다.** "위키가 없습니다. `wiki init`을 먼저 실행해주세요." 안내 후 종료.
2. `operations/{op}.md`를 Read하고 파일의 절차를 그대로 따른다 (모든 op는 Phase 0 결과와 `wiki_exists=true`를 prereq로 가정 — init만 false에서 시작).
3. op 파일의 `<refs>`가 명시한 PRINCIPLES.md 섹션만, 그 시점에 Read. "섹션"은 `## <name>` 헤딩 한 블록 (다음 `## ...` 직전까지).
