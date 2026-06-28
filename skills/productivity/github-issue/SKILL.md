---
name: github-issue
description: "Unified GitHub issue workflow via the gh CLI — fetch an issue (body, labels, comments, image/video attachments) into the session, create a new issue from a template, or update an existing one (body, labels, state, comments). Handles the 404 that plain curl/WebFetch hits on GitHub attachment URLs by downloading with an auth token, and extracts viewable frames from video attachments. Use whenever the user mentions GitHub issues — 이슈 가져와, 이슈 조회, 이슈 등록, 이슈 생성, 이슈 만들어줘, 이슈 업데이트, 이슈 수정, 이슈 코멘트, 이슈 작업, fetch issue N, work on issue N, create an issue, update issue N, file a bug, /github-issue."
metadata:
  public: true
---

# GitHub Issue

Operate on GitHub issues with the `gh` CLI. One skill, three operations — dispatch on the user's words or the argument:

| User intent | Operation |
| --- | --- |
| "이슈 N 가져와 / 조회 / 작업", "fetch issue N", bare `/github-issue 94` | **Fetch** |
| "이슈 등록 / 생성 / 만들어줘", "create issue", "file a bug" | **Create** |
| "이슈 N 수정 / 업데이트 / 코멘트 / 닫아줘", "update issue N" | **Update** |

If the intent is genuinely ambiguous, ask which operation — don't guess.

## Common setup

- Confirm `gh auth status` works once; if not, stop and tell the user to run `gh auth login`.
- Default to the current repo. If the user names another repo, pass `-R <owner>/<repo>` to every `gh` call.

## Fetch

1. If no issue number was given, run `gh issue list`, show the open issues, and let the user pick.
2. `gh issue view <N> --json number,title,state,labels,author,url,body,comments`
3. Download every attachment found in the body and comments — **plain curl/WebFetch returns 404 on GitHub attachment URLs**. Follow [fetching.md](fetching.md) exactly (auth-token download, image Read, video → ffmpeg frames).
4. Summarize in the conversation: issue number/title/labels, the problem or request in one or two lines, and what the attachments show.
5. If the user is picking the issue up to work on it: locate the relevant code (grep for the symbols/strings the issue points at), state an initial hypothesis and candidate approach in a sentence or two — then stop. **Do not start editing code**; intake ends at understanding.

## Create

1. Pick a template, in this order:
   - The repo's own `.github/ISSUE_TEMPLATE/*.md|*.yml` if present — list them and match by intent.
   - Otherwise the bundled ones: [templates/bug-report.md](templates/bug-report.md), [templates/feature-request.md](templates/feature-request.md), [templates/task.md](templates/task.md).
2. Fill the template from the conversation and any context the user gave. Write the issue in the language of the repo's existing issues (check a recent one if unsure). Ask only for fields you genuinely can't fill — don't interrogate.
3. **Show the complete draft (title, body, labels) and wait for the user's OK before creating.** Filing an issue is outward-facing and visible to others; never skip this gate.
4. Create with a body file so markdown survives quoting:

   ```bash
   gh issue create --title "<title>" --body-file <draft.md> --label "<labels>"
   ```

   Only pass labels that already exist in the repo (`gh label list`) — `gh` errors on unknown labels. Same rule for `--add-label` on update.

5. Report the created issue URL.

## Update

1. Fetch the current state first (`gh issue view <N> --json title,body,labels,state`) — never edit blind.
2. Show what will change as before → after (title/body diff, labels added/removed, state change) and **get confirmation before applying**.
3. Apply with the matching command:
   - body/title/labels: `gh issue edit <N> --title/--body-file/--add-label/--remove-label`
   - comment: `gh issue comment <N> --body-file <comment.md>`
   - state: `gh issue close <N> [--comment]` / `gh issue reopen <N>`
4. Report the issue URL and what changed.

## Anti-patterns

- **WRONG**: `curl <attachment-url>` or WebFetch on `github.com/user-attachments/assets/...` → 404. **RIGHT**: download with `Authorization: token $(gh auth token)` per [fetching.md](fetching.md).
- **WRONG**: Read a downloaded `.mp4` directly (wastes a turn, shows nothing). **RIGHT**: extract frames with ffmpeg and Read those.
- **WRONG**: `gh issue create`/`edit` straight away with a body you never showed. **RIGHT**: full draft → user confirmation → apply.
- **WRONG**: free-form issue body because the template "doesn't quite fit". **RIGHT**: pick the closest template and drop sections that are truly N/A.
