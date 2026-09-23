import { NextResponse } from "next/server";
import dbConnect from "../../db/dbconnect";
import Otp from "../../db/models/Otp";
import { jsonSuccess, jsonError } from "../../../lib/api/response";
import { ValidationError } from "../../../lib/api/errors";
import { otpVerifySchema } from "../../../lib/validators";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  try {
    otpVerifySchema.parse(body);
  } catch (e) {
    throw new ValidationError(e.errors?.[0]?.message || 'Invalid input');
  }

  const { email, otp } = body;

  const normalizedEmail = email.trim().toLowerCase();
  const record = await Otp.findOne({ email: normalizedEmail });
  if (!record) {
    return new Response(JSON.stringify(jsonError('Invalid OTP', 'OTP_INVALID', 400)), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const isMatch = await bcrypt.compare(otp, record.otp);
  if (!isMatch) {
    return new Response(JSON.stringify(jsonError('Invalid OTP', 'OTP_INVALID', 400)), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (new Date() > record.expiresAt) {
    await Otp.deleteOne({ _id: record._id });
    return new Response(JSON.stringify(jsonError('OTP expired', 'OTP_EXPIRED', 400)), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  await Otp.deleteOne({ _id: record._id }); // cleanup
  return new Response(JSON.stringify(jsonSuccess(null, 'OTP verified')), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

