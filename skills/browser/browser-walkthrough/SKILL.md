---
name: browser-walkthrough
description: playwright-cli headed 모드로 브라우저를 같이 보면서 한 스텝씩 대화형으로 진행하는 워크플로우. 사용자가 "다음"이라고 하면 다음 스텝 실행, 질문하면 답만 하고 대기, 최종 제출 같은 위험 액션은 명시적 키워드 필요. 홈택스·정부24·은행·쇼핑몰처럼 iframe·보안프로그램·팝업이 많은 사이트를 사용자와 함께 진행할 때 사용. Trigger: "브라우저 보면서 같이 진행", "headed 모드로 같이", "단계별로 진행해줘", "홈택스 같이", "정부24 같이", "step-by-step browser", "walkthrough 모드", "한 스텝씩", "한 단계씩 진행".
allowed-tools: Bash
---

# Browser Walkthrough (headed 모드 대화형 진행)

사용자가 열어둔 headed 브라우저에 **attach**해서 같은 화면을 보며 한 스텝씩 진행한다.
명령어 전체 레퍼런스는 `playwright-cli` skill 참조. 이 skill의 핵심은 **대화 프로토콜**이다.

> **사전 조건**: `playwright-cli` 스킬이 사용 가능해야 한다 (외부 플러그인 또는 user-level 설치). 본 플러그인은 의존만 표시하고 묶지 않는다 — 본가 업데이트가 끊기지 않게 하려는 의도. 자세한 내용은 README 참조.

## 사용자 응답 해석 (최우선)

| 입력 | 행동 |
|---|---|
| `다음` / `next` / `진행` / `ok` / `응` | 직전에 제안한 액션 실행 → snapshot → 다음 스텝 요약·대기 |
| `뒤로` | `go-back` |
| `스킵` / `건너뛰기` | 현재 스텝 건너뛰고 다음 |
| `잠깐` / `멈춰` / `wait` / `대기` | 아무 액션도 하지 말고 대기. 사용자가 수동 조작 중 (인증서 비번, 보안프로그램 설치, 텍스트 마스킹 등) |
| 구체적 값 (`스테판초 랩스`, `010-...`, `10`) | 직전에 물어본 필드에 `fill` |
| 질문 (`이거 뭐임?`, `~~는 뭐가 유리?`) | **액션 금지.** 답변만 하고 다시 대기 |
| `ok 제출` / `결제 진행` / `최종 확인` | 위험 액션 실행 (아래 "위험 액션 게이트") |
| `완료` / `끝` | 후속 액션 아이템 요약 (기한·체크리스트)  |

## Step Loop

매 스텝 반복:

1. `playwright-cli -s=<name> snapshot` — 현재 화면의 DOM(yaml, ref 포함) 확보
2. 2-5줄 요약 — 무슨 페이지이고 어떤 선택지·필드가 있는지
3. 다음 액션 제안 or 필요한 입력값 질문
4. 사용자 응답 대기 → 위 표대로 해석

snapshot이 비거나 ref가 안 잡히면 iframe 가능성 → `references/iframe-handling.md` 참고.

## Bootstrap

```bash
# 기존 세션 확인
playwright-cli list

# 없으면 headed 크롬으로 새 세션 (세션 이름은 도메인 기반)
playwright-cli -s=<name> open <url> --browser=chrome --persistent --headed

# 이미 열린 브라우저가 attach 가능하면
playwright-cli -s=<name> attach
```

세션 이름은 작업 도메인 (`hometax`, `gov24`, `coupang`). 이후 **모든 명령에 `-s=<name>` 필수.**

## 위험 액션 게이트 (필수)

최종 제출, 결제, 삭제, 취소 등 **되돌릴 수 없는 액션**은 `다음`만으로 실행하지 않는다.

실행 전에:
1. **체크포인트 요약 표**로 지금까지 입력한 핵심 값 재표시 (금액·날짜·상호·접수번호 등)
2. `ok 제출`, `결제 진행`, `최종 확인` 중 어떤 키워드가 필요한지 명시
3. 사용자가 그 키워드를 말할 때까지 대기

