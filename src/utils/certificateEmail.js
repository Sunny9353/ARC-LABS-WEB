import emailjs from "emailjs-com";

const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_CERT_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const PUBLIC_SITE_URL = process.env.REACT_APP_PUBLIC_SITE_URL;

export function canSendCertificateEmail() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

export async function sendCertificateRegistrationEmail(cert) {
  if (!canSendCertificateEmail()) {
    throw new Error("Certificate email service is not configured.");
  }

  const siteUrl = (PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
  const verifyUrl = `${siteUrl}/verify`;
  const studentName = cert.fullName || "Student";
  const workshopName = cert.programName || cert.workshopName || cert.technology || "ARC LABS workshop";

  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: cert.email,
      to_name: studentName,
      from_name: "ARC LABS Certification Team",
      from_email: "hello@arclabs.in",
      reply_to: "hello@arclabs.in",
      student_name: studentName,
      certificate_id: cert.certId,
      roll_no: cert.rollNo || cert.rollKey || "-",
      workshop_code: cert.workshopCode || "-",
      workshop_name: workshopName,
      institution: cert.institution || cert.collegeName || "-",
      verify_url: verifyUrl,
      subject: "Your ARC LABS Certificate Registration ID",
      email_html: `
        <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#162033;">
          <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
            <div style="background:#ffffff;border:1px solid #e6ebf2;border-radius:14px;overflow:hidden;">
              <div style="padding:24px 28px;background:#07111f;color:#ffffff;">
                <div style="font-size:20px;font-weight:800;letter-spacing:.04em;">ARC LABS</div>
                <div style="margin-top:6px;font-size:13px;color:#b8c3d6;">Certificate Registration Confirmation</div>
              </div>
              <div style="padding:28px;">
                <p style="margin:0 0 14px;font-size:15px;line-height:1.65;">Dear ${studentName},</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.65;">
                  Congratulations. Your ARC LABS certificate registration for <strong>${workshopName}</strong> has been completed successfully.
                </p>
                <div style="margin:22px 0;padding:18px 20px;border-radius:12px;background:#eefbf7;border:1px solid #b9efe0;text-align:center;">
                  <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#667085;">Unique Certificate ID</div>
                  <div style="margin-top:8px;font-size:28px;font-weight:800;color:#005f73;letter-spacing:.08em;">${cert.certId}</div>
                </div>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.65;">
                  Please keep this ID safe. Use it on the ARC LABS Verify page to validate and download your certificate.
                </p>
                <a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#00d48f;color:#061016;text-decoration:none;font-weight:800;">
                  Verify Certificate
                </a>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#667085;">
                  This is an automated confirmation from ARC LABS. For support, contact your department coordinator or write to hello@arclabs.in.
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
      message: [
        `Dear ${studentName},`,
        "",
        `Congratulations. Your ARC LABS certificate registration for ${workshopName} has been completed successfully.`,
        "",
        `Unique Certificate ID: ${cert.certId}`,
        "",
        "Please keep this ID safe. You can use it on the ARC LABS Verify page to validate and download your certificate.",
        "",
        `Verify Certificate: ${verifyUrl}`,
        "",
        "Regards,",
        "ARC LABS Certification Team",
      ].join("\n"),
    },
    PUBLIC_KEY
  );
}
