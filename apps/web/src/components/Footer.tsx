export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-white py-6">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <div className="flex justify-center gap-6 text-sm text-[var(--muted)]">
          <a href="/privacy" className="hover:text-[var(--foreground)] hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-[var(--foreground)] hover:underline">
            Terms &amp; Conditions
          </a>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Provided as-is without warranty. You are responsible for your uploads and outputs.{' '}
          <a
            href="https://github.com/chayprabs/video-thumbnail-tool/blob/main/LICENSE"
            className="underline hover:text-[var(--foreground)]"
            rel="noopener noreferrer"
          >
            AGPL-3.0
          </a>
        </p>
      </div>
    </footer>
  );
}
