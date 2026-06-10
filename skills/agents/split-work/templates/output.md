<!-- SPLIT-WORK-OUTPUT: 호출자는 아래 전문(특히 <task> XML)을 축약·생략 금지. 사용자가 worktree 첫 메시지로 복사하는 원본임. -->

💾 저장됨: {파일 절대경로}

# 작업 현황 요약

- 진행률: {완료/전체}
- 다음 우선순위: {top 3-5}
- 병렬 가능 묶음: {A, B...}

---

# 🟢 즉시 병렬 가능 (묶음 A)

## Task {번호} — {제목}
```bash
cld -w "worktree-task-{번호}"
```
**시작 프롬프트:**
```xml
<task id="...">...</task>
```

(묶음 안의 나머지 task 반복)

---

# 🟡 순차 진행 (묶음 A 완료 후)

...

---

# 🟣 독립 진행

...

---

# 한번에 붙여넣기 (묶음 A)

```bash
cld -w "worktree-task-045"
cld -w "worktree-task-042"
cld -w "worktree-task-097"
```

---

**범례:** 🟢 즉시 병렬 / 🟡 선행 대기 / 🟣 독립 진행
