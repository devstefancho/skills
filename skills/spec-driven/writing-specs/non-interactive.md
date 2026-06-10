# Non-interactive Defaults

Applies when `AskUserQuestion` is unavailable (auto mode, headless agent, scheduled run). Use these defaults and echo every defaulted decision in the Phase 5 report so the user can override.

| Decision point | Default | Rationale |
|---|---|---|
| Phase 0: title matches multiple brain-storm files | Pick the file whose H1 exactly matches (case-insensitive) the argument; if still ambiguous, pick the first by alphabetical filename. | Determinism > guessing user intent. |
| Phase 0: no input source resolvable (no arg, no conversation context) | Refuse: report "no spec source identified, please provide a brain-storm path or description." | Silent guessing produces wrong specs. |
| Phase 2: exact match found | **Update** the existing spec, preserving any sections the user did not ask to change. | The intent is almost always "evolve the existing spec." |
| Phase 2: related specs found | Proceed with a **new file**, listing the related specs in the report so the user can merge later if needed. | Avoid silent merges into adjacent specs. |
| Phase 2: outdated specs found | Skip auto-update; list them in the report under "Outdated specs detected". | Phase 4 explicitly forbids auto-modify. |
| Choosing phase + NN: ambiguous milestone | Use the **active phase** (highest existing) and append `NN+1`. Do not create a new phase automatically. | New phases imply a milestone boundary the user should own. |
