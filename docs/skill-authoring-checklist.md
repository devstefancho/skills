# Skill Authoring Checklist

스킬을 만들거나 고칠 때 매번 통과시킬 **실행 게이트**다. 규칙의 *근거와 상세*는 [AGENTS.md](../AGENTS.md)의 "SKILL.md conventions"가 SSOT이고, 이 문서는 그걸 체크박스로 옮긴 것 + 실제로 자주 밟는 함정 모음이다. 충돌하면 AGENTS.md가 이긴다.

## 0. 시작 전

- [ ] 같은 일을 하는 스킬이 이미 있는지 확인 — 있으면 새로 만들지 말고 그걸 고친다(트리거 충돌 방지).
- [ ] 카테고리 결정: `spec-driven` / `agents` / `browser` / `productivity` / `misc`.
- [ ] **출력이 주관적(글쓰기·요약·디자인)인가 객관적(파일 변환·코드 생성·고정 워크플로우)인가** 판단 → 객관적이면 정량 eval, 주관적이면 qualitative 리뷰로 검증 전략을 미리 정한다.

## 1. Frontmatter

- [ ] `name` = 디렉토리명, kebab-case. 함부로 rename 금지(설치 정체성).
- [ ] `description`은 **2-문장 패턴**: 먼저 *무엇을 한다*, 그다음 `Use when [실제 사용자가 말하는 literal 어구]`. **한국어 트리거 어구 유지**, 1024자 이내.
- [ ] description은 **valid YAML** — 값에 콜론(`:`)이 있으면 큰따옴표로 감싼다. (안 그러면 파싱이 깨져 `npx skills`에서 스킬이 조용히 사라진다.)
- [ ] description을 **간결하게**. "Also fires…", "Proactively trigger…" 같은 문장을 줄줄이 붙이지 말 것 — 핵심 트리거만.

> ⚠️ **함정 (이번 세션 교훈): 트리거 조건은 description에만 둔다.** 본문에 "When this fires / 언제 발동" 같은 섹션을 만들지 말 것. when-to-use 정보는 전부 description이 담당하고, 본문은 *어떻게 하는가*만 다룬다.

## 2. Body

레포 house style 골격 (PR #43 restyle된 스킬들이 일관되게 따르는 형태):

- [ ] `# Title` 다음 **한 줄 essence** — 무엇을 하는지 + 스킬의 핵심 invariant를 그 한 줄에 박는다 (예: writing-tasks "…never stored", browser-walkthrough "…핵심은 대화 프로토콜이다").
- [ ] 상단에 **`## Hard Rules` 블록.** 불릿마다 **bold 리드 문구.** 그다음 em-dash로 *이유·결과*를 붙인다 ("**Never code without a task definition.** … — this kills aimless coding").
- [ ] 결정·상태→행동 매핑은 산문이 아니라 **표(table)**로.
- [ ] 워크플로우는 **numbered phases + `- [ ]` 체크리스트**를 phase 간 게이트로.
- [ ] 끝부분에 **`## Anti-patterns`** (WRONG/RIGHT), 필요하면 **`## Boundaries`** (스코프·out-of-scope·페어 스킬·"keep outputs tight").
- [ ] **100줄 이내.** 넘치면 sibling `.md`로 분리하고 한 단계 깊이로 링크(progressive disclosure). **behavior-critical 디테일은 삭제하지 말고 이동.**
- [ ] 규칙마다 **"왜"를 설명**한다. 대문자 MUST/NEVER 남발은 yellow flag — 이유를 적어 모델이 스스로 판단하게.

> ⚠️ **함정 (이번 세션 교훈): 같은 아이디어를 여러 곳에 중복 서술하지 말 것.** "원칙 섹션 + 별도 강조 섹션 + Anti-patterns"에 같은 규칙을 3번 쓰면 길어지기만 한다. **한 아이디어 = 한 곳.**

- [ ] **Anti-patterns(WRONG/RIGHT)는 *알려진 실패모드가 있을 때만*** 둔다. 위 원칙의 재탕이 아니라, 원칙만으로는 안 잡히는 고유 실패모드만 대조로.
- [ ] 일화·배경 fluff 제거("이 사용자는 ~한 적이 있다" 류). 동작을 바꾸지 않는 문장은 뺀다.

## 3. 지원 파일 (scripts / templates / references)

- [ ] 모두 스킬 디렉토리 안에 두고 SKILL.md **기준 상대경로**로 링크.
- [ ] 매 호출마다 똑같이 다시 만들게 될 산출물(HTML 리포트, 빌드 스크립트 등)은 **템플릿/스크립트로 번들**해 재작성을 막는다.
- [ ] **파생 인덱스·중복 파일을 만들지 말 것 (SSOT).** 한 정보는 한 곳에만.

## 4. 등록 & 검증

- [ ] `.claude-plugin/plugin.json`의 `skills[]`에 경로 등록.
- [ ] `jq . .claude-plugin/plugin.json` — JSON 유효성.
- [ ] frontmatter YAML 파싱 확인 (name·description 존재, description ≤ 1024자).
- [ ] `wc -l SKILL.md` — 100줄 이내 재확인.
- [ ] `scripts/validate-plugins.sh` 있으면 통과.

## 5. 테스트

- [ ] 현실적인 프롬프트 1~3개로 **with-skill 실행(subagent)**해 스킬이 실제로 의도대로 동작하는지 본다.
- [ ] 객관적 출력이면 baseline 대비 정량 benchmark, 주관적 출력이면 사람 리뷰(eval-viewer).
- [ ] (선택) description triggering 최적화 루프로 발동 정확도 튜닝.

> ⚠️ **함정 (이번 세션 교훈): "완료" 선언 전에 functional sanity test 한 번은 돌린다.** 파일만 쓰고 끝내지 말고, 스킬을 실제 프롬프트에 태워 결과를 눈으로 확인한 뒤 마무리.

## 6. 마무리

- [ ] 변경이 사용자 요청 라인에 직접 추적되는지(불필요한 인접 수정 없음) 확인.
- [ ] 커밋·푸시·PR은 **요청받았을 때만**.
