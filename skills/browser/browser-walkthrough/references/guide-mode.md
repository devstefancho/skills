# Guide 모드 상세 (guide-launcher)

대상 요소를 강조(highlight)만 하고 **사용자가 직접 조작**하게 하는 오버레이. `scripts/guide-launcher.sh`가 spec을 파싱해 `scripts/guide-overlay.js`를 세션에 주입한다.

## 언제 쓰나

- **인증/민감정보 입력**: 카드번호, 주민번호, OTP 등 — Claude가 값을 몰라야 안전
- **학습 목적**: 사용자가 다음부터 혼자 할 수 있도록 경로를 체감시켜야 할 때
- **최종 제출·결제 버튼**: 위험 액션 게이트와 결합. highlight로 강조 → 사용자가 `ok 제출` 키워드 말하면 Claude가 click

## 사용법

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

## 렌더 구성

- 각 대상 요소에 색상 outline + 좌상단 번호/알파벳 배지 (스크롤·resize·DOM 변경 자동 추적)
- **우측 상단 고정 사이드 패널**에 헤딩·설명 리스트
- 패널 항목 클릭 → 해당 요소로 scrollIntoView + 3회 깜빡임
- 패널 "×" 닫기 → 전체 outline·배지·패널 제거

## 예시

```bash
scripts/guide-launcher.sh seq "카드 등록 4단계" \
  "e1033|카드사 선택|드롭다운에서 본인 카드사" \
  "e1035|카드번호 16자리|4자리씩 4칸" \
  "e1067|휴대전화|가운데·뒤 4자리" \
  "e1082|등록접수하기|⚠ 누르기 전 확인"
```
