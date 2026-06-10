# 스크린샷 해상도

Claude vision encoder는 긴 변 **1568px**까지만 손실 없이 처리한다. 그 이상은 자동 다운스케일되어 픽셀 낭비 + 응답 지연. 토큰 ≈ (w×h)/750.

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

## 예외

폰트가 작거나 PDF 페이지 읽기 등 **해상도가 낮아 못 읽을 때만** 1568 상향(2000~2500). 대부분 1568로 충분.

## snapshot 우선

snapshot(yaml)은 토큰 기준이라 해상도 무관 — 가능하면 screenshot보다 snapshot 먼저.

## PDF 뷰어

playwright로 페이지 넘기기 어려움 → 사용자에게 "n페이지로 넘겨줘" 요청 → `screenshot`으로 읽음 (위 리사이즈 적용).
