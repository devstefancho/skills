---
name: ram-check
description: Diagnose macOS RAM by memory pressure rather than raw usage — runs one script that reports the pressure verdict, swap, the usage-vs-cache breakdown, top consumers, and an optional process-group total. Use when the user asks about memory or RAM, "why is my RAM so high", "is 36GB/48GB enough", whether to worry about usage, 메모리 사용량, 램 사용량 높은데, 메모리 부족한가, 맥 메모리 확인.
metadata:
  public: true
---

# ram-check

macOS에서 "RAM이 충분한가"의 정답 지표는 **사용량이 아니라 압력(memory pressure)**이다 — 이 스킬은 그 관점으로 진단하고 해석한다.

## Hard Rules

- **판정은 압력·스왑으로 한다. 사용량 숫자로 겁주지 말 것.** — macOS는 빈 RAM을 디스크 캐시로 채우므로 "사용량"은 항상 높게 보인다. 높은 사용량은 정상이고, 압력 레벨과 스왑만이 부족 여부를 말한다.
- **`active`/`inactive`/`file-backed`를 "사용 중"으로 보고하지 말 것.** — 대부분 회수 가능한 캐시다. 실질 점유는 `anonymous`(앱) + `wired`(커널) + `compressed`뿐.
- **판정은 압력 레벨로만 한다 — 스왑 누적값(used)에 휘둘리지 말 것.** — 레벨 1이면 사용량이 90%여도, 스왑이 GB 단위로 남아 있어도 "지금은" 여유다. 스왑 used는 한 번 쓰면 느리게 회수돼 압력이 풀린 뒤에도 과거 흔적으로 남는다 — 현재 압박은 레벨로만 본다.
- **"48GB 샀어야 했나" 류 질문엔 압력·스왑 이력으로 답한다.** — uptime 동안 스왑이 0이면 그 구성으로 한 번도 모자란 적이 없었다는 뜻 = 충분.

## 압력 레벨 → 해석

| 레벨 | 신호 | 시스템 동작 | 사용자에게 |
|---|---|---|---|
| 1 | 🟢 | 남는 RAM을 캐시로 활용 | 충분. 걱정 불필요 |
| 2 | 🟡 | 캐시 비우기 + 메모리 압축 | 아직 버팀, 무거운 작업 줄이면 여유 |
| 4 | 🔴 | 스왑 적극 사용, 앱 종료 압박 | 실제 부족. 프로세스 정리/증설 검토 |

## 워크플로우

1. **진단 실행** → verify: 스크립트 출력에 판정·구성·상위 프로세스가 나온다.
   ```bash
   scripts/mem-report.sh                 # 전체 진단
   scripts/mem-report.sh 'claude|Claude' # 특정 앱군 RSS 합산 (정규식)
   ```
   - [ ] 무엇이 RAM을 많이 먹는지 의심되면 두 번째 인자로 그룹 패턴을 넘겨 합산한다 (예: `'node|Code Helper'`, `'Docker|com.docker'`).
2. **압력으로 판정** → verify: 판정 줄(🟢/🟡/🔴)과 스왑 값을 그대로 전달하고, 사용량 숫자는 "캐시 포함이라 높게 보이는 값"이라고 명시한다.
3. **구성을 해석** → verify: "실질 점유(anonymous+wired+compressed)" vs "회수 가능한 캐시"를 구분해 보여준다.
4. **여유 판단·조치** → verify: 🟢면 "충분", 🟡/🔴면 아래 **조치 가이드**대로 회수량 큰 것부터 제안한다.

## Report Format

**대시보드처럼 — 아이콘으로 한눈에.** 표·vm_stat 원문 금지. 수치 GB 소수 1자리.

판정은 **압력 게이지**로: `🟢⬜⬜ 정상` / `🟢🟡⬜ 주의` / `🟢🟡🔴 위급`. `레벨 1/4` 같은 내부 숫자는 쓰지 말 것.

구성은 **`사용 중 + 여유 = 총 RAM`으로 딱 맞게.** 캐시·inactive를 따로 더하지 말 것 — 이중 계산이라 합이 총량을 넘는다.

