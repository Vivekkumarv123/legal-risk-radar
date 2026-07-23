import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.error("❌ Email recipient missing");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465, // ✅ Use 465 for Vercel (SSL)
      secure: true, // ✅ Must be true for port 465
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Wrap in Promise to ensure Vercel waits for completion
    await new Promise((resolve, reject) => {
      transporter.sendMail({
        from: `"Legal Advisor" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        text,
        html,
      }, (err, info) => {
        if (err) {
          console.error("❌ SMTP Error:", err);
          reject(err);
        } else {
          resolve(info);
        }
      });
    });

  } catch (error) {
    console.error("❌ Email sending failed:", error?.message || error);
    // We don't throw error here to prevent crashing the main thread
  }
};

export default sendEmail;