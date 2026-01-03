import nodemailer from "nodemailer";

// 👇 FIX: Use curly braces {} to accept an object
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.error("❌ Email recipient missing");
    return;
  }

  // Debug log
  console.log("📨 Sending to:", to);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"Legal Advisor" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error?.message || error);
    throw error;
  }
};

export default sendEmail;