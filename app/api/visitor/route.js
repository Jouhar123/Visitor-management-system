import dbConnect from "../db/dbconnect";
import Visitor from "../db/models/Visitor";
import Visit from "../db/models/Visit";
import imageCompression from "browser-image-compression";
import { NextResponse } from "next/server";
import { sendEmail } from "../lib/mail/send-mail";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      purpose,
      whomToMeet,
      photoUrl,
      location,
    } = body;

    if (!name || !email || !phone || !purpose || !whomToMeet || !photoUrl) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    let visitor = await Visitor.findOne({ phone });

    if (!visitor) {
      visitor = await Visitor.create({ name, email, phone });
    } else {
      if (visitor.name !== name || visitor.email !== email) {
        visitor.name = name;
        visitor.email = email;
        await visitor.save();
      }
    }

    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentVisit = await Visit.findOne({
      visitor: visitor._id,
      createdAt: { $gte: thirtyMinsAgo },
    });

    if (recentVisit) {
      return NextResponse.json(
        { message: "Visit already recorded recently." },
        { status: 429 }
      );
    }

    const visitTime = new Date();

    const visitDurationMinutes = 300;
    const expiryTime = new Date(
      visitTime.getTime() + visitDurationMinutes * 60000
    );

    // Generate approval token
    const approvalToken = crypto.randomBytes(32).toString("hex");

    const newVisit = await Visit.create({
      visitor: visitor._id,
      photoUrl,
      purpose,
      whomToMeet,
      time: visitTime,
      locationLat: location?.latitude,
      locationLong: location?.longitude,
      expiresAt: expiryTime,
      approvalToken,
      approval: false,
    });

    // Send approval email to sponsor and meeting person
    const approveLink = `${process.env.NEXT_BASE_URL || "http://localhost:3000"}/api/visit/approve?token=${approvalToken}&action=approve`;
    const rejectLink = `${process.env.NEXT_BASE_URL || "http://localhost:3000"}/api/visit/approve?token=${approvalToken}&action=reject`;
    const subject = "Visitor Approval Request";
    const htmlBody = `<p>A visitor (<b>${name}</b>, ${email}) has registered to meet <b>${whomToMeet}</b>.<br/>Please choose an action below:</p>
      <a href='${approveLink}' style='background:#22c55e;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;margin-right:10px;'>Approve</a>
      <a href='${rejectLink}' style='background:#ef4444;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;'>Reject</a>`;
    const textBody = `A visitor (${name}, ${email}) purpose (${purpose}) has registered to meet ${whomToMeet}. Approve: ${approveLink}  Reject: ${rejectLink}`;

    // Send to sponsor
    if (body.sponsor) {
      await sendEmail(body.sponsor, subject, htmlBody, textBody);
    }
    // Send to meeting person (if email is valid)
    if (whomToMeet && whomToMeet.includes("@")) {
      await sendEmail(whomToMeet, subject, htmlBody, textBody);
    }

    return NextResponse.json({ message: "Visit recorded successfully. Awaiting approval." });
  } catch (error) {
    console.error("Error saving visit:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const visitor = await Visitor.find().sort({ createdAt: -1 });
    return NextResponse.json(visitor);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching visitors", error },
      { status: 500 }
    );
  }
}
