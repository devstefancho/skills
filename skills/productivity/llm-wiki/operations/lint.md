# operation: lint

위키 건강 감사. 검사는 결정론적 — `scripts/lint_wiki.py`가 전담한다.

<refs>스크립트 출력 자체에는 PRINCIPLES.md 필요 없다. 자동 수정 수락 시 frontmatter, bidirectional, wikilink 추가 Read.</refs>

## 1. lint 실행

```bash
scripts/lint_wiki.py {wiki_root} --json
```

JSON: `{ scanned, errors[], warnings[], info[] }`. 각 항목은 `{ check, page?, target?, fields?, ... }`.

검사 항목 (스크립트가 코드화):
- errors: `broken_link`, `missing_frontmatter`, `invalid_slug`
- warnings: `orphan`, `missing_backlink`, `stale`
- info: `unindexed`

## 2. 리포트 출력

> 📋 **Wiki Lint Report** ({today})
> Pages scanned: {scanned}
>
> 🔴 Errors (n) — broken_link / missing_frontmatter / invalid_slug
> 🟡 Warnings (n) — orphan / missing_backlink / stale
> 🔵 Info (n) — unindexed
>
> 각 항목 한 줄: `{check} {page} {detail}`

## 3. 자동 수정 제안

수정 가능한 카테고리가 있으면 `AskUserQuestion`:

> 자동 수정 가능 항목 n개. 수정할까요?
> - broken_link 제거/올바른 slug로 교체
> - missing_backlink 추가
> - unindexed 항목 index.md에 추가
> - missing_frontmatter 채우기

<onaccept>
PRINCIPLES.md frontmatter, bidirectional, wikilink Read. 그 다음:

- broken_link → 해당 페이지에서 wikilink 제거 또는 올바른 slug로 Edit
- missing_backlink → 대상 페이지 Related 섹션에 `[[from]]` 추가
- unindexed → index.md 적절한 카테고리에 `- [[{slug}]] — {one-line}` 추가
- missing_frontmatter → 누락 필드 채움 (`created`/`updated`는 파일 mtime 사용, mtime을 못 얻으면 today)

적용 후 lint를 재실행해 잔여 항목을 보고한다.
</onaccept>

## 4. 로그

```bash
scripts/append_log.py {wiki_root} lint "{e} errors, {w} warnings, {i} info"
```

자동 수정을 적용했으면 stdin으로 `Fixed: <one-line summary>` 전달.
