import { NextResponse } from "next/server";
import dbConnect from "../../db/dbconnect";
import Otp from "../../db/models/Otp";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Missing input" }, { status: 400 });
    }

    await dbConnect();
    const normalizedEmail = email.trim().toLowerCase();
    const record = await Otp.findOne({ email: normalizedEmail, otp });
  
    if (!record) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await Otp.deleteOne({ _id: record._id });
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    await Otp.deleteOne({ _id: record._id }); // cleanup
    return NextResponse.json({ message: "OTP verified" });
  } catch (err) {
    console.error("Error in verify-otp route:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
