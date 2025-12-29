import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  if (!to) {
    console.error("❌ Email recipient missing");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
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
      from: `"Technoholic Chatbot" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error?.message || error);
  }
};

export default sendEmail;
