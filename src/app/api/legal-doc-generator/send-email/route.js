import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { sendEmailWithAttachment } from "@/utils/email.utils";

export async function POST(req) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { to, subject, emailBody, pdfBase64, fileName } = body;

    if (!to || !subject || !emailBody || !pdfBase64) {
      return NextResponse.json({ 
        error: "Missing required parameters: to, subject, emailBody, and pdfBase64 are required." 
      }, { status: 400 });
    }

    // Validate email format
    if (typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json({ error: "Invalid recipient email address" }, { status: 400 });
    }

    // Clean and decode the base64 pdf file payload
    const cleanedBase64 = pdfBase64.includes('base64,') 
      ? pdfBase64.split('base64,')[1] 
      : pdfBase64;

    const attachments = [{
      filename: fileName || 'legal-document.pdf',
      content: Buffer.from(cleanedBase64, 'base64'),
      contentType: 'application/pdf'
    }];

    const result = await sendEmailWithAttachment({
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #334155; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0; font-size: 20px;">Document Shared: ${fileName?.split('.')[0] || 'Legal Agreement'}</h2>
          <p>${emailBody.replace(/\n/g, '<br/>')}</p>
          <br/>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;"/>
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">
            This document was generated and sent securely via <strong>Legal Advisor</strong>.
          </p>
        </div>
      `,
      text: emailBody,
      attachments
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Doc generator email API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
