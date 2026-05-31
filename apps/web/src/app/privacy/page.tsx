export const metadata = {
  title: 'Privacy Policy — ClipTools',
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-[var(--muted)]">Last updated: May 31, 2026</p>

      <h2>1. Overview</h2>
      <p>
        ClipTools (&quot;we&quot;, &quot;the service&quot;) is an open-source video utility operated by
        Chaitanya Prabuddha. This policy explains how we handle information when you use the hosted
        playground or self-host the software.
      </p>

      <h2>2. Information we process</h2>
      <p>
        When you upload a video, the file is stored temporarily in an isolated job directory on the
        server, processed with FFmpeg, and deleted after a configurable retention period (default:
        one hour). We do not require accounts for basic use.
      </p>

      <h2>3. What we do not do</h2>
      <ul>
        <li>We do not sell your data.</li>
        <li>We do not log video content, passwords, or full filenames in application logs.</li>
        <li>We do not use third-party advertising or tracking pixels on the playground.</li>
      </ul>

      <h2>4. Logs</h2>
      <p>
        Standard server logs may record IP address, request path, HTTP status, and timestamps for
        security and abuse prevention. These logs are rotated and not combined with uploaded media.
      </p>

      <h2>5. Self-hosting</h2>
      <p>
        If you deploy ClipTools yourself, you are the data controller. This policy applies to the
        reference implementation&apos;s defaults; adjust retention and logging for your jurisdiction.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, or delete personal data.
        Because uploads are ephemeral, deletion occurs automatically when the job TTL expires. Contact
        the operator via the website linked in the header for other requests.
      </p>

      <h2>7. Children</h2>
      <p>The service is not directed at children under 13.</p>

      <h2>8. Changes</h2>
      <p>We may update this policy; the date above will reflect the latest version.</p>

      <h2>9. Disclaimer</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY. See the Terms &amp; Conditions for
        limitation of liability.
      </p>

      <p>
        <a href="/">← Back to ClipTools</a>
      </p>
    </article>
  );
}
