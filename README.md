# ClipTools (`video-thumbnail-tool`)

**Trim, concat, remux video and generate thumbnails, contact sheets, sprite sheets and shot boundaries online with FFmpeg.**

ClipTools is a standalone open-source video utility playground. Upload a video, choose an operation (trim, concat, remux, thumbnails, contact sheet, sprite sheet + WebVTT, shot detection, or JSON edit-list), and download results. Stream-copy is used whenever codecs allow for fast, lossless cuts.

## Features

- **Trim** — Frame-accurate in/out timecodes with stream-copy toggle
- **Concat** — Join clips; warns and re-encodes on codec mismatch
- **Remux** — MP4 ↔ MKV ↔ WebM ↔ MOV
- **Thumbnails** — At timecode, even-spaced strip, scene-aware poster
- **Contact sheet** — Configurable grid montage with timestamps
- **Sprite sheet** — Rows/cols/interval + WebVTT for hover-scrub players
- **Shot detection** — Scene-change timestamps with confidence
- **JSON edit-list** — Shotstack-lite-style timeline to MP4

## Quick start

### Requirements

- Node.js 22+
- pnpm 9+
- FFmpeg (for local worker and tests)

### Development

```bash
pnpm install
pnpm --filter @clip-tools/shared-types build
pnpm --filter @clip-tools/shared-worker-runtime build

# Terminal 1 — worker
pnpm --filter @clip-tools/worker dev

# Terminal 2 — web
pnpm --filter @clip-tools/web dev
```

Open [http://localhost:3000](http://localhost:3000). The web app proxies `/api/*` to the worker at `http://localhost:8787`.

### Docker

```bash
docker compose up --build
```

- Web: http://localhost:3000
- Worker health: http://localhost:8787/health

## API

| Endpoint | Description |
|----------|-------------|
| `POST /v1/probe` | Media metadata |
| `POST /v1/clip` | Trim |
| `POST /v1/concat` | Concatenate |
| `POST /v1/remux` | Container remux |
| `POST /v1/thumbnails` | Thumbnails |
| `POST /v1/contactsheet` | Contact sheet |
| `POST /v1/sprites` | Sprite + VTT |
| `POST /v1/shots` | Shot detection |
| `POST /v1/edit-list` | JSON timeline render |

All processing endpoints accept `multipart/form-data` with `file` (or `files` for concat) and optional `payload` JSON.

## Project structure

```
apps/web/          Next.js 15 playground
apps/worker/       Hono + FFmpeg worker
packages/shared-types/
packages/shared-worker-runtime/
docker-compose.yml
```

## License

AGPL-3.0-or-later — see [LICENSE](LICENSE).

## Links

- [GitHub](https://github.com/chayprabs/video-thumbnail-tool)
- [Privacy Policy](/privacy) (on deployed site)
- [Terms & Conditions](/terms)
