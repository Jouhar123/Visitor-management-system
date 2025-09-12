import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

export async function sendEmail(email, subject, htmlBody, textBody) {
  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log("Email sent successfully:", info.messageId);
    return { ok: true, response: info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { ok: false, msg: error.message || "Failed to send email" };
  }
}

export async function sendEmailWithAttachment(
  email,
  subject,
  htmlBody,
  textBody,
  base64ImageDataURL
) {
  try {
    const base64Data = base64ImageDataURL.split("base64,")[1];

    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: "qrcode.png",
          content: base64Data,
          encoding: "base64", 
        },
      ],
    });

    console.log("Email with attachment sent successfully:", info.messageId);
    return { ok: true, response: info };
  } catch (error) {
    console.error("Error sending email with attachment:", error);
    return { ok: false, msg: error.message || "Failed to send email with attachment" };
  }
}
