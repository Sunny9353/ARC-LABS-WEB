import { Helmet } from "react-helmet-async";
import "../styles/Legal.css";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    updated: "June 5, 2026",
    intro:
      "ARC LABS respects the privacy of students, parents, faculty, institutions, customers, and website visitors. This policy explains in detail what information we collect, why we collect it, how we use and store it, who we share it with, and the choices and rights you have over your data. By using the ARC LABS website, products, training programs, or certificate services, you agree to the practices described below.",
    sections: [
      ["Information We Collect", "We collect information you provide directly and information generated through your use of our services. This may include your name, phone number, email address, institution or organization details, designation/role, city and state, program or product interest, enquiry messages, order and invoice details, payment status and reference numbers, certificate registration details such as roll/registration numbers and session codes, and workshop attendance records. We may also automatically collect limited technical information such as browser type, device information, and general usage analytics to keep the website secure and working correctly."],
      ["How We Use Information", "We use the information we collect to respond to enquiries and support requests, process and fulfil product orders, schedule and deliver workshops and training programs, verify paid-student or approved-participant eligibility, issue and verify certificates, send important service updates and batch information, prevent fraud or misuse, meet legal and accounting obligations, and continuously improve the quality of our products, curriculum, and services. We do not use your personal information for purposes unrelated to those described in this policy without informing you."],
      ["Legal Basis and Consent", "We process personal information on the basis of your consent (for example, when you submit an enquiry or download a curriculum), to perform a contract or service you have requested (such as an order or workshop), and to meet our legal obligations. Where you have given consent, you may withdraw it at any time by contacting us, though this will not affect processing already carried out."],
      ["Certificates and Student Lists", "Student roll/registration numbers and workshop/session codes are used only to confirm certificate eligibility and to prevent duplicate certificate registration for the same workshop. Eligible-student lists shared by institutions are treated as confidential and are used solely for verification and certificate issuance for that specific program."],
      ["Data Sharing and Disclosure", "We do not sell, rent, or trade personal data. We may share limited information with trusted third parties only when necessary to deliver a requested service — for example, payment gateways to process payments, logistics partners to deliver products, training coordinators to organise batches, or institutions to confirm participation. These parties are expected to handle data securely and use it only for the agreed purpose. We may also disclose information where required by law, regulation, or valid legal process."],
      ["Data Storage and Retention", "Information is stored using Firebase and other secured systems. We retain personal information only for as long as needed to fulfil the purposes described in this policy, to provide ongoing support, and to meet legal, tax, or accounting requirements. When information is no longer required, it is deleted or anonymised."],
      ["Data Security", "We use Firebase, encryption in transit, and role-based access controls to restrict administrative actions. Authorized upload and admin access is limited to approved ARC LABS accounts. While we take reasonable measures to protect your information, no method of transmission or storage is completely secure, and we encourage you to share sensitive details only through official ARC LABS channels."],
      ["Cookies and Analytics", "Our website may use cookies and similar technologies to keep the site functioning, remember preferences, and understand how visitors use our pages so we can improve them. You can control or disable cookies through your browser settings, though some features may not work as intended if cookies are disabled."],
      ["Children's Privacy", "Many of our programs are delivered to school and college students. Where participants are minors, registration and data are handled through their institution, parent, or guardian. We do not knowingly collect personal information directly from children without appropriate institutional or parental involvement."],
      ["Your Rights and Choices", "You may request access to, correction of, or deletion of the personal information we hold about you, and you may opt out of non-essential communications at any time. To exercise these rights, contact us using the details below and we will respond within a reasonable time, subject to any legal record-keeping requirements."],
      ["Updates to This Policy", "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. The latest version will always be available on this page with the revised effective date shown above."],
      ["Contact", "For privacy questions, data requests, or concerns, contact hello@arclabs.in or call +91 78158 09412. We are happy to help clarify how your information is handled."],
    ],
  },
  terms: {
    title: "Terms and Conditions",
    updated: "June 5, 2026",
    intro:
      "These Terms and Conditions govern your access to and use of the ARC LABS website, products, training programs, internships, lab setup services, and certificate verification services. By browsing our website, submitting an enquiry, placing an order, or enrolling in a program, you acknowledge that you have read, understood, and agreed to these terms. Please read them carefully before using our services.",
    sections: [
      ["Use of Website", "Website content is provided for product, program, certification, and service information. You agree to use the website only for lawful purposes and not to misuse enquiry or registration forms, upload false or misleading data, attempt unauthorized access to our systems, introduce malicious code, or interfere with the normal operation of the site. We reserve the right to restrict or suspend access for any activity that violates these terms."],
      ["Eligibility and Accounts", "Certain services, registrations, and certificate verifications require you to provide accurate and complete information. You are responsible for the accuracy of the details you submit and for keeping any access credentials confidential. Where you register on behalf of an institution or group, you confirm that you are authorised to do so."],
      ["Products and Services", "Product specifications, pricing, availability, training scope, batch schedules, and implementation timelines may vary based on institution requirements, component availability, and the final quotation. We make reasonable efforts to keep information accurate but do not warrant that all descriptions, images, or pricing on the website are error-free, and we reserve the right to correct errors and update details without prior notice."],
      ["Bookings, Workshops and Internships", "Workshop, training, and internship enrolments are confirmed based on availability and payment. Schedules, mentors, tools, and delivery mode (online, onsite, or hybrid) may be adjusted where necessary, and we will communicate material changes to confirmed participants. Completion of projects, attendance, and assessments may be required for certificate eligibility."],
      ["Training and Certification", "Certificates are issued only to eligible participants whose details match the paid-student or approved participant list for the relevant workshop, internship, or session. Certificates confirm participation and completion as defined by the program and are subject to verification. Any attempt to obtain a certificate through false information may result in cancellation of the certificate."],
      ["Payments", "Payments must be completed through approved payment methods. Orders, invoices, and workshop or internship registrations are processed only after payment confirmation. All fees are quoted inclusive of applicable terms stated at the time of purchase, and you are responsible for any taxes or charges that apply to your transaction."],
      ["Intellectual Property", "The ARC LABS brand, logo, product designs, training content, curriculum, manuals, source code, project guides, website content, graphics, and visuals belong to ARC LABS unless otherwise stated, and are protected by applicable intellectual property laws. You may not copy, reproduce, redistribute, resell, or create derivative works from our materials without prior written permission. Materials provided during programs are licensed to participants for personal learning use only."],
      ["Limitation of Liability", "ARC LABS provides its website, products, and services on a reasonable-effort basis. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential losses arising from the use of our website, products, or training, or from delays or interruptions outside our reasonable control. Our total liability for any claim will not exceed the amount paid by you for the specific product or service concerned."],
      ["Third-Party Links and Tools", "Our website and programs may reference or use third-party platforms, tools, or links (such as payment gateways or cloud services). We are not responsible for the content, policies, or practices of third parties, and your use of them is governed by their own terms."],
      ["Governing Law", "These terms are governed by and construed in accordance with the laws of India. Any disputes arising from or relating to these terms or our services will be subject to the jurisdiction of the appropriate courts in our operating location, unless otherwise agreed in writing."],
      ["Changes to These Terms", "We may update these Terms and Conditions periodically to reflect changes in our services, technology, or legal requirements. Continued use of our website or services after an update constitutes acceptance of the revised terms, which will be published on this page with the effective date shown above."],
      ["Contact", "For terms-related questions or clarifications, contact sales@arclabs.in or call +91 78158 09412."],
    ],
  },
  refunds: {
    title: "Refund and Cancellation Policy",
    updated: "June 5, 2026",
    intro:
      "This policy explains how refunds, cancellations, replacements, and rescheduling are handled for ARC LABS products, workshops, internships, training programs, and lab setup services. It is designed to be fair to both participants and ARC LABS, and should be read together with our Terms and Conditions and any specific quotation or agreement that applies to your purchase.",
    sections: [
      ["Product Orders", "Refund or replacement requests for physical products must be raised within 7 days of delivery for items that are damaged, defective, or incorrect. To be eligible, the product must be unused, in resaleable condition, and returned with its original packaging, accessories, and proof of purchase where applicable. Once we receive and inspect the returned item, we will confirm whether a replacement or refund applies."],
      ["Non-Returnable Items", "Certain items may not be eligible for return or refund, including consumable components, opened or used electronic modules, custom-assembled kits, and downloadable or digital content that has already been accessed, except where the item is defective or was delivered incorrectly."],
      ["Workshops, Internships and Training", "Workshop, internship, or training fees are non-refundable once the session or program has started or the participant has attended any part of it. Before the start date, a request to reschedule to a future batch may be considered based on availability and notice given. Where ARC LABS cancels a scheduled program entirely and no alternative date is acceptable to the participant, the applicable fee will be refunded."],
      ["Cancellation by Participant", "If you wish to cancel a confirmed order or enrolment, please contact us as early as possible. Cancellations requested well before delivery or the program start date are easier to accommodate, while cancellations close to the start date or after dispatch may be subject to deductions for costs already incurred, such as components, logistics, or batch preparation."],
      ["Lab Setup and Institutional Projects", "Custom lab setup, institutional implementation, and CSR projects follow the specific cancellation, milestone, and payment terms stated in the approved quotation, purchase order, or agreement. As these projects involve advance procurement and planning, amounts tied to work already completed or materials already purchased may be non-refundable."],
      ["Payment Gateway Delays and Duplicate Payments", "If an amount is deducted but order or registration confirmation is not received, please contact us promptly with your payment reference details. Genuine failed transactions and verified duplicate payments will be refunded in full after confirmation with our records and the payment provider."],
      ["How to Request a Refund or Cancellation", "To raise a request, contact us by email or phone with your name, order or registration details, payment reference, and the reason for the request. Providing complete information helps us review and resolve your request faster."],
      ["Refund Method and Timeline", "Approved refunds are normally processed within 7-10 working days through the original payment method, subject to bank and payment gateway timelines. The time taken for the amount to reflect in your account may vary depending on your bank or card issuer."],
      ["Contact", "For refund or cancellation support, contact sales@arclabs.in or call +91 78158 09412. Our team will guide you through the process."],
    ],
  },
};

export default function LegalPage({ type = "privacy" }) {
  const page = CONTENT[type] || CONTENT.privacy;

  return (
    <>
      <Helmet>
        <title>{page.title} - ARC LABS</title>
        <meta name="description" content={`${page.title} for ARC LABS website, products, workshops, and services.`} />
      </Helmet>

      <section className="legal-page">
        <div className="legal-kicker">ARC LABS</div>
        <h1>{page.title}</h1>
        <p className="legal-updated">Last updated: {page.updated}</p>
        <p className="legal-intro">{page.intro}</p>

        <div className="legal-sections">
          {page.sections.map(([title, body]) => (
            <section key={title} className="legal-section">
              <h2>{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