## 중간 체크포인트

긴 폼(5-6단계 이상)에서는 페이지 전환 직전에 지금까지 채운 값을 짧은 표로 재요약해 스텝 드리프트 방지.

## 민감값 처리

- 사용자가 브라우저 확장으로 주민번호·계좌·비번 등을 **마스킹 중**일 수 있다. screenshot에 마스킹된 모습이 보여도 헷갈리지 말 것.
- 주민번호·인증서 비밀번호·계좌번호·카드번호는 **응답에 그대로 에코 금지.**
- 인증서 비번 입력 같은 단계는 사용자가 직접 하도록 요청하고 `잠깐` 대기.

## 한국 사이트 특이사항

- 홈택스·금융사: iframe 안에 실제 컨텐츠 → `references/iframe-handling.md`
- IPINSIDE / Veraport / MagicLine: 보안프로그램 설치 게이트. playwright에서 우회 불가, 사용자 수동 설치 후 새로고침
- 다운로드: playwright가 `/private/var/folders/**/playwright-artifacts-*/`로 가로챔. 필요시 `cp`로 `~/Downloads`에 복사 → `references/downloads.md`
- 공동인증서 팝업: 사용자가 직접 비번 입력. Claude는 `잠깐` 모드

## 안내(Guide) 모드 — 사용자가 직접 클릭하게 하기

기본은 Claude가 `click`/`fill`한다. 다만 다음 상황에선 **대상을 강조만 하고 사용자가 직접 조작**하는 게 낫다:

- **인증/민감정보 입력**: 카드번호, 주민번호, OTP 등 — Claude가 값을 몰라야 안전
- **학습 목적**: 사용자가 다음부터 혼자 할 수 있도록 경로를 체감시켜야 할 때
- **최종 제출·결제 버튼**: 위험 액션 게이트와 결합. highlight로 강조 → 사용자가 `ok 제출` 키워드 말하면 Claude가 click

### 사용법

```bash
scripts/guide-launcher.sh <mode> "<title>" "<ref|heading|desc>" [more...]
```

**모드**:
- `seq` — 순차 스텝, 스텝별 다른 색상 (핑크/보라/청록/주황/파랑/빨강/민트/자주 순환)
- `opt` — 택1 옵션, 주황색 + 알파벳 라벨 (A/B/C)
- `one` — 단일 타겟, 핑크 + 👉

**Spec 포맷**: `ref|heading|desc` (heading/desc 생략 가능, desc 안의 `\n`은 줄바꿈)

**환경변수**: `CC_HL_SESSION` (기본값 `hometax`) — 다른 playwright-cli 세션이면 지정
```bash
CC_HL_SESSION=gov24 scripts/guide-launcher.sh seq "..." "..."
```

### 렌더 구성

- 각 대상 요소에 색상 outline + 좌상단 번호/알파벳 배지 (스크롤·resize·DOM 변경 자동 추적)
- **우측 상단 고정 사이드 패널**에 헤딩·설명 리스트
- 패널 항목 클릭 → 해당 요소로 scrollIntoView + 3회 깜빡임
- 패널 "×" 닫기 → 전체 outline·배지·패널 제거

### 예시

```bash
scripts/guide-launcher.sh seq "카드 등록 4단계" \
  "e1033|카드사 선택|드롭다운에서 본인 카드사" \
  "e1035|카드번호 16자리|4자리씩 4칸" \
  "e1067|휴대전화|가운데·뒤 4자리" \
  "e1082|등록접수하기|⚠ 누르기 전 확인"
```

### 판단 기준 — Claude 직접 click vs highlight 가이드

