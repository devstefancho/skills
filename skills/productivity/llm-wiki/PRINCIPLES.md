# LLM Wiki Principles

각 operation은 `<refs>`로 필요한 섹션만 명시한다. 미리 다 읽지 않는다.

## architecture

위키는 단일 그래프다. `[[slug]]` 교차 참조가 한 그래프 안에서만 유효하므로 위키를 쪼개지 않는다.

- **`raw/`** — 원본 자료 (논문/기사/URL/트랜스크립트/노트). `raw/{slug}.md` 또는 `raw/{slug}.{ext}` (PDF·이미지 등 binary는 동반 `raw/{slug}.meta.md`에 메타 헤더). 추가만 가능, 수정/삭제 금지.
- **`wiki/`** — LLM이 컴파일·유지보수.
  - `wiki/index.md` — 페이지 카탈로그
  - `wiki/overview.md` — 위키 요약
  - `wiki/log.md` — append-only 작업 이력
  - `wiki/pages/{slug}.md` — flat (하위 디렉토리 없음)
- **`SCHEMA.md`** — 위키 정체성. Phase 0의 발견 진입점.

## page-types

- `source` — 원본 요약 (논문, 기사, 영상, 코드)
- `entity` — 사람, 조직, 도구, 기술
- `concept` — 아이디어, 패턴, 원칙
- `index`, `overview` — 시스템 페이지. 각 템플릿에서만 사용

`source` vs `entity` vs `concept`은 페이지가 "무엇을 다루는가"로 판단 — 원본 자체가 주제면 source, 인물/조직/도구가 주제면 entity, 그 외 추상 개념이면 concept.

## frontmatter

```yaml
---
title: ...
slug: ...
type: source|entity|concept|index|overview
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [slug, ...]   # optional
tags: [tag, ...]       # optional
---
```

필수: `title`, `slug`, `type`, `created`, `updated`. lint 스크립트는 이 5개만 검증한다.

## wikilink

- `[[slug]]` → `wiki/pages/{slug}.md`
- `[[slug|표시]]` 커스텀 표시
- `[[slug#anchor]]` 섹션 앵커 (slug 부분으로만 해석)
- 외부 URL은 일반 마크다운 링크
- `slug` = 파일명에서 `.md` 제외

## bidirectional

A가 `[[B]]`를 쓰면 B의 Related 섹션에도 `[[A]]`가 있어야 한다. ingest/update가 페이지를 변경한 직후 `scripts/lint_wiki.py {wiki_root} --json`을 실행해 `missing_backlink`가 0이 될 때까지 보강한다.

## slug-rules

정규식 `^[a-z0-9][a-z0-9-]{0,49}$` (소문자 영숫자·하이픈, 첫 글자 영숫자, 1~50자).

LLM이 직접 생성한다 — 한글/CJK는 의미가 통하는 영어로 transliterate (예: "어텐션 메커니즘" → `attention-mechanism`, "Café" → `cafe`). 기존 페이지와 충돌하면 `-2`, `-3`을 붙인다. 50자 제한은 충돌 접미사 포함 후의 길이.

## immutability

1. `raw/` 추가만 (수정/삭제 금지)
2. `log.md` append-only — 기존 항목 수정/삭제 금지. **추가는 `scripts/append_log.py`** (단, 위키 최초 생성 시 init이 직접 작성하는 첫 항목은 예외)
3. `SCHEMA.md` 사용자 명시 확인 없이 수정 금지
4. `wiki/pages/` flat — 하위 디렉토리 금지

## log-format

```
scripts/append_log.py <wiki_root> <op> "<description>"
```

- `<op>` ∈ `init|ingest|query|lint|update`
- `<description>` 한 줄 (개행 금지 — 스크립트가 거부)
- 본문 bullet은 stdin으로 전달 (heredoc)
