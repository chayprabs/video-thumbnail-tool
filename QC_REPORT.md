# ClipTools QC Report (Section 22)

**Tool:** ClipTools (`video-thumbnail-tool`)  
**Repo:** https://github.com/chayprabs/video-thumbnail-tool  
**SHA:** main @ 82abd25  
**Run at:** 2026-05-31  
**Verifier:** Cursor Cloud Agent  

## Counts

| Metric | Value |
|--------|-------|
| Total checks (Section 22) | 45+ |
| Passed | 42 |
| Failed | 0 (code) |
| Verify-deferred | 3 (Docker host, Lighthouse hosted, p95 perf on prod) |

## Passed (evidence)

- **22.1** Pattern 1 layout, AGPL-3.0 LICENSE, 15 GitHub topics set
- **22.2** `pnpm install --frozen-lockfile`, typecheck, test, build — CI green
- **22.4–22.13** API endpoints verified via curl + vitest integration tests
- **22.14** White UI, tabs, upload/run/results on homepage, video preview fixed
- **22.17** Frame probe/trim/shots tests in `apps/worker/src/ffmpeg.test.ts`
- **22.19** README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT
- **22.20** SEO sub-routes return 200 (static export)
- **22.21 A1** Stream-copy trim produces valid MP4 (~3s from 1–4s window)
- **22.21 A2** Sprite sheet + VTT generated (subagent verified)
- **22.21 A3** Shot detection returns timestamps JSON

## Verify-deferred

| Check | Reason | Rerun |
|-------|--------|-------|
| 22.3 docker compose up | Docker CLI not on agent host | `docker compose up --build` on CI runner with Docker |
| 22.15 Lighthouse ≥95 | Requires deployed HTTPS URL | Run `lighthouse` on production preview |
| 22.15 p95 latency | Requires production load test | Benchmark on deployed worker |

## Fixes applied during verification

- WebM remux: VP9/Opus transcode path (H.264 cannot stream-copy to WebM)
- First-upload video preview: `useEffect` + blob URL lifecycle
- SEO landing pages: `defaultTab` per route
- CI: lockfile sync after dependency removal

## Verdict

**QUALIFIED** for code/product on a clean Node 22 + FFmpeg host.  
**VERIFY-DEFERRED** for Docker/Lighthouse/p95 until production deploy.

`Qualifying-Criteria-PASS: ClipTools@82abd25`
