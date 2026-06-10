# Downloading GitHub issue attachments

GitHub issue/PR attachments (images AND videos) are hosted at URLs like
`https://github.com/user-attachments/assets/<uuid>`. **Plain `curl` / `WebFetch`
without credentials returns `404 Not Found`** — GitHub hides existence behind a
404 rather than a 401/403. This file exists to avoid that failure.

## What counts as an attachment URL

Scan the issue **body and every comment** for:

- markdown images: `![alt](url)`
- HTML: `<img src="url">`, `<video src="url">`
- bare GitHub-hosted URLs: `github.com/user-attachments/assets/...`,
  `*.githubusercontent.com/...`, `github.com/<owner>/<repo>/assets/...`

## Download with an auth header

The same `user-attachments` URL can serve an image or a video; the content type
isn't in the URL, so download first, then branch on what came back:

```bash
mkdir -p .design-artifacts/issue-<N>
# Use an ABSOLUTE -o path — the Bash tool's cwd resets between calls, so a
# relative path can land somewhere unexpected or report "No such file".
out="$(pwd)/.design-artifacts/issue-<N>/attachment-1"
curl -L -H "Authorization: token $(gh auth token)" "<url>" \
  -o "$out" -w "%{http_code} %{content_type} %{size_download}\n"
file "$out"   # confirm content type and that the bytes are complete
```

(`.design-artifacts/` is a scratch dir; create it if missing. It's often
gitignored already — if not, just don't commit it.)

## Handle each attachment by type

- **Image** (`content_type` `image/*`) — rename with a matching extension
  (`.jpg`/`.png`) and **Read** it so you actually see it.
- **Video** (`content_type` `video/*`, e.g. screen recordings) — the Read tool
  **cannot render video**; don't try to Read the `.mp4`/`.mov` directly. Extract
  still frames with `ffmpeg` and Read those instead:

  ```bash
  mv "$out" "$out.mp4"
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$out.mp4"   # length
  mkdir -p "$(dirname "$out")/frames"
  ffmpeg -nostdin -loglevel error -i "$out.mp4" \
    -vf "fps=1" "$(dirname "$out")/frames/frame_%03d.png"   # ~1 frame/sec
  ```

  A bug video usually only needs a few well-spaced frames (start / interaction
  moment / end), so a denser `fps` is rarely worth it. If `ffprobe`/`ffmpeg`
  errors with `moov atom not found`, the download was truncated — confirm the
  on-disk size matches the `size_download` you logged and re-download to the
  absolute path before retrying.

## Failure handling

- No attachments → skip this whole file.
- A download still fails after the auth attempt → report it briefly and continue
  text-only. Don't get stuck on one attachment.
