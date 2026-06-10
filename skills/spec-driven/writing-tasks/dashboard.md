# Status Dashboard (derived, no stored file)

Printed when `/writing-tasks` runs with fully-mapped tasks. Everything is computed from task frontmatter at runtime — nothing is persisted.

## Output format

```
📊 Progress: X / Y done (Z%)

   Phase 1 — foundation         ████████░░░░  6/12
   Phase 2 — auth               ██░░░░░░░░░░  2/9
   ...

🔵 In progress (N):
   <id>  <title>          <duration since status change>

✅ Ready to start (N):
   <id>  <title>          (all deps met)

⚡ Suggested parallel lanes (only show if >= 2 ready tasks):
   Lane A: [ids]     → touches <shared module>
   Lane B: [ids]     → touches <different module>

⚠️  Blocked (N):
   <id> waiting on <id>

⚠️  Validation issues (only if any):
   <brief list>
```

## Computing "ready"

A task is ready when `status == "todo"` AND every id in `depends_on` has `status == "done"`.

## Computing parallel lanes

For all ready tasks:

1. Read each task's `구현 체크리스트` section, extract file paths / module directories.
2. Group by shared top-level module directory (e.g. `packages/api/src/routes/`).
3. Same group → same lane (sequential). Different groups → different lanes (parallel).
4. Flag conflicts when two lanes touch the same directory but are split by the user manually.
