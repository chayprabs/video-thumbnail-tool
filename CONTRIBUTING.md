# Contributing to ClipTools

Thank you for your interest in contributing.

## Development setup

1. Fork and clone the repository.
2. Install Node 22+, pnpm, and FFmpeg.
3. Run `pnpm install` and start worker + web as described in README.md.

## Pull requests

- Use conventional commit messages (`feat:`, `fix:`, `chore:`, `test:`).
- Ensure `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
- Add tests for new FFmpeg pipelines or API behavior.

## Code style

- TypeScript strict mode
- Prettier for formatting
- Match existing patterns in `apps/worker` and `apps/web`

## License and legal

By contributing, you represent that:

- Your contribution is your original work or you have permission to submit it.
- You grant your contribution under **AGPL-3.0-or-later**.
- You understand the project is provided **without warranty** and that you will not hold the operator or other contributors liable beyond what applicable law requires.

See [LICENSE](LICENSE), [docs/LEGAL.md](docs/LEGAL.md), and the hosted [Terms](apps/web/src/app/terms/page.tsx) for context.