| 상황 | 권장 방식 |
|---|---|
| 단순 폼 (제목·내용·날짜 등 비민감) | Claude `fill` |
| 민감값 (아이디/비번, 카드번호, 전화번호) | `highlight` → 사용자 직접 |
| 체크박스·라디오 선택 | Claude `click` (확인 후) |
| 최종 제출·결제·삭제 | `highlight` → `ok 제출`에 Claude가 최종 click |
| 인증서 로그인·OTP | 기본 대기 (`잠깐`) |

## Dialog / Tab

```bash
playwright-cli -s=<name> dialog-accept
playwright-cli -s=<name> dialog-dismiss
playwright-cli -s=<name> tab-list
playwright-cli -s=<name> tab-select 2
```
snapshot에 `dialog` 키워드 있으면 먼저 accept/dismiss. 팝업이 떴으면 tab-list부터.

## 폼 일괄 입력

여러 필드 확정되면 한 번에:
```bash
playwright-cli -s=<name> fill e133 "0" && \
playwright-cli -s=<name> fill e138 "10" && \
playwright-cli -s=<name> click e174
```

## 스크린샷 해상도 (중요)

Claude vision encoder는 긴 변 **1568px**까지만 손실 없이 처리한다 (그 이상은 자동 다운스케일되어 픽셀 낭비 + 응답 지연). 토큰 ≈ (w×h)/750.

**원칙**: screenshot 찍고 바로 `sips`로 리사이즈한 뒤 Read.

```bash
# 1. 스크린샷
playwright-cli -s=<name> screenshot --filename=step.png
# 2. 긴 변 1568px로 다운스케일 (원본보다 작으면 그대로 둠)
sips -Z 1568 .playwright-cli/step.png --out .playwright-cli/step-small.png
# 3. Read로 확인
```

한 줄 체이닝:
```bash
playwright-cli -s=<name> screenshot --filename=s.png && sips -Z 1568 .playwright-cli/s.png --out .playwright-cli/s-small.png >/dev/null
```

예외: 폰트 작거나 PDF 페이지 읽기 등 **해상도 낮아 못 읽을 때만** 1568 상향(2000~2500). 대부분 1568로 충분.

snapshot(yaml)은 토큰 기준이라 해상도 무관 — 가능하면 screenshot보다 snapshot 먼저.

## PDF 뷰어

playwright로 페이지 넘기기 어려움 → 사용자에게 "n페이지로 넘겨줘" 요청 → `screenshot` 으로 읽음 (위 리사이즈 적용).

## 세션 종료

```bash
playwright-cli -s=<name> close          # 창만 닫기
playwright-cli -s=<name> delete-data    # 퍼시스턴트 프로필까지 삭제
```

사용자가 `완료`라고 하면 후속 액션 아이템을 **기한 포함 체크리스트**로 요약. (세션에서 효과적이었던 패턴)

## 예시 흐름

```
User: 홈택스 개인사업자등록 같이 진행해줘
Claude: playwright-cli -s=hometax list → snapshot → "로그인 페이지. 로그인해달라" → 대기

User: 로그인했음
Claude: snapshot → "메인 진입. '증명·등록·신청' hover 하면 서브메뉴 열림. 진행?" → 대기

User: 다음
Claude: hover → snapshot → "서브메뉴 열림. '개인 사업자등록 신청' 4가지 중 어떤 거?" → 대기

User: 기본
Claude: click → dialog-accept (보안 alert) → snapshot → "상호 입력 필드. 뭐로?" → 대기

User: 스테판초 랩스
Claude: fill → snapshot → 다음 필드 ...

... (여러 스텝 후)

Claude: "최종 제출 직전. [체크포인트 표]. 'ok 제출' 답하면 접수."

User: ok 제출
Claude: click → "접수 완료 (번호: ...)"

User: 완료
Claude: "[후속 체크리스트: 4/21 건보 확인, 4/22 등록증 출력, ...]"
```

## 참고 문서

- `references/iframe-handling.md` — iframe 안 요소 찾기/클릭 패턴
- `references/downloads.md` — playwright 다운로드 가로채기 대응
