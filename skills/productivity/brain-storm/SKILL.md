---
name: brain-storm
description: Brainstorm future features and improvements based on the current codebase. This is the ideation step before writing specs. Use when the user asks to brainstorm ideas, generate feature ideas, explore improvements, review future opportunities, or clean up outdated brainstorm notes.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
context: fork
agent: general-purpose
---

# Brain Storm

Use this skill before `/writing-specs` to explore what could be built next. The skill scans the codebase, proposes grounded ideas, adds lightweight wireframes, and saves selected ideas into the `brain-storm/` directory for later refinement.

## Two Modes

This skill supports two modes. Pick the mode that matches the user's request.

- **Brainstorm Mode**: Generate, compare, and save new ideas.
- **Cleanup Mode**: Review existing brainstorm notes, detect already-implemented ideas, and remove them after user confirmation.

## Principles

1. **Explore before proposing** - Understand the codebase before suggesting ideas.
2. **Diverge then converge** - Generate multiple strong options before asking the user to choose.
3. **One idea = one file** - Store each meaningful idea as its own markdown file.
4. **Always visualize** - Every saved idea should include a simple ASCII wireframe or system sketch so the implementation direction is easier to discuss.
5. **Prune the implemented** - Cleanup mode should remove stale brainstorm notes only after evidence-based verification and user approval.

## Directory Rules

- Ideas live in `brain-storm/` at the project root.
- File format: `brain-storm/{name}.md` or `brain-storm/{subdir}/{name}.md`.
- Only one directory level is allowed under `brain-storm/`.
- Filenames must use lowercase-with-hyphens.
- Create subdirectories only when the user requests grouping or when five or more ideas share the same domain.

---

## Brainstorm Mode

### Step 1: Scan and Ideate

1. Run `Glob` on important project directories such as `src/**`, `app/**`, `pages/**`, `components/**`, and `lib/**` to understand the structure.
2. Run `Glob brain-storm/**/*.md` to inspect existing brainstorm notes.
3. Read `package.json`, `README.md`, and any obvious entry-point files to understand the product and stack.
4. Generate 3-5 ideas based on the scan. For each idea, present:
   - **Title**
   - **Description**: 1-2 sentences
   - **Complexity**: Low / Medium / High
   - **Quick wireframe sketch**: 3-5 lines of ASCII to give a visual sense of the idea
5. Ask the user which ideas to save.

Ideas must be grounded in the actual codebase, actionable, and varied in scope.

### Step 2: Deduplicate and Write

For each selected idea:

1. Extract 3-5 key nouns from the title and description.
2. Run `Grep` across `brain-storm/**/*.md` for those keywords.
3. If a duplicate or near-duplicate exists, ask whether to update the existing file, create a new file, or skip it.
4. Read the idea template at `templates/idea-template.md`.
5. Read the wireframe guide at `templates/wireframe-guide.md`.
6. Fill every section:
   - **Summary**: 1-2 sentences
   - **Motivation**: 2-4 sentences referencing specific codebase areas
   - **Proposed Approach**: 3-7 bullet points without code snippets
   - **Wireframe**: ASCII art in a fenced code block, at least 10 lines
   - **Complexity**: Low / Medium / High with a one-sentence reason
   - **Open Questions**: 1-3 bullets
7. Write the completed idea file under `brain-storm/`.

### Step 3: Report

After writing all idea files, include this report in the final response:

```markdown
## Brain Storm Report

| Field | Value |
|-------|-------|
| Action | Created / Updated |
| Ideas Proposed | {count} |
| Ideas Saved | {count} |

### Saved Ideas
| File | Title | Complexity |
|------|-------|-----------|
| `{path}` | {title} | {complexity} |

### Next Steps
- Refine an idea into a spec (recommended — pass the file path so writing-specs reads it directly):
  `/writing-specs brain-storm/{file-name}.md`
  (Title or keyword also works: `/writing-specs "{idea title}"`)
- Generate a UI prototype preview for a UI-focused idea: `/ui-prototype-preview {idea title}`
```

The report must be part of the final response, not a separate file.

---

## Cleanup Mode

Triggered by requests such as "clean up brainstorm notes" or "remove ideas that are already implemented".

### Step 1: Detect Implemented Ideas

1. Run `Glob brain-storm/**/*.md` to list all idea files.
2. For each idea:
   a. Read the file and extract the title and summary.
   b. Extract 3-5 implementation-indicator keywords such as component names, function names, routes, or API endpoints.
   c. Run `Grep` for those keywords in the source code while excluding `brain-storm/`, `specs/`, `node_modules/`, and `.git/`.
   d. Mark the idea as implemented only if multiple matches clearly represent the described functionality rather than TODOs or naming coincidence.

### Step 2: Confirm and Delete

1. Present the implemented candidates with supporting evidence.
2. Ask the user whether to delete all, delete selected ideas, or cancel.
3. Delete files only after explicit confirmation.
4. Report the result with status and evidence for each reviewed idea.

---

## Non-interactive defaults

If the harness signals non-interactive mode (auto mode, scheduled run, headless agent — i.e. `AskUserQuestion` is unavailable or the user has stated "automatic" / "no questions"), use these defaults instead of asking. **Always echo the defaulted decisions back in the final report so the user can override.**

| Decision point | Default | Rationale |
|---|---|---|
| Which ideas to save (Brainstorm Step 1) | Save 2 ideas: pick the most diverse pair (1 UX/polish + 1 new capability), preferring Low/Medium complexity. | Diversity beats volume; low-complexity proves out the workflow without committing to large work. |
| Duplicate detected (Brainstorm Step 2) | Skip writing the new file. | Never overwrite user-authored notes silently. |
| Cleanup deletion (Cleanup Step 2) | **Refuse**: report candidates only, do not delete. | Deletion is unrecoverable; require an explicit follow-up command. |
