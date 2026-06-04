# operation: ingest

새 소스를 처리하고 위키에 통합한다.

<refs>PRINCIPLES.md: frontmatter, wikilink, bidirectional, page-types, slug-rules.</refs>

## 1. 소스 수락

사용자 입력으로부터:
- 파일 경로 → `Read`
- URL → `WebFetch`. 실패 시 사용자에게 본문 붙여넣기 요청
- 텍스트 → 그대로

## 2. raw 저장

slug는 PRINCIPLES.md slug-rules에 따라 직접 생성 (한글/CJK는 transliterate, 충돌 시 `-2/-3`).

- 텍스트/마크다운 → `{wiki_root}/raw/{slug}.md`에 헤더 + 전체 본문 Write
- PDF·이미지 등 binary → `{wiki_root}/raw/{slug}.{ext}`로 원본 복사 + `{wiki_root}/raw/{slug}.meta.md`에 헤더만

헤더:

```yaml
---
source_url: <url-if-applicable>
ingested: <today>
type: article|paper|video|code|note
---
```

## 3. 핵심 시사점 합성 후 사용자 확인

소스를 분석해 핵심 포인트 3개와 관련 엔티티/개념 후보를 뽑는다. 그 다음 `AskUserQuestion`:

> 📖 **{source_title}** 분석 완료
>
> **핵심 포인트:** 1) ... 2) ... 3) ...
> **관련 엔티티/개념:** ...
>
> 강조/제외할 내용? (없으면 Enter)

## 4. source 페이지 작성

`templates/page-template.md`를 참고해서 다음 정보를 담은 페이지를 `{wiki_root}/wiki/pages/{slug}.md`로 Write:

- frontmatter: `type: source`, sources/tags 적절히
- 소스 메타 (URL/경로, 수집일)
- 2-3 문단 합성 요약
- 핵심 시사점 (사용자 피드백 반영)
- Related 섹션에 엔티티/개념 wikilink

template은 placeholder의 의미를 보고 의미 있게 채운다 — 비워둔 키 포인트가 있으면 항목을 줄인다.

## 5. 엔티티/개념 페이지 갱신

언급된 엔티티/개념마다 `Grep {wiki_root}/wiki/pages/`로 기존 페이지 검색:

- 존재: `sources` frontmatter에 추가, 본문에 새 정보 반영, `updated` 갱신
- 없음: `type: entity` 또는 `concept`로 신규 생성 (slug는 같은 규칙)

## 6. 양방향 백링크 보강

PRINCIPLES.md bidirectional에 따라:

- 새/갱신 페이지의 모든 `[[slug]]`에 대해 대상 페이지 Related에 역링크가 있는지 확인하고, 없으면 추가
- 기존 페이지에서 새 엔티티/개념이 plain text로 언급된 곳이 있으면 wikilink로 변환
- 검증: `Bash: scripts/lint_wiki.py {wiki_root} --json`에서 `missing_backlink`가 0이 될 때까지 보강

## 7. index.md 갱신

`{wiki_root}/wiki/index.md`:

- 적절한 카테고리(Sources/Entities/Concepts)에 `- [[{slug}]] — {one-line} _(ingested {today})_` 추가
- Recent 섹션은 최근 5개 항목만 유지

## 8. overview.md 갱신

새 소스가 위키 전체 이해를 바꾸는 경우에만 Key Themes / Open Questions를 갱신한다. Statistics 카운트와 frontmatter `updated`는 항상 갱신.

## 9. 로그

```bash
cat <<EOF | scripts/append_log.py {wiki_root} ingest "{source_title}"
- Pages created: [[slug1]], [[slug2]]
- Pages updated: [[slug3]], [[slug4]]
- Backlinks added: <count>
EOF
```

## 10. 보고

> ✅ **{source_title}** ingest 완료
> - 소스: `[[{slug}]]`
> - 생성/업데이트/백링크: c1/c2/c3
