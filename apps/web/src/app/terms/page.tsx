export const metadata = {
  title: 'Terms & Conditions — ClipTools',
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <h1>Terms &amp; Conditions</h1>
      <p className="text-sm text-[var(--muted)]">Last updated: May 31, 2026</p>

      <h2>1. Acceptance</h2>
      <p>
        By using ClipTools you agree to these terms. If you do not agree, do not use the service.
      </p>

      <h2>2. Service description</h2>
      <p>
        ClipTools provides server-side video processing (trim, concat, remux, thumbnails, sprites,
        shot detection) via FFmpeg. Output quality and compatibility depend on your source media
        and selected options.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Upload illegal, infringing, or malicious content.</li>
        <li>Attempt to disrupt, overload, or bypass rate or size limits.</li>
        <li>Use the service for unlawful surveillance or harassment.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        You retain ownership of videos you upload. You grant the service a limited, temporary
        license to process files solely to fulfill your request. You represent that you have the
        rights to upload and process the content.
      </p>

      <h2>5. No professional advice</h2>
      <p>
        ClipTools is a technical utility, not legal, medical, or professional advice. Verify outputs
        before production use.
      </p>

      <h2>6. Disclaimer of warranties</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE AND SOFTWARE ARE PROVIDED &quot;AS
        IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
        INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE OPERATORS, CONTRIBUTORS, OR
        AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
        DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE,
        EVEN IF ADVISED OF THE POSSIBILITY. OUR AGGREGATE LIABILITY SHALL NOT EXCEED ONE HUNDRED
        U.S. DOLLARS (USD $100) OR THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM,
        WHICHEVER IS GREATER WHERE SUCH A CAP IS NOT PROHIBITED BY LAW.
      </p>

      <h2>8. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless the operators from claims arising from your content,
        misuse of the service, or violation of these terms.
      </p>

      <h2>9. Open source</h2>
      <p>
        The software is licensed under AGPL-3.0. Hosted use does not transfer ownership of the
        codebase. Self-hosters must comply with the license.
      </p>

      <h2>10. Modifications</h2>
      <p>We may modify or discontinue the service with reasonable notice where practicable.</p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws applicable in the operator&apos;s jurisdiction, without
        regard to conflict-of-law rules. Disputes shall be resolved in competent courts of that
        jurisdiction unless mandatory consumer protections require otherwise.
      </p>

      <p>
        <a href="/">← Back to ClipTools</a>
      </p>
    </article>
  );
}
