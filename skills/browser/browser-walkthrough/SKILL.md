---
name: browser-walkthrough
description: Interactive headed-browser walkthrough with playwright-cli — attaches to the user's browser and advances one step per user confirmation, with explicit keyword gates for irreversible actions like final submit or payment. Use for iframe-heavy Korean sites (홈택스, 정부24, 은행, 쇼핑몰) done together with the user, or when the user says 브라우저 보면서 같이 진행, headed 모드로 같이, 단계별로 진행해줘, 홈택스 같이, 정부24 같이, 한 스텝씩, 한 단계씩 진행, walkthrough 모드, or step-by-step browser.
allowed-tools: Bash
---

# Browser Walkthrough (headed 모드 대화형 진행)

사용자가 열어둔 headed 브라우저에 **attach**해서 같은 화면을 보며 한 스텝씩 진행한다. 명령어 전체 레퍼런스는 `playwright-cli` skill 참조 — 이 skill의 핵심은 **대화 프로토콜**이다.
**사전 조건** — `playwright-cli` 스킬 필요 (외부 플러그인 또는 user-level 설치, README 참조).

## 사용자 응답 해석 (최우선)

| 입력 | 행동 |
|---|---|
| `다음` / `next` / `진행` / `ok` / `응` | 직전 제안 액션 실행 → snapshot → 다음 스텝 요약·대기 |
| `뒤로` | `go-back` |
| `스킵` / `건너뛰기` | 현재 스텝 건너뛰고 다음 |
| `잠깐` / `멈춰` / `wait` / `대기` | 아무 액션도 하지 않고 대기 (사용자 수동 조작 중) |
| 구체적 값 (`스테판초 랩스`, `010-...`) | 직전에 물어본 필드에 `fill` |
| 질문 (`이거 뭐임?`) | **액션 금지.** 답변만 하고 다시 대기 |
| `ok 제출` / `결제 진행` / `최종 확인` | 위험 액션 실행 (아래 게이트) |
| `완료` / `끝` | 후속 액션 아이템을 **기한 포함 체크리스트**로 요약 |

## Step Loop

1. `playwright-cli -s=<name> snapshot` — 현재 화면의 DOM(yaml, ref 포함) 확보
2. 2-5줄 요약 — 무슨 페이지이고 어떤 선택지·필드가 있는지
3. 다음 액션 제안 or 필요한 입력값 질문
4. 사용자 응답 대기 → 위 표대로 해석

snapshot이 비거나 ref가 안 잡히면 iframe 가능성 → [iframe-handling.md](references/iframe-handling.md).

## Bootstrap

```bash
playwright-cli list                                                          # 기존 세션 확인
playwright-cli -s=<name> open <url> --browser=chrome --persistent --headed  # 없으면 headed 새 세션
playwright-cli -s=<name> attach                                              # 이미 열린 브라우저면 attach
```

세션 이름은 작업 도메인 (`hometax`, `gov24`, `coupang`). 이후 **모든 명령에 `-s=<name>` 필수.**

## 위험 액션 게이트 (필수)

**최종 제출·결제·삭제·취소 같은 되돌릴 수 없는 액션은 `다음`만으로 실행하지 않는다.** 실행 전에:

- [ ] **체크포인트 요약 표**로 지금까지 입력한 핵심 값 재표시 (금액·날짜·상호·접수번호 등)
- [ ] `ok 제출` / `결제 진행` / `최종 확인` 중 어떤 키워드가 필요한지 명시
- [ ] 사용자가 그 키워드를 말할 때까지 대기

긴 폼(5-6단계 이상)은 페이지 전환 직전마다 채운 값을 짧은 표로 재요약해 스텝 드리프트 방지.

## 민감값 · 한국 사이트 특이사항

- 주민번호·인증서 비밀번호·계좌번호·카드번호는 **응답에 그대로 에코 금지.** 인증서 비번 등은 사용자가 직접 입력하게 하고 `잠깐` 대기.
- 사용자가 브라우저 확장으로 민감값을 **마스킹 중**일 수 있다 — screenshot의 마스킹에 혼동하지 말 것.
- 홈택스·금융사: 실제 컨텐츠가 iframe 안 → [iframe-handling.md](references/iframe-handling.md)
- IPINSIDE / Veraport / MagicLine: 보안프로그램 게이트. playwright로 우회 불가 — 사용자 수동 설치 후 새로고침
- 다운로드: playwright가 임시폴더로 가로챔 → [downloads.md](references/downloads.md)
- 공동인증서 팝업: 사용자가 직접 비번 입력. Claude는 `잠깐` 모드

## Guide 모드 — 사용자가 직접 클릭하게 하기

기본은 Claude가 `click`/`fill`. 민감 입력·학습 목적·최종 버튼은 **highlight만 하고 사용자가 직접 조작.**

```bash
scripts/guide-launcher.sh <mode> "<title>" "<ref|heading|desc>" [more...]   # mode = seq | opt | one
```

| 상황 | 권장 방식 |
|---|---|
| 단순 폼 (제목·내용·날짜 등 비민감) | Claude `fill` |
| 민감값 (아이디/비번, 카드번호, 전화번호) | highlight → 사용자 직접 |
| 체크박스·라디오 선택 | Claude `click` (확인 후) |
| 최종 제출·결제·삭제 | highlight → `ok 제출`에 Claude가 최종 click |
| 인증서 로그인·OTP | 기본 대기 (`잠깐`) |

모드·spec 포맷·렌더 구성·예시는 [guide-mode.md](references/guide-mode.md).

## 기타 명령

```bash
playwright-cli -s=<name> dialog-accept   # snapshot에 dialog 키워드 있으면 먼저 accept/dismiss
playwright-cli -s=<name> tab-list        # 팝업이 떴으면 tab-list부터, tab-select <n>으로 전환
playwright-cli -s=<name> fill e133 "0" && playwright-cli -s=<name> click e174   # 확정된 필드는 일괄 체이닝
playwright-cli -s=<name> close           # 종료 — 창만 닫기. delete-data는 프로필까지 삭제
```

## Screenshot

**snapshot 우선, screenshot은 보조.** 찍으면 즉시 긴 변 1568px로 리사이즈 후 Read:

```bash
playwright-cli -s=<name> screenshot --filename=s.png && sips -Z 1568 .playwright-cli/s.png --out .playwright-cli/s-small.png >/dev/null
```

근거·예외(작은 폰트, PDF 뷰어)는 [screenshot-resolution.md](references/screenshot-resolution.md).

## Anti-patterns

- **WRONG**: 사용자 질문에 답하면서 다음 액션까지 실행. **RIGHT**: 답만 하고 대기.
- **WRONG**: `다음`에 최종 제출/결제 click. **RIGHT**: 체크포인트 표 + 위험 키워드 대기.

전체 예시 대화는 [example-flow.md](references/example-flow.md).
