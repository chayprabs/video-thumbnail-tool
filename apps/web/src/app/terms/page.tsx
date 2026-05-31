export const metadata = {
  title: 'Terms & Conditions — ClipTools',
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
      <h1>Terms &amp; Conditions</h1>
      <p className="text-[var(--muted)]">Last updated: 1 June 2026 · Effective immediately upon use</p>

      <p className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <strong>Important:</strong> This document is a general template for an open-source tool. It is
        not legal advice. Laws differ in every country. If you operate a commercial or high-risk
        deployment, have a qualified lawyer in your jurisdiction review these terms.
      </p>

      <h2>1. Parties and acceptance</h2>
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) are a binding agreement between you
        (&quot;you&quot;, &quot;user&quot;) and <strong>Chaitanya Prabuddha</strong> (&quot;we&quot;,
        &quot;us&quot;, &quot;operator&quot;, &quot;ClipTools&quot;) governing access to the ClipTools
        website, hosted playground, APIs, documentation, and related services (collectively, the
        &quot;Service&quot;).
      </p>
      <p>
        By accessing or using the Service in any manner—including uploading a file, clicking
        &quot;Run&quot;, or browsing the site—you acknowledge that you have read, understood, and agree
        to be bound by these Terms and our{' '}
        <a href="/privacy" className="text-[var(--accent)] underline">
          Privacy Policy
        </a>
        . If you do not agree, you must not use the Service.
      </p>
      <p>
        If you use the Service on behalf of an organization, you represent that you have authority to
        bind that organization, and &quot;you&quot; includes that organization.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least <strong>18 years old</strong> (or the age of majority in your
        jurisdiction, whichever is higher) and legally able to enter into contracts. The Service is not
        directed to children. We do not knowingly collect personal data from anyone under 13.
      </p>

      <h2>3. Service description — no guaranteed results</h2>
      <p>
        ClipTools provides server-side video processing (trim, concat, remux, thumbnails, contact
        sheets, sprite sheets, shot detection, and related FFmpeg-based operations). The Service may
        use third-party components including <strong>FFmpeg</strong> and other open-source software.
      </p>
      <p>
        <strong>We do not guarantee</strong> that any output will be accurate, complete, error-free,
        synchronized, broadcast-safe, platform-compliant (e.g. YouTube, TikTok, broadcast), free of
        defects, or fit for any particular purpose. You are solely responsible for reviewing,
        validating, and backing up all outputs before publication or commercial use.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree that you will not, and will not permit others to:</p>
      <ul>
        <li>
          Upload, process, or distribute content that is illegal, infringing, defamatory,
          harassing, hateful, exploitative, non-consensual, malware-infected, or otherwise unlawful in
          any applicable jurisdiction;
        </li>
        <li>
          Violate copyright, trademark, privacy, publicity, or other intellectual-property or
          personal rights;
        </li>
        <li>
          Attempt to probe, scan, overload, reverse-engineer, circumvent limits, or compromise the
          Service or its infrastructure;
        </li>
        <li>
          Use the Service for surveillance, stalking, or harassment, or to process data you are not
          authorized to process;
        </li>
        <li>
          Misrepresent your identity or affiliation, or use the Service in violation of export-control
          or sanctions laws.
        </li>
      </ul>
      <p>
        We may suspend or terminate access, remove content, and cooperate with authorities if we
        believe misuse occurred, without liability to you.
      </p>

      <h2>5. Your content — representations and license to us</h2>
      <p>
        You retain ownership of media you upload. You represent and warrant that: (a) you own or have
        all necessary rights, licenses, and consents to upload and process the content; (b) your use
        does not violate any law or third-party right; and (c) your content does not contain unlawful
        material.
      </p>
      <p>
        You grant us a <strong>limited, non-exclusive, royalty-free, worldwide license</strong> to
        host, copy, transcode, and process your content <strong>only as necessary</strong> to provide
        the Service for your request, and only for the retention period described in the Privacy
        Policy. This license ends when your files are deleted per our retention rules.
      </p>
      <p>
        You are solely responsible for your content and for any claims arising from it. We do not
        pre-screen uploads.
      </p>

      <h2>6. Open-source software (separate from hosted Service)</h2>
      <p>
        The ClipTools source code is offered under the <strong>GNU Affero General Public License
        v3.0 or later (AGPL-3.0-or-later)</strong>. Your use of the hosted Service is governed by
        these Terms, not by AGPL, except where AGPL applies to source code you receive. If you
        self-host, you must comply with AGPL and applicable law; self-hosting is at your own risk.
      </p>

      <h2>7. No professional advice</h2>
      <p>
        The Service is a technical utility only. Nothing on the site constitutes legal, financial,
        medical, engineering, or professional advice. Consult qualified professionals before relying
        on outputs for commercial, safety-critical, or regulated uses.
      </p>

      <h2>8. Disclaimer of warranties</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW IN EVERY JURISDICTION, THE SERVICE,
        SOFTWARE, DOCUMENTATION, AND ALL OUTPUTS ARE PROVIDED <strong>&quot;AS IS&quot;</strong> AND{' '}
        <strong>&quot;AS AVAILABLE&quot;</strong> WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS,
        IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY, NON-INFRINGEMENT, AND ANY
        WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.
      </p>
      <p>
        WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, FREE OF VIRUSES,
        OR THAT DEFECTS WILL BE CORRECTED. SOME JURISDICTIONS DO NOT ALLOW EXCLUSION OF IMPLIED
        WARRANTIES; IN THOSE CASES, EXCLUSIONS APPLY TO THE MAXIMUM EXTENT PERMITTED.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CHAITANYA PRABUDDHA, AND
        EACH OF OUR CONTRIBUTORS, AFFILIATES, LICENSORS, AND SUPPLIERS (COLLECTIVELY, THE{' '}
        <strong>&quot;RELEASED PARTIES&quot;</strong>) BE LIABLE FOR ANY:
      </p>
      <ul>
        <li>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES;</li>
        <li>LOSS OF PROFITS, REVENUE, DATA, GOODWILL, BUSINESS, OR ANTICIPATED SAVINGS;</li>
        <li>COST OF SUBSTITUTE GOODS OR SERVICES;</li>
        <li>PERSONAL INJURY OR PROPERTY DAMAGE (EXCEPT WHERE LIABILITY CANNOT BE EXCLUDED BY LAW);</li>
        <li>
          ANY CLAIMS ARISING FROM YOUR CONTENT, YOUR USE OR MISUSE OF THE SERVICE, THIRD-PARTY
          SOFTWARE (INCLUDING FFMPEG), OR RELIANCE ON OUTPUTS;
        </li>
      </ul>
      <p>
        WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY
        OTHER THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        <strong>Aggregate cap:</strong> WHERE LIABILITY CANNOT BE FULLY EXCLUDED, THE TOTAL
        AGGREGATE LIABILITY OF THE RELEASED PARTIES FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE
        SERVICE SHALL NOT EXCEED THE GREATER OF: (A) <strong>USD $0</strong> (zero dollars), because
        the hosted playground is provided without charge; or (B) <strong>USD $100</strong> (one hundred
        U.S. dollars); or (C) THE AMOUNT YOU PAID US FOR THE SERVICE IN THE TWELVE (12) MONTHS
        BEFORE THE CLAIM—WHICHEVER IS THE MINIMUM AMOUNT PERMITTED BY MANDATORY LAW IN YOUR
        JURISDICTION.
      </p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to <strong>defend, indemnify, and hold harmless</strong> the Released Parties from
        and against any and all claims, damages, losses, liabilities, costs, and expenses (including
        reasonable attorneys&apos; fees) arising out of or related to: (a) your content or outputs; (b)
        your use of the Service; (c) your violation of these Terms or any law; (d) your violation of
        any third-party right; or (e) any dispute between you and a third party. We may assume
        exclusive defense of any matter subject to indemnification; you will cooperate at your
        expense.
      </p>

      <h2>11. Release</h2>
      <p>
        To the maximum extent permitted by law, you release the Released Parties from any and all
        claims, demands, and damages (actual and consequential) of every kind, known and unknown,
        arising out of or in any way connected with your use of the Service. If you are a California
        resident, you waive California Civil Code §1542 to the extent permitted (unknown claims).
        Where waiver is not permitted, this section applies to the fullest extent allowed.
      </p>

      <h2>12. Assumption of risk</h2>
      <p>
        You voluntarily assume all risks associated with using the Service, including risk of data
        loss, corrupted files, incorrect edits, disclosure of sensitive content you upload, and
        reliance on automated processing. You are responsible for maintaining backups.
      </p>

      <h2>13. Copyright and takedowns</h2>
      <p>
        We respect intellectual property rights. If you believe content processed through the Service
        infringes your copyright, contact the operator via the website linked in the site header with:
        identification of the work, identification of the material, your contact information, a
        good-faith statement, and your signature (physical or electronic). We may remove or disable
        access to material and terminate repeat infringers where appropriate.
      </p>

      <h2>14. Dispute resolution; governing law</h2>
      <p>
        <strong>Governing law:</strong> These Terms are governed by the laws of{' '}
        <strong>India</strong>, without regard to conflict-of-law principles, except where mandatory
        consumer protection laws in your country of residence require otherwise.
      </p>
      <p>
        <strong>Jurisdiction:</strong> Subject to mandatory law, you agree that courts located in
        India shall have exclusive jurisdiction over disputes that are not subject to arbitration or
        that must be brought in court.
      </p>
      <p>
        <strong>Informal resolution:</strong> Before filing a claim, you agree to contact us in good
        faith to attempt informal resolution for at least thirty (30) days.
      </p>
      <p>
        <strong>Arbitration (where permitted):</strong> To the extent permitted by applicable law and
        not prohibited by mandatory consumer protections in your country, disputes shall be resolved
        by binding individual arbitration, not class arbitration. You may bring claims in small-claims
        court if eligible. If arbitration is unenforceable, the courts in India apply as above.
      </p>
      <p>
        <strong>Class action waiver:</strong> TO THE EXTENT PERMITTED BY LAW, YOU AND WE AGREE THAT
        EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY, NOT AS A PLAINTIFF OR
        CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
      </p>
      <p>
        <strong>Time limit:</strong> Any claim must be filed within one (1) year after it arose, or
        it is permanently barred, except where a longer period is required by mandatory law.
      </p>

      <h2>15. International users</h2>
      <p>
        The Service is operated from facilities that may be located in various countries. You are
        responsible for compliance with local laws. If the Service is illegal in your jurisdiction, do
        not use it. You consent to processing and transfer of information as described in the Privacy
        Policy.
      </p>

      <h2>16. Force majeure</h2>
      <p>
        We are not liable for failure or delay due to events beyond our reasonable control, including
        natural disasters, war, labor disputes, internet failures, power outages, government actions,
        or third-party service failures.
      </p>

      <h2>17. Changes; termination</h2>
      <p>
        We may modify the Service or these Terms at any time. Material changes will be reflected by
        updating the date above. Continued use after changes constitutes acceptance. We may suspend or
        terminate the Service or your access at any time, without notice, without liability.
      </p>

      <h2>18. Severability; entire agreement; waiver</h2>
      <p>
        If any provision is held invalid or unenforceable, the remainder stays in effect. These Terms
        and the Privacy Policy are the entire agreement regarding the hosted Service. Our failure to
        enforce a right is not a waiver.
      </p>

      <h2>19. Contact</h2>
      <p>
        Questions about these Terms: contact the operator via{' '}
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
