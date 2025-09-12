import { NextResponse } from "next/server";
import { sendEmail } from "../../lib/mail/send-mail";
import QRCode from "qrcode";

export async function POST(req) {
  try {
    const { name, email, time } = await req.json();

    if (!email || !name || !time) {
      return NextResponse.json({ message: "Email, name, and time are required" }, { status: 400 });
    }

    // Convert time string to Date object
    const now = new Date();
    const [hh, mm] = time.split(":").map(Number);
    const issuedAt = new Date(now.setHours(hh, mm, 0, 0));
    const expiry = new Date(issuedAt.getTime() + 5 * 60 * 60 * 1000); // 5 hours later

    const payload = {
      name,
      email,
      issuedAt: issuedAt.toISOString(),
      expiry: expiry.toISOString(),
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(payload));

    const subject = "Your Visitor QR Code";
    const html = `
      <html>
        <body style="background:#f9fafb;padding:40px;font-family:sans-serif;">
          <div style="max-width:500px;margin:0 auto;background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="text-align:center;color:#111;">Welcome, ${name}!</h2>
            <p style="font-size:15px;color:#333;">Here is your visitor QR code. Please present this at the reception.</p>
            <div style="text-align:center;margin:20px 0;">
              <img src="${qrCodeDataUrl}" alt="Visitor QR Code" style="width:200px;height:200px;" />
            </div>
            <p style="font-size:14px;color:#666;">This code is valid until <strong>${expiry.toLocaleString()}</strong>.</p>
            <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
            <p style="font-size:12px;color:#999;text-align:center;">Do not share this QR code with anyone else.</p>
          </div>
        </body>
      </html>
    `;

    const text = `Hello ${name}, here is your visitor QR code. It's valid until ${expiry.toLocaleString()}.`;

    const result = await sendEmail(email, subject, html, text);

    if (result.ok) {
      return NextResponse.json({ message: "QR code email sent successfully!" });
    } else {
      return NextResponse.json(
        { message: result.msg || "Failed to send QR email" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Error in send-qrcode route:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