**기본 형식 (🟢):**
> 🟢 **여유** — 압력 🟢⬜⬜ 정상. 지금 끌 필요 없음.
> 📊 총 36GB = 🔴 사용 중 25.4 (🔒고정 5.0 + 📦앱 13.8 + 🗜️압축 6.6) + 💚 여유 10.6 (29%)
> 💚 여유 = 🆓 지금 빈 RAM 1.2GB (♻️ 캐시까지 회수 시 최대 10.6GB)
> 🔁 활동: swapout/pageout 0 MB/s → 캐시 회수 없음, 쾌적
> 🔎 큰 소비자: Claude 8.9GB · iOS 시뮬레이터(다수) · Chrome 4.0GB
> → 앱 개발 + Claude 세션 동시 OK. (스왑 1.1GB는 과거 흔적)

**🟡/🔴면 한 줄 더:**
> ⚠️ **조치** ① 시뮬레이터 끄기 ② 오래된 Claude 세션 정리 — 아래 **조치 가이드** 참고

- 판정·구성(사용중+여유)·활동·큰 소비자·결론은 **항상**. 🟢이면 조치만 생략.
- **여유는 둘로**: 🆓 지금 빈 RAM(free+speculative)과, ♻️ 캐시까지 회수 시 최대치. 예 `1.2GB (최대 10.6GB)`.
- **🔁 활동 = 1초 delta**: 압력이 "지금 얼마나 여유냐(상태)"면, 활동은 "지금 디스크로 주고받는 중이냐". swapout/pageout이 0 근처면 쾌적, 계속 크면 캐시를 아파하며 버리는 중(체감 저하). 둘을 같이 본다.
- **사용 중 = wired + anonymous + compressed** (비중복). 여유 = 총 − 사용 중.
- 큰 소비자는 RSS 순위라 **공유메모리 중복으로 부풀려짐 — 순위·상대크기로만, 절대값 합산 금지.**

## 조치 가이드 (🟡/🔴일 때만)

회수량 큰 것부터. 후보는 그룹 집계로 실제 점유를 먼저 확인.
1. 안 쓰는 iOS 시뮬레이터 / Docker / VM 종료 — 보통 GB 단위로 가장 큼
2. 오래된 claude·node CLI 세션 정리 (그룹 합계로 확인)
3. 브라우저 탭·헬퍼, 안 쓰는 큰 앱(Xcode 등)

먼저 판단:
- **스왑 used만 높고 압력 레벨 1** → 과거 흔적. 아무것도 안 해도 됨.
- **레벨 4가 자주·재부팅 직후에도** → 일시 정리 아닌 RAM 증설 신호.
- **레벨이 안 풀리고 압축·스왑 계속 누적** → 재부팅으로 초기화.

## Anti-patterns

- WRONG: "RAM 18GB 사용 중이라 거의 꽉 찼습니다." → RIGHT: "압력 레벨 1·스왑 0이라 여유입니다. 18GB 중 큰 덩어리는 회수 가능한 캐시예요."
- WRONG: top 프로세스만 나열하고 끝. → RIGHT: 압력 판정으로 "괜찮다/문제다"를 먼저 말하고, 그다음 원인 프로세스를 보여준다.
- WRONG: `ps` RSS 합으로 전체 사용량을 추정. → RIGHT: RSS는 공유 메모리를 중복 계산해 부풀려진다. 전체 판단은 `vm_stat`/`memory_pressure`로.
- WRONG: 스크립트 stdout 원문을 그대로 붙여서 끝. → RIGHT: Report Format대로 정리한다. 🟢이면 3줄.
- WRONG: 표·여러 섹션으로 장황하게. → RIGHT: 인라인 한 줄들로 간결하게. 🟢이면 원인·조치 생략.
- WRONG: 실점유 + 캐시(file/inactive)를 더해 보고 → 합이 총 RAM을 넘는다(이중 계산). → RIGHT: `사용 중 + 여유 = 총`으로만.

## Boundaries

- **macOS 전용** (`vm_stat`, `memory_pressure`, `sysctl vm.swapusage`, `pagesize`).
- 스코프는 **진단·해석**까지. tmux/메뉴바 위젯을 압력 기반으로 바꾸는 등의 설정 변경은 이 스킬 밖이다 — 사용자가 원하면 별도로 진행.
- 출력은 짧게. 매번 전체 vm_stat 원문을 붙이지 말고, 스크립트가 요약한 판정·구성·상위 N만 전달한다.
