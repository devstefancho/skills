# operation: init

`wiki_root`에 새 위키를 생성한다.

<refs>없음. (시스템 페이지만 만들고, 사용자 페이지는 만들지 않는다. log.md 첫 항목은 init이 직접 작성하는 bootstrap 예외 — `append_log.py`를 쓰려면 log.md가 먼저 있어야 한다.)</refs>

## 1. 사용자에게 위키 정체성을 묻는다

`AskUserQuestion`:

> 위키를 생성합니다.
> - **위키 이름** (예: "Stefan's Knowledge Wiki")
> - **위키 설명** (한 줄)
> - **소스 유형** (예: papers, articles, videos, code)

세 항목 모두 필수. 빈 응답이면 한 번 더 묻는다.

## 2. 디렉토리 생성

```bash
mkdir -p {wiki_root}/raw {wiki_root}/wiki/pages
```

## 3. 시스템 페이지 작성

`{today}` = 시스템 오늘 날짜 (`YYYY-MM-DD`).

각 템플릿을 Read하고 `{wiki_title}`, `{description}`, `{source_types}`, `{date}` 변수를 치환해서 Write:

- `templates/schema-template.md` → `{wiki_root}/SCHEMA.md`
- `templates/index-template.md` → `{wiki_root}/wiki/index.md`
- `templates/overview-template.md` → `{wiki_root}/wiki/overview.md`

치환은 **단순 문자열 치환**이 아니라 의미를 이해하고 처리한다 — 사용자 입력에 `{date}` 같은 글자가 들어있으면 그대로 두고 템플릿 placeholder만 바꾼다.

## 4. log.md 초기화 (bootstrap)

`{wiki_root}/wiki/log.md`에 다음을 직접 Write:

```markdown
# Wiki Log

Append-only operation record.

---

## [{today}] init | {wiki_title}
- Wiki created at `{wiki_root}/`
```

이후 모든 로그 추가는 `scripts/append_log.py`로만.

## 5. 사용자 보고

> ✅ 위키 `{wiki_title}` 생성 완료
> - 경로: `{wiki_root}/`
> - 다음: `wiki ingest <source>`로 소스 추가
