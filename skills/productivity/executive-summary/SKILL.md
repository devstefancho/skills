---
name: executive-summary
description: Compresses a long output, report, or analysis into a one-page executive (CEO/CTO) brief — conclusion first, key points only, technical detail translated into business impact. Use when the user wants the gist of something too long for a decision-maker, with phrases like 내용이 너무 많아서 읽기 힘들다, 한눈에 안 들어온다, 다 읽기 귀찮으니 요약해줘, CEO/CTO에게 보고하듯, 한 페이지로 정리해줘, 핵심만 압축해서 알려줘, 정리해줘, 요약해줘.
allowed-tools: Read, Write, Bash
metadata:
  public: true
---

# Executive Summary

Compress something long into a one-page brief a CEO or CTO can absorb at a glance — without dropping the facts they need to decide.

## Find the source first

Usually the source is the immediately preceding long response in this conversation. It can also be a file or doc the user points to, or — when the request is to *produce* a result as a one-pager — the work you're about to finish. Summarize that, don't invent.

## Hard Rules

The reader **decides**, they don't implement — that drives every rule:

- **Lead with the answer.** The first line is the bottom line — the conclusion or the decision needed, never background or methodology. Re-structure around the decision; don't just shrink the source's section order.
- **Translate, don't transcribe.** Turn technical detail into impact — what changed, why it matters, what it costs, what's at risk — and drop implementation minutiae.
- **Keep the load-bearing facts.** One page tempts over-cutting, the more common failure: drop the specifics a decision rests on and the reader just asks again. Preserve the key numbers, the blocker, the cost, the deadline, the recommended option. When you do leave detail out, point to where it lives ("상세 내역은 원문 참고") instead of dropping it silently.
- **One page, scannable.** Roughly one screen (~150–250 words), short bullets, one idea per line. If it won't fit, prioritize harder — don't shrink the font.

## Structure

Match the user's language (Korean by default, 존댓말·간결체). Use this template and omit any section that would be empty:

```
# [한 줄 제목 = 결론]

**한 줄 요약** — [의사결정자가 가장 먼저 알아야 할 1–2문장]

## 핵심 포인트
- [영향·결과 중심, 3–5개, 각 한 줄]

## 결정 / 다음 액션
- [필요한 승인·결정·다음 단계, 1–3개]

## 리스크·비용 (있을 때만)
- [블로커, 비용, 일정 리스크]
```

Comparing options? Use a table instead of bullets:

```
| 항목 | 옵션 A | 옵션 B |
|------|--------|--------|
| 비용 | …      | …      |
```

## Output medium

- **Default — inline.** Render the brief directly in your reply. Most "정리해줘 / 알려줘" requests want it right here — don't make a file unless asked.
- **HTML one-pager** — when the user says "html로", "열어줘", "보기 쉽게", or wants something shareable or printable. Steps:
  1. `cp templates/onepager.html "$TMPDIR/exec-brief.html"` (fall back to `/tmp` if `$TMPDIR` is unset).
  2. Fill the editable regions (marked with HTML comments); delete sections you don't use.
  3. `open "$TMPDIR/exec-brief.html"` (macOS).

## Anti-patterns

- **WRONG**: 한 페이지에 맞추려고 핵심 숫자·블로커·비용까지 잘라내 "느낌만" 남긴다 → 독자가 다시 물어본다. **RIGHT**: 덜 중요한 디테일을 빼되 의사결정에 필요한 load-bearing 사실은 남기고, 생략분은 "원문 참고"로 가리킨다.
- **WRONG**: 원문의 소제목 순서를 그대로 줄여 베끼고 결론을 맨 끝에 둔다. **RIGHT**: 결론을 첫 줄에 올리고 의사결정자 관점(결론 → 근거 → 액션)으로 재구성한다.

## Boundaries

Compression only — this reshapes content that already exists into a brief, not new research or analysis. It pairs naturally *after* any skill that emits a long artifact (audits, roadmaps, reports). Keep it to one page; if the source genuinely needs deeper work, that's a separate task, not a longer summary.
