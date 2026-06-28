#!/usr/bin/env bash
# macOS memory diagnostic — judges by PRESSURE, not raw usage.
# Usage: mem-report.sh [GROUP_REGEX]
#   GROUP_REGEX (optional): sum RSS of processes whose command matches this regex,
#                           e.g. 'claude|Claude' or 'node|Code Helper'.
set -uo pipefail

PS=$(pagesize)
GIB=1073741824

TOTAL=$(sysctl -n hw.memsize)
LEVEL=$(sysctl -n kern.memorystatus_vm_pressure_level 2>/dev/null || echo 1)
SWAP_USED=$(sysctl -n vm.swapusage 2>/dev/null | sed -E 's/.*used = ([0-9.]+)M.*/\1/')
[ -z "${SWAP_USED:-}" ] && SWAP_USED=0

# ---- vm_stat을 한 번만 파싱해 GB 단위 변수로. '사용 중'은 비중복 항목만 합산:
#      고정(wired) + 앱(anonymous) + 압축(compressor). active/inactive/file-backed는
#      이들과 겹치므로(이중 계산) 더하지 않는다. 나머지(= 총 - 사용중)가 곧 '여유'. ----
read FIXED APP COMP FREE_NOW < <(vm_stat | awk -v ps="$PS" -v gib="$GIB" '
  /Pages free/                   {fr=$3}
  /Pages speculative/            {sp=$3}
  /Pages wired down/             {w=$4}
  /Pages occupied by compressor/ {c=$5}
  /Anonymous pages/              {an=$3}
  END { conv=ps/gib; printf "%.1f %.1f %.1f %.1f", w*conv, an*conv, c*conv, (fr+sp)*conv }')

TOTAL_GB=$(awk "BEGIN{printf \"%.0f\", $TOTAL/$GIB}")
USED=$(awk     "BEGIN{printf \"%.1f\", $FIXED+$APP+$COMP}")
FREEG=$(awk    "BEGIN{printf \"%.1f\", $TOTAL/$GIB-($FIXED+$APP+$COMP)}")        # 즉시 회수 시 최대 여유
CACHE=$(awk    "BEGIN{printf \"%.1f\", $TOTAL/$GIB-($FIXED+$APP+$COMP)-$FREE_NOW}") # 회수가능 캐시
USEDPCT=$(awk  "BEGIN{printf \"%.0f\", ($FIXED+$APP+$COMP)/($TOTAL/$GIB)*100}")
FREEPCT=$(awk  "BEGIN{printf \"%.0f\", (1-($FIXED+$APP+$COMP)/($TOTAL/$GIB))*100}")
SWAP_GB=$(awk  "BEGIN{printf \"%.1f\", $SWAP_USED/1024}")

# ---- verdict: 현재 압박은 압력 레벨로만 판정. 스왑 누적(used)은 과거 흔적이라 제외 ----
if [ "${LEVEL:-1}" -ge 4 ] 2>/dev/null; then
  VERDICT="🔴 부족 — 스왑 적극 사용/앱 종료 압박. RAM이 실제로 모자란 상태."
  GAUGE="🟢🟡🔴 위급"
elif [ "${LEVEL:-1}" -ge 2 ] 2>/dev/null; then
  VERDICT="🟡 주의 — 캐시 정리·메모리 압축 시작. 아직 버티지만 여유는 줄어듦."
  GAUGE="🟢🟡⬜ 주의"
else
  VERDICT="🟢 여유 — 압력 없음. 사용량이 높아 보여도 RAM은 충분."
  GAUGE="🟢⬜⬜ 정상"
fi

# 스왑 누적이 크면(>=500M) '과거 한때 압박' 부가 노트 — 현재 판정과는 별개
SWAP_NOTE=""
if awk "BEGIN{exit !(${SWAP_USED:-0}>=500)}"; then
  SWAP_NOTE="ℹ️ 스왑 ${SWAP_GB}GB 잔존 — 과거 한때 RAM이 빡빡했던 흔적(느리게 회수됨). 압력 정상이면 지금은 회복된 상태."
fi

printf '🩺 판정 (현재 압박은 압력 레벨로 판단)\n'
printf '%s\n' "$VERDICT"
[ -n "$SWAP_NOTE" ] && printf '%s\n' "$SWAP_NOTE"
printf '압력 %s   💚 여유 %sGB (즉시회수 시 최대 %sGB)   💾 스왑 %sGB   🖥️  총 %sGB\n' \
  "$GAUGE" "$FREE_NOW" "$FREEG" "$SWAP_GB" "$TOTAL_GB"

printf '\n📊 메모리 구성 (사용 중 + 여유 = 총 %sGB)\n' "$TOTAL_GB"
printf '  🔴 사용 중  %s GB (%s%%)\n' "$USED" "$USEDPCT"
printf '       🔒 고정 %s  +  📦 앱 %s  +  🗜️ 압축 %s\n' "$FIXED" "$APP" "$COMP"
printf '  💚 여유     %s GB (%s%%)\n' "$FREEG" "$FREEPCT"
printf '       🆓 지금 빈 RAM %s  +  ♻️ 회수가능 캐시 %s\n' "$FREE_NOW" "$CACHE"

# ---- 페이징 활동: 1초 delta로 '지금 디스크로 주고받는 중인지'. 누적값은 과거 흔적이라 변화량을 본다 ----
paging_counts() { vm_stat | awk '/Pageouts/{po=$2} /Swapouts/{so=$2} /Swapins/{si=$2} END{gsub(/\./,"",po);gsub(/\./,"",so);gsub(/\./,"",si); print po+0, so+0, si+0}'; }
read PO0 SO0 SI0 < <(paging_counts); sleep 1; read PO1 SO1 SI1 < <(paging_counts)
mbps() { awk "BEGIN{d=($2-$1)*$PS/1048576; if(d<0)d=0; printf \"%.1f\", d}"; }
DSO=$(mbps "$SO0" "$SO1"); DSI=$(mbps "$SI0" "$SI1"); DPO=$(mbps "$PO0" "$PO1")
printf '\n🔁 최근 1초 활동 (지금 캐시 회수·메모리 추방이 일어나는 중인지)\n'
printf '  ⬆️ 추방 swapout %s MB/s   ⬇️ 복귀 swapin %s MB/s   📝 pageout %s MB/s\n' "$DSO" "$DSI" "$DPO"
if awk "BEGIN{exit !($DSO>1 || $DPO>5)}"; then
  printf '  ⚠️ 디스크 페이징 활발 — 메모리를 디스크로 주고받는 중. 체감 저하 가능.\n'
else
  printf '  ✅ 0 근처 — 캐시 회수·스왑 거의 없음. 쾌적.\n'
fi

printf '\n🔎 메모리 큰 소비자 (무엇이 떠서 사용 중인지)\n'
ps -A -o rss,comm | awk '
  $1 ~ /^[0-9]+$/ {
    name=$2
    if      (name ~ /[Cc]laude/)                      name="Claude"
    else if (name ~ /CoreSimulator|Simulator|Runner/) name="iOS 시뮬레이터"
    else if (name ~ /[Gg]oogle|Chrome/)               name="Chrome"
    else if (name ~ /Code Helper|Electron/)           name="Electron/VSCode"
    else if (name ~ /Xcode|[Ss]our[Kk]it/)            name="Xcode/SourceKit"
    else { sub(/.*\//,"",name) }
    rss[name]+=$1; cnt[name]++
  }
  END { for (k in rss) printf "%012d\t%.1f\t%d\t%s\n", rss[k], rss[k]/1048576, cnt[k], k }
' | sort -rn | head -5 | awk -F"\t" '$2+0>=0.3 {printf "  • %5s GB  %s (%d개)\n", $2, $4, $3}'
printf '  ※ RSS 기준 — 공유메모리 중복이라 위 사용 중 합보다 부풀려짐. 순위·상대크기만 참고\n'

if [ "${1:-}" != "" ]; then
  printf '\n🧮 지정 그룹 합계 /%s/\n' "$1"
  ps -A -o rss,command | grep -iE "$1" | grep -v grep | \
    awk '{s+=$1; n++} END{if(n) printf "  %d개 프로세스, 합계 %.1f GB\n", n, s/1048576; else print "  (매칭 프로세스 없음)"}'
fi
