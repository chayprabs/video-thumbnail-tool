export const metadata = {
  title: 'Privacy Policy — ClipTools',
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
      <h1>Privacy Policy</h1>
      <p className="text-[var(--muted)]">Last updated: 1 June 2026</p>

      <p className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        This Privacy Policy describes how <strong>Chaitanya Prabuddha</strong> (&quot;we&quot;,
        &quot;us&quot;, &quot;operator&quot;) handles information when you use the ClipTools hosted
        service. It is not legal advice. Requirements vary by country; consult a local lawyer for
        high-risk or commercial deployments.
      </p>

      <h2>1. Scope</h2>
      <p>
        This policy applies to the ClipTools website and hosted playground at our public deployment.
        It does <strong>not</strong> govern third-party sites we link to (GitHub, social media,
        personal websites). If you <strong>self-host</strong> ClipTools, you are the data controller
        for your instance; this policy is a reference only.
      </p>

      <h2>2. Summary</h2>
      <ul>
        <li>We do not require an account for basic use.</li>
        <li>Uploaded videos are stored temporarily, then deleted on a schedule.</li>
        <li>We do not sell your personal information.</li>
        <li>We do not use advertising trackers on the playground.</li>
        <li>We do not intentionally log video content or file contents.</li>
      </ul>

      <h2>3. Information we process</h2>
      <p>
        <strong>Uploaded media:</strong> When you upload or import a video, the file is stored in an
        isolated per-job directory on the server, processed with FFmpeg (and related tools), and
        removed after a retention period (default: approximately one hour unless configured otherwise
        on self-hosted deployments).
      </p>
      <p>
        <strong>Technical data:</strong> We may process IP address, browser type, request timestamps,
        HTTP paths, error codes, and similar technical logs for security, abuse prevention, and
        operations. These are not combined with media content in application logs.
      </p>
      <p>
        <strong>URL import:</strong> If you paste a video URL, our server fetches that URL to obtain
        the file. Only use URLs you have the right to access. We do not retain the URL longer than
        needed for the job.
      </p>
      <p>
        <strong>Contact:</strong> If you email or contact us, we process the information you send.
      </p>

      <h2>4. Legal bases (EEA/UK/Switzerland and similar regions)</h2>
      <p>Where applicable law requires a legal basis, we rely on:</p>
      <ul>
        <li>
          <strong>Contract / steps at your request</strong> — to process your video job when you
          click Run;
        </li>
        <li>
          <strong>Legitimate interests</strong> — security, fraud prevention, improving reliability,
          and defending legal claims, balanced against your rights;
        </li>
        <li>
          <strong>Legal obligation</strong> — when we must comply with law or valid legal process;
        </li>
        <li>
          <strong>Consent</strong> — where required (e.g. optional communications), which you may
          withdraw.
        </li>
      </ul>

      <h2>5. What we do not do</h2>
      <ul>
        <li>Sell or rent personal information to data brokers.</li>
        <li>Use cross-site advertising pixels on the core playground.</li>
        <li>Log passwords, file contents, or raw video bytes in application logs.</li>
        <li>Claim ownership of your uploaded media.</li>
      </ul>

      <h2>6. Retention</h2>
      <p>
        Job files and outputs are deleted automatically after the configured TTL (default about one
        hour). Server logs may be retained for a limited period for security and then rotated or
        deleted. Backup systems, if any, should follow the same TTL in production configurations.
      </p>

      <h2>7. Sharing and disclosure</h2>
      <p>We may share information only:</p>
      <ul>
        <li>With infrastructure providers (hosting) under confidentiality obligations;</li>
        <li>When required by law, court order, or governmental request;</li>
        <li>To protect rights, safety, and security of users and the public;</li>
        <li>In connection with a merger or asset sale, with notice where required by law.</li>
      </ul>
      <p>We do not authorize third parties to use your uploads for their own marketing.</p>

      <h2>8. International transfers</h2>
      <p>
        The Service may be operated from servers in one or more countries. If you access the Service
        from outside that region, your information may be transferred internationally. Where required,
        we rely on appropriate safeguards (such as standard contractual clauses or equivalent
        mechanisms) or your explicit consent through use of the Service where permitted by law.
      </p>

      <h2>9. Security</h2>
      <p>
        We use reasonable technical and organizational measures (isolated job directories, size limits,
        TTL deletion, restricted logging). <strong>No method of transmission or storage is 100%
        secure.</strong> We cannot guarantee absolute security. You use the Service at your own risk.
        Report suspected vulnerabilities via our{' '}
        <a
          href="https://github.com/chayprabs/video-thumbnail-tool/blob/main/SECURITY.md"
          className="text-[var(--accent)] underline"
          rel="noopener noreferrer"
        >
          security policy
        </a>
        .
      </p>

      <h2>10. Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, restrict,
        object to processing, data portability, or withdraw consent. Because uploads are ephemeral,
        deletion often occurs automatically when the job TTL expires. To exercise rights, contact us
        via the website in the header. We may need to verify your identity. We will respond within
        timeframes required by applicable law.
      </p>
      <p>
        <strong>EEA/UK:</strong> You may lodge a complaint with your local supervisory authority.{' '}
        <strong>California (CCPA/CPRA):</strong> We do not sell personal information as defined by
        California law. <strong>Brazil (LGPD)</strong> and other laws may grant additional rights—we
        honor mandatory legal requirements.
      </p>

      <h2>11. Children</h2>
      <p>
        The Service is not directed to children under 13 (or 16 where applicable law requires). We do
        not knowingly collect personal data from children. If you believe a child provided data,
        contact us and we will delete it.
      </p>

      <h2>12. Automated processing</h2>
      <p>
        Video processing is automated (FFmpeg pipelines). We do not use uploaded videos to train
        machine-learning models. Outputs are generated solely to fulfill your request.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update this policy. The &quot;Last updated&quot; date will change. Material changes may
        be highlighted on the site. Continued use after changes constitutes acceptance where permitted
        by law.
      </p>

      <h2>14. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, our liability for privacy-related claims is subject
        to the limitations and exclusions in our{' '}
        <a href="/terms" className="text-[var(--accent)] underline">
          Terms &amp; Conditions
        </a>
        . Nothing in this policy limits liability that cannot be limited under applicable law.
      </p>

      <h2>15. Contact</h2>
      <p>
        Privacy requests and questions:{' '}
        <a
          href="https://www.chaitanyaprabuddha.com"
          className="text-[var(--accent)] underline"
          rel="noopener noreferrer"
        >
          www.chaitanyaprabuddha.com
        </a>
        .
      </p>

      <p>
        <a href="/">← Back to ClipTools</a>
      </p>
    </article>
  );
}
