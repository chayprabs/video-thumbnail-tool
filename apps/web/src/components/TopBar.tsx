import { Github, Globe } from 'lucide-react';

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="/" className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          ClipTools
        </a>
        <nav className="flex items-center gap-4" aria-label="External links">
          <a
            href="https://github.com/chayprabs/video-thumbnail-tool"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            title="GitHub repository"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href="https://x.com/chayprabs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            title="Twitter / X"
          >
            <XIcon className="h-4 w-4" />
            <span className="hidden sm:inline">@chayprabs</span>
          </a>
          <a
            href="https://www.chaitanyaprabuddha.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            title="Personal website"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Website</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
