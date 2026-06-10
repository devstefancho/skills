# claude-plugins — Spec/Task Authoring Language

The vocabulary used by the authoring plugins (`writing-specs`, `writing-tasks`, `writing-flows`) for how generated documents are organized inside a target project. This is a glossary, not a spec.

## Language

**Spec**:
A single unit of intended work in a fixed template (Purpose, Requirements, Approach, Verification).
_Avoid_: requirement doc, ticket

**Task**:
An executable, dependency-aware decomposition of a Spec, tracked as a file with frontmatter. One Task references exactly one Spec.
_Avoid_: issue, todo

**Flow**:
A single document capturing how one scenario behaves at runtime — actors/trigger (use case), a sequence diagram, and the step-by-step user flow with branches — in one fixed template. One Flow = one scenario.
_Avoid_: use case doc, diagram file, user journey

**Topic**:
The coherent feature/domain a Spec or Task belongs to (e.g. `auth`, `news`, `race`). The top-level organizing axis under `docs/specs/` and `docs/tasks/`, inferred from the conversation that produced the document.
_Avoid_: phase, feature-folder, module

**Phase** _(retired)_:
Formerly the monotonic sprint number used as the directory axis (`specs/phase-N/`). Replaced by **Topic**. Sequencing now lives in Task `depends_on`; roadmap framing lives in PRD **Stages**, not here.

**Cross-cutting constraint**:
An ordering or structural requirement between Tasks that `depends_on` cannot express (e.g. "migration X must ship before deploy Y, or GDPR delete fails"). Captured as human prose in a single coordination doc, never derived from frontmatter.
_Avoid_: dependency (that is the frontmatter graph; this is the WHY it can't hold)

## Relationships

- A **Topic** groups one or more **Specs**, and zero or more **Flows**
- A **Flow** documents exactly one scenario; it may mention Specs in prose but carries no structural reference (no frontmatter link)
- A **Spec** is decomposed into one or more **Tasks**
- A **Task** references exactly one **Spec**, and zero or more other **Tasks** via `depends_on`

## Example dialogue

> **Dev:** "This race-schema change — does it go in a new bucket like the old phase-9?"
> **Maintainer:** "No. It's a **Topic**, not a **Phase**. It joins the existing `race` **Topic** with the other race **Specs**. Order is whatever its **Task** declares in `depends_on` — the folder says nothing about sequence."

## Flagged ambiguities

- **Phase vs Stage**: in the source project (runner/web, ADR-0008) **Phase** = technical axis, **Stage** = product axis (PRD-only). This work retires the **Phase** directory axis entirely; **Stage** is untouched and remains the home for roadmap framing.
