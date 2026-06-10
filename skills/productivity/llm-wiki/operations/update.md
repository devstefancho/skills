# operation: update

지식이 바뀌거나 모순이 발생했을 때 위키 페이지를 개정한다.

<refs>PRINCIPLES.md: frontmatter, bidirectional, immutability.</refs>

## 1. 대상 식별

사용자 요청에서 페이지/주제/lint 권고 등을 추출. `Grep {wiki_root}/wiki/pages/`로 후보를 모은다.

## 2. 변경 제안

대상이 1-3개면 페이지마다, 4개 이상이면 묶어서 한 번에 `AskUserQuestion`:

> **{page_title}** (`[[{slug}]]`)
> - 현재: ...
> - 변경: ...
> - 이유: ...

## 3. 편집 적용

`Edit`으로 수정. frontmatter `updated` = 오늘 날짜로 갱신. wikilink 그래프가 바뀌면 PRINCIPLES.md bidirectional에 따라 백링크를 보강하고 `scripts/lint_wiki.py {wiki_root} --json`에서 `missing_backlink`가 0인지 확인.

## 4. 모순 점검

갱신 내용과 관련된 주장에 대해 `Grep`. 충돌 페이지를 보고하고, 갱신 여부를 사용자에게 확인.

## 5. 메타 갱신

- 페이지 목적이 바뀌었으면 `index.md` 요약 개정
- 전체 이해가 바뀌었으면 `overview.md` 갱신 + frontmatter `updated`

## 6. 로그

```bash
cat <<EOF | scripts/append_log.py {wiki_root} update "[[slug1]], [[slug2]]"
Reason: <explanation>
Changes: <brief summary>
EOF
```

<forbid>
- `raw/` 수정 (immutability)
- `log.md` 기존 항목 수정/삭제 (append-only)
- `SCHEMA.md` 수정 (사용자 명시 확인 없이 금지)
</forbid>
