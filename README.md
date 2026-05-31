# ClipTools (`video-thumbnail-tool`)

**Trim, concat, remux video and generate thumbnails, contact sheets, sprite sheets and shot boundaries online with FFmpeg.**

ClipTools is a standalone open-source video utility playground. Upload a video (drag-and-drop, URL import, or built-in samples), choose an operation, and download results. Stream-copy is used whenever codecs allow for fast, lossless cuts.

## Features (PRD-complete)

| Feature | Description |
|---------|-------------|
| **Inputs** | Drag-drop, URL paste, 3 sample videos |
| **Probe** | Container, codecs, resolution, FPS, bitrate, chapters, duration |
| **Trim** | In/out timecodes, stream-copy, multi-segment concat |
| **Concat** | Multiple clips, codec-mismatch re-encode |
| **Remux** | MP4, MKV, WebM, MOV |
| **Thumbnails** | Timecode, even-spaced strip, scene-aware poster |
| **Contact sheet** | Grid montage with timestamps, rows/cols/scale |
| **Sprite + WebVTT** | Hover-scrub sprite sheet |
| **Shot detection** | Scene timestamps + confidence (JSON) |
| **JSON edit-list** | Shotstack-lite timeline → MP4 |
| **Preview** | Scrub-able timeline with set In/Out/thumbnail |

## Quick start

### Requirements

- Node.js 22+
- pnpm 10+
- FFmpeg (for worker and tests)

### Development

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm --filter @clip-tools/shared-types build
pnpm --filter @clip-tools/shared-worker-runtime build

# Terminal 1 — worker
pnpm --filter @clip-tools/worker dev

# Terminal 2 — web
pnpm --filter @clip-tools/web dev
```

Open [http://localhost:3000](http://localhost:3000). API requests go to `/api/v1/*` (proxied to the worker).

### Docker

```bash
# Full stack (web + worker)
docker compose up --build

# Worker only
docker compose -f docker-compose.single.yml up --build
```

- Web: http://localhost:3000
- Worker health: http://localhost:8787/health

## API

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Service health |
| `POST /v1/probe` | Media metadata |
| `POST /v1/clip` | Trim (multipart: `file`, `payload` JSON) |
| `POST /v1/concat` | Concatenate (`files[]`, `payload`) |
| `POST /v1/remux` | Container remux |
| `POST /v1/thumbnails` | Thumbnails |
| `POST /v1/contactsheet` | Contact sheet |
| `POST /v1/sprites` | Sprite + VTT |
| `POST /v1/shots` | Shot detection |
| `POST /v1/edit-list` | JSON timeline render |

Web-only: `POST /api/import` — fetch a video URL server-side (max 200MB).

## Testing

```bash
pnpm test                  # unit + ffmpeg integration
pnpm test:integration      # live worker API (worker must be running)
pnpm test:e2e              # Playwright (web + worker)
pnpm typecheck
pnpm build
```

## Project structure

```
apps/web/          Next.js 15 playground
apps/worker/       Hono + FFmpeg worker
packages/shared-types/
packages/shared-worker-runtime/
docker-compose.yml
e2e/               Playwright tests
fixtures/          Test video
```

## SEO routes

- `/video-trim-online`
- `/video-thumbnail-generator`
- `/video-sprite-sheet`
- `/scene-detect-online`
- `/video-contact-sheet`

## Privacy & security

- Ephemeral per-job storage with TTL cleanup
- No video content in logs
- CSP and security headers on web
- See [SECURITY.md](SECURITY.md) and [privacy policy](/privacy) on the deployed site

## License

AGPL-3.0-or-later — see [LICENSE](LICENSE).

## Links

- [GitHub](https://github.com/chayprabs/video-thumbnail-tool)
- Maintainer: [@chayprabs](https://x.com/chayprabs) · [chaitanyaprabuddha.com](https://www.chaitanyaprabuddha.com)
