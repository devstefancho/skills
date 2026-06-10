# Brain Storm Report Format

Include this report (filled in) in the final response after writing all idea files. It must be part of the response, not a separate file.

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
