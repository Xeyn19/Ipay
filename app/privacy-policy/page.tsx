import { cookies } from "next/headers";
import type { Metadata } from "next";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { Button } from "@/app/components/home/ui";
import { PrivacyPolicyScrollTracker } from "./scroll-tracker";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";

export const metadata: Metadata = {
  title: "Privacy Policy | iPay",
  description: "Privacy Policy outlining how we collect, process, and protect your personal data.",
};

export default async function PrivacyPolicyPage() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

      <section className="relative px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] p-8 shadow-[var(--shadow-large)] sm:p-12 lg:p-16">
          <div className="prose prose-sm sm:prose-base dark:prose-invert prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-[-0.03em] prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-muted)] prose-li:text-[var(--text-muted)] prose-strong:text-[var(--text-primary)] prose-a:text-[var(--brand)] hover:prose-a:text-[var(--brand-dark)] max-w-none">
            <h1 className="mb-2 text-center text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              PRIVACY POLICY
            </h1>
            <p className="mb-10 text-center text-sm font-semibold tracking-widest text-[var(--brand)] uppercase">
              Last Updated: April 2026
            </p>

            <h2>I. INTRODUCTION</h2>
            <p>
              Ipay Financial Services International Inc. (“Ipay”, “we”, “our”, or “us”) respects the privacy and confidentiality of personal data and is committed to ensuring that all personal information processed through our systems is handled responsibly, securely, and in compliance with applicable data protection laws, including the Data Privacy Act of 2012 and its Implementing Rules and Regulations.
            </p>
            <p>
              This Privacy Notice outlines how we collect, process, use, store, disclose, retain, and protect personal data in connection with our payment facilitation services, merchant integrations, operational support functions, and related business activities.
            </p>
            <p>
              We implement appropriate organizational, technical, and physical safeguards to ensure that personal data is protected throughout its lifecycle — from collection to secure disposal. We are committed to transparency, accountability, and the lawful processing of personal information entrusted to us by merchants, partners, and authorized users of our services.
            </p>
            <p>
              By engaging with our services, accessing our platforms, or submitting personal information to Ipay, you acknowledge that you have read and understood this Privacy Notice.
            </p>

            <h2>II. INFORMATION WE COLLECT</h2>
            <p>
              In the course of providing our payment facilitation and related services, we may collect and process the following categories of personal data, where necessary and proportionate to legitimate business, contractual, or regulatory requirements:
            </p>
            
            <h3 className="mt-6 mb-2 font-semibold">1. Identification Information</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>Full name</li>
              <li>Business or registered trade name</li>
              <li>Position, designation, or role within an organization</li>
              <li>Government-issued identifiers (e.g., tax identification numbers or other identifiers required by applicable law and regulatory authorities)</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">2. Contact Information</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>Email address</li>
              <li>Mobile or telephone number</li>
              <li>Office or registered business address</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">3. Transaction-Related Information</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>Payment references and transaction identifiers</li>
              <li>Transaction amounts, dates, and related details</li>
              <li>Billing records and settlement information</li>
              <li>Merchant transaction summaries and history</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">4. Merchant Account Information</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>Business registration and licensing details</li>
              <li>Information relating to authorized representatives or signatories</li>
              <li>Bank account details for settlement and payout purposes</li>
              <li>Platform access credentials and integration-related identifiers</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">5. Technical and System Information</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>Internet Protocol (IP) address</li>
              <li>Device identifiers and system configuration details</li>
              <li>Browser type and version</li>
              <li>Login timestamps and authentication logs</li>
              <li>System activity logs</li>
              <li>Audit trail records for security and compliance monitoring</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">Data Minimization Commitment</h3>
            <p className="mb-2">We collect only personal data that is relevant, necessary, and proportionate to:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>The provision of our services</li>
              <li>Compliance with contractual obligations</li>
              <li>Regulatory and legal requirements</li>
              <li>Fraud prevention, security, and risk management</li>
            </ul>
            <p>We do not intentionally collect personal data that is unrelated to legitimate business or regulatory purposes.</p>

            <h2>III. PURPOSE OF PROCESSING</h2>
            <p>We process personal data strictly for legitimate, specified, and lawful purposes consistent with applicable data protection laws and regulatory requirements.</p>
            <p>Personal data may be processed for the following purposes:</p>

            <h3 className="mt-6 mb-2 font-semibold">1. Service Delivery and Operations</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>To provide, operate, and maintain payment facilitation and related services</li>
              <li>To enable merchant onboarding, verification, and account administration</li>
              <li>To manage merchant integrations and system connectivity</li>
              <li>To facilitate transaction processing, settlement, reconciliation, and reporting</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">2. Transaction Monitoring and Risk Management</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>To monitor transactions for accuracy and operational integrity</li>
              <li>To detect, prevent, and investigate fraudulent, suspicious, or unauthorized activities</li>
              <li>To implement security controls and safeguard systems from misuse or intrusion</li>
              <li>To maintain audit trails and system logs for compliance and accountability</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">3. Legal and Regulatory Compliance</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>To comply with applicable laws, regulatory obligations, and lawful orders</li>
              <li>To meet reporting requirements to relevant regulatory authorities</li>
              <li>To fulfill obligations relating to anti-fraud, financial monitoring, and other statutory requirements</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">4. Customer Support and Communication</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>To respond to inquiries, service requests, or complaints</li>
              <li>To provide operational notifications and service-related communications</li>
              <li>To address technical concerns and platform-related issues</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">5. Service Improvement and System Enhancement</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>To analyze system performance and usage trends</li>
              <li>To improve platform functionality, reliability, and security</li>
              <li>To enhance user experience and operational efficiency</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">Lawful and Limited Processing</h3>
            <p className="mb-2">Personal data is processed only:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>For clearly defined and documented purposes</li>
              <li>In a manner consistent with transparency and fairness</li>
              <li>Based on a valid legal basis (e.g., contractual necessity, legal obligation, legitimate interest, or consent where required)</li>
              <li>In accordance with data minimization and proportionality principles</li>
            </ul>
            <p>We do not use personal data for purposes that are incompatible with those described above unless permitted or required by law.</p>

            <h2>IV. LEGAL BASIS FOR PROCESSING</h2>
            <p>We process personal data only when a lawful basis exists under applicable data protection laws, including the Philippine Data Privacy Act.</p>
            <p>Depending on the context of the engagement, processing may be based on one or more of the following legal grounds:</p>

            <h3 className="mt-6 mb-2 font-semibold">1. Contractual Necessity</h3>
            <p className="mb-2">Processing is necessary for:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>The performance of a contract with merchants or business partners</li>
              <li>The implementation of pre-contractual measures (e.g., merchant onboarding, account verification)</li>
              <li>The fulfillment of service obligations related to payment facilitation and related services</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">2. Compliance with Legal and Regulatory Obligations</h3>
            <p className="mb-2">Processing is required to comply with:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Applicable laws and regulatory issuances</li>
              <li>Reporting obligations to regulatory authorities</li>
              <li>Financial monitoring and anti-fraud requirements</li>
              <li>Record-keeping and audit requirements</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">3. Legitimate Business Interests</h3>
            <p className="mb-2">Processing may be necessary for legitimate business purposes, provided such interests are not overridden by the fundamental rights and freedoms of data subjects, including:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Fraud prevention and risk management</li>
              <li>System security and integrity</li>
              <li>Internal administration and operational efficiency</li>
              <li>Service quality monitoring and improvement</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">4. Regulatory Compliance Requirements</h3>
            <p>As a regulated entity, we may process personal data to comply with supervisory, licensing, audit, and reporting requirements imposed by competent authorities.</p>

            <h3 className="mt-6 mb-2 font-semibold">5. Consent (Where Applicable)</h3>
            <p>Where required by law, we will obtain the consent of the data subject before processing personal data. Consent may be withdrawn at any time, subject to legal or contractual limitations.</p>

            <h2>V. Data Sharing and Disclosure</h2>
            <p>We do not sell personal data.</p>
            <p>Personal data may be disclosed only when necessary and appropriate for legitimate business or regulatory purposes.</p>
            <p>We may share personal data with:</p>

            <h3 className="mt-6 mb-2 font-semibold">1. Authorized Internal Personnel</h3>
            <p>Access is limited to employees, consultants, and authorized personnel strictly on a need-to-know basis and subject to confidentiality obligations.</p>

            <h3 className="mt-6 mb-2 font-semibold">2. Regulated Financial Institutions</h3>
            <p>Where required for transaction processing, settlement, reconciliation, and compliance monitoring.</p>

            <h3 className="mt-6 mb-2 font-semibold">3. Payment Partners and System Integrations</h3>
            <p>For the purpose of facilitating merchant platform connectivity and payment-related services, subject to contractual safeguards.</p>

            <h3 className="mt-6 mb-2 font-semibold">4. Technology and Infrastructure Service Providers</h3>
            <p className="mb-2">Including providers supporting:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Hosting and system infrastructure</li>
              <li>Platform maintenance and support</li>
              <li>Security monitoring and logging</li>
              <li>Data storage and backup services</li>
            </ul>
            <p className="mb-2">Such providers are contractually required to:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Implement appropriate technical and organizational safeguards</li>
              <li>Process personal data only for authorized purposes</li>
              <li>Maintain strict confidentiality</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">5. Regulatory and Government Authorities</h3>
            <p className="mb-2">When disclosure is:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Required by law</li>
              <li>Necessary to comply with lawful orders</li>
              <li>Required for regulatory reporting and oversight</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">Safeguards for Data Sharing</h3>
            <p className="mb-2">All third-party disclosures are governed by:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Confidentiality obligations</li>
              <li>Data protection clauses in contracts</li>
              <li>Security requirements aligned with industry standards</li>
              <li>Risk assessment and due diligence procedures</li>
            </ul>
            <p>Personal data is not shared beyond what is necessary for the stated purposes.</p>

            <h2>VI. DATA RETENTION</h2>
            <p>We retain personal data only for as long as necessary to fulfill legitimate business and regulatory purposes.</p>
            <p className="mb-2">Personal data may be retained to:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Fulfill the purposes for which it was collected</li>
              <li>Provide and maintain payment-related services</li>
              <li>Comply with legal, statutory, and regulatory requirements</li>
              <li>Meet audit, reporting, and record-keeping obligations</li>
              <li>Resolve disputes and investigate incidents</li>
              <li>Enforce contractual agreements and protect legal rights</li>
            </ul>
            <p className="mb-2">Retention periods may vary depending on:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>The nature of the data</li>
              <li>Regulatory requirements applicable to financial and payment-related services</li>
              <li>Operational necessity</li>
            </ul>
            <p className="mb-2">When personal data is no longer required for the stated purposes, it is:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Securely deleted using approved deletion procedures, or</li>
              <li>Irreversibly anonymized so that it can no longer be associated with an identifiable individual</li>
            </ul>
            <p>Secure disposal procedures are implemented to prevent unauthorized recovery, access, or reconstruction of deleted data.</p>

            <h2>VII. Security Measures</h2>
            <p>We implement appropriate organizational, technical, and physical safeguards to protect personal data against unauthorized access, disclosure, alteration, loss, or destruction.</p>

            <h3 className="mt-6 mb-2 font-semibold">1. Organizational Safeguards</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>Documented privacy and information security policies</li>
              <li>Defined access approval workflows</li>
              <li>Confidentiality obligations for employees and authorized personnel</li>
              <li>Role segregation and least-privilege access principles</li>
              <li>Periodic access reviews</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">2. Technical Safeguards</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>Role-based access controls</li>
              <li>Secure authentication mechanisms</li>
              <li>Strong password policy enforcement</li>
              <li>Encryption of sensitive data where applicable</li>
              <li>Secure system configurations</li>
              <li>System monitoring and audit logging</li>
              <li>Incident response procedures</li>
            </ul>

            <h3 className="mt-6 mb-2 font-semibold">3. Physical Safeguards</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>Restricted office access</li>
              <li>Visitor logging procedures</li>
              <li>Controlled access to workstations and physical records</li>
              <li>Secure storage of sensitive documents</li>
            </ul>
            <p>These safeguards are periodically reviewed and updated to address emerging risks and evolving regulatory requirements.</p>

            <h2>VIII. Your Rights as a Data Subject</h2>
            <p className="mb-2">In accordance with the Philippine Data Privacy Act and related regulations, individuals may exercise the following rights, subject to lawful limitations:</p>
            <ul className="mb-4 list-disc pl-5">
              <li><strong>Right to Access.</strong> Request confirmation of whether personal data is being processed and obtain a copy of such data.</li>
              <li><strong>Right to Rectification.</strong> Request correction of inaccurate, incomplete, or outdated personal data.</li>
              <li><strong>Right to Erasure or Blocking.</strong> Request deletion, suspension, or blocking of personal data where legally permissible.</li>
              <li><strong>Right to Object.</strong> Object to processing based on legitimate interest or direct marketing, where applicable.</li>
              <li><strong>Right to Withdraw Consent.</strong> Withdraw consent at any time, where processing is based on consent.</li>
              <li><strong>Right to Data Portability.</strong> Request a copy of personal data in a structured, commonly used format, where technically feasible.</li>
              <li><strong>Right to be Informed.</strong> Be informed about how personal data is collected and processed.</li>
              <li><strong>Right to Lodge a Complaint.</strong> File a complaint with the relevant data protection authority if rights are believed to have been violated.</li>
            </ul>
            <p>Requests may be submitted using the contact details provided below.</p>
            <p>We may request reasonable verification of identity before acting on any request to protect personal data from unauthorized disclosure.</p>
            <p>Responses will be provided within applicable regulatory timelines.</p>

            <h2>IX. Data Breach Notification</h2>
            <p>In the event of a personal data breach that may pose a real risk to the rights and freedoms of individuals, we will take immediate and appropriate action in accordance with applicable data protection laws and regulatory requirements.</p>
            <p className="mb-2">Our response will include:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Prompt internal reporting to designated security and data protection officers</li>
              <li>Immediate investigation to determine the nature, scope, and impact of the incident</li>
              <li>Implementation of containment measures to prevent further unauthorized access, disclosure, or loss</li>
              <li>Preservation of relevant logs and evidence for forensic analysis</li>
              <li>Risk assessment to determine potential harm to affected individuals</li>
            </ul>
            <p className="mb-2">Where required by law, we will:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Notify the appropriate regulatory authority within prescribed timelines</li>
              <li>Inform affected individuals without undue delay if there is a high risk to their rights and freedoms</li>
              <li>Provide guidance on protective measures that individuals may take</li>
            </ul>
            <p>All incidents are documented, reviewed, and subject to corrective action to prevent recurrence.</p>

            <h2>X. Updates to This Privacy Notice</h2>
            <p>We may update this Privacy Notice from time to time to ensure continued compliance and transparency.</p>
            <p className="mb-2">Updates may occur due to:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Changes in applicable laws or regulatory requirements</li>
              <li>Enhancements to our services or operational processes</li>
              <li>Improvements to security and privacy practices</li>
              <li>Organizational or structural changes</li>
            </ul>
            <p className="mb-2">When material changes are made:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>The revised version will be posted on our official website</li>
              <li>The “Last Updated” date will be revised accordingly</li>
              <li>Where required, affected individuals may be notified through appropriate communication channels</li>
            </ul>
            <p>We encourage individuals to review this Privacy Notice periodically to stay informed about how we protect personal data.</p>

            <h2>XI. Contact Information</h2>
            <p>For privacy-related concerns, requests, or complaints, you may contact:</p>
            <div className="mt-4 rounded-xl bg-[var(--bg-base)] p-4 border border-[var(--border-light)] sm:p-6">
              <p className="mb-1"><strong>Data Protection Officer (DPO)</strong></p>
              <p className="mb-1">Ipay Financial Services International Inc.</p>
              <p className="mb-1">
                <strong>Email:</strong>{" "}
                <a href="mailto:dpo@ipays.ph" className="text-[var(--brand)] hover:underline">
                  dpo@ipays.ph
                </a>
              </p>
              <p className="mb-0">
                <strong>Address:</strong><br />
                371 Aguirre Ave.<br />
                BF Homes, Parañaque City
              </p>
            </div>
            <p className="mt-6">We will respond to requests within the timelines required by law.</p>
            
            <PrivacyPolicyScrollTracker />

            <div className="mt-12 flex justify-center border-t border-[var(--border-light)] pt-8">
              <Button href="/request-proposal">Back to Proposal Form</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </main>
  );
}
