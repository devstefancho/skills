---
id: "{{ID}}"
phase: {{PHASE}}
title: "{{TITLE}}"
spec: "{{SPEC_PATH}}"
depends_on: {{DEPENDS_ON}}
blocks: {{BLOCKS}}
estimate: "{{ESTIMATE}}"
status: "todo"
owner: ""
sprint: ""
---

# Task {{ID}} — {{TITLE}}

> Spec: [`{{SPEC_PATH}}`]({{SPEC_REL_PATH}})

## 의존성

{{DEPENDENCY_LINES}}

## 사전 준비

- [ ] {{PREREQ_1}}
- [ ] {{PREREQ_2}}

## 구현 체크리스트

{{CHECKLIST_ITEMS}}

## Definition of Done

- [ ] 로컬 검증 절차 통과
- [ ] 자동화된 테스트 통과
- [ ] 관측 가능성 (로그/메트릭/감사) 확인

## 리스크 / 메모

- {{RISK_OR_NOTE}}
