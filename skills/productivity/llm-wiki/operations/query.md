# operation: query

위키를 검색하고 인용 포함 답변을 합성한다.

<refs>PRINCIPLES.md: wikilink, page-types (합성에 type 의미 필요). 아카이브를 수락하면 frontmatter, slug-rules, bidirectional 추가 Read.</refs>

## 1. 인덱스 스캔

`{wiki_root}/wiki/index.md`를 Read하고 질문에서 관련 페이지를 식별한다. 일반 지식보다 위키 내용을 우선시한다.

## 2. 페이지 회수

식별된 페이지 전체를 Read. 관련 있는 경우 `[[cross-references]]`를 최대 2 hop까지 따라간다.

## 3. 답변 합성

- 모든 주장을 인라인 `[[slug]]` 인용으로 위키 소스에 근거시킨다
- 페이지 간 동의/불일치를 명시
- 위키에 없는 부분은 명시: "위키에 {topic} 내용 없음"
- 형식: 사실은 산문, 비교는 표, 절차는 번호 단계

## 4. 아카이빙 제안

`AskUserQuestion`:

> 이 답변을 위키 페이지로 저장할까요?
> 제안 slug: `<suggested-slug>` (PRINCIPLES.md slug-rules 따라 LLM이 미리 생성)

<onaccept>
1. PRINCIPLES.md frontmatter, slug-rules, bidirectional 추가 Read
2. `type: concept`, `tags: [query, analysis]`로 페이지를 `{wiki_root}/wiki/pages/{slug}.md`에 Write
3. ingest.md의 단계 7(index 갱신), 6(백링크 보강)를 수행 — 이 두 단계만 수행, overview는 갱신하지 않는다
4. 로그:
   ```bash
   cat <<EOF | scripts/append_log.py {wiki_root} query "{question_summary}"
   - Pages created: [[{slug}]]
   - Backlinks added: <count>
   EOF
   ```
</onaccept>

<onreject>
```bash
scripts/append_log.py {wiki_root} query "{question_summary} (not filed)"
```
</onreject>
