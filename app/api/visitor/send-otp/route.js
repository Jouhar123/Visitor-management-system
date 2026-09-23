import { NextResponse } from "next/server";
import dbConnect from "../../db/dbconnect";
import Otp from "../../db/models/Otp";
import { sendEmail } from "../../lib/mail/send-mail";
import { jsonSuccess, jsonError } from "../../../lib/api/response";
import { ValidationError } from "../../../lib/api/errors";
import { otpSendSchema } from "../../../lib/validators";
import bcrypt from "bcryptjs"; // we will hash OTP before storage

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  try {
    otpSendSchema.parse(body);
  } catch (e) {
    throw new ValidationError(e.errors?.[0]?.message || 'Invalid input');
  }

  const { email } = body;
  const normalizedEmail = email.trim().toLowerCase();

  // Generate random 6‑digit OTP
  const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = await bcrypt.genSalt(12);
  const otpHash = await bcrypt.hash(otpPlain, salt);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Remove any previous OTPs for this email
  await Otp.deleteMany({ email: normalizedEmail });
  await Otp.create({ email: normalizedEmail, otp: otpHash, expiresAt });

  const subject = "Your OTP Code";
  const html = `
    <html>
      <body style="background-color:#f9fafb; margin:0; padding:40px 0; font-family:'Segoe UI', sans-serif;">
        <div style="max-width:480px; margin:0 auto; background:#ffffff; padding:24px 32px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
          <h2 style="text-align:center; color:#222; margin-bottom:20px;">Email Verification</h2>
          <p style="font-size:15px; color:#444; line-height:1.6;">Hi there,<br /><br />Please use the OTP below to verify your email:</p>
          <div style="margin:24px auto; text-align:center;">
            <span style="display:inline-block; padding:14px 28px; font-size:22px; font-weight:600; color:#fff; background-color:#2563eb; border-radius:8px; letter-spacing:2px;">${otpPlain}</span>
          </div>
          <p style="font-size:14px; color:#666; text-align:center;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
          <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;" />
          <p style="font-size:12px; color:#999; text-align:center;">If you didn’t request this, you can safely ignore this message.</p>
        </div>
      </body>
    </html>
  `;
  const text = `Your OTP code is: ${otpPlain}. This OTP is valid for 5 minutes.`;

  const result = await sendEmail(normalizedEmail, subject, html, text);

  if (result.ok) {
    return new Response(JSON.stringify(jsonSuccess(null, 'OTP sent')), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } else {
    return new Response(JSON.stringify(jsonError(result.msg || 'Mail failed', 'EMAIL_ERROR', 500)), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

