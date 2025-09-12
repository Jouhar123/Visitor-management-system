import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "../../db/models/Users";
import dbConnect from "../../db/dbconnect";

export async function GET(req) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Valid session", user },
      { status: 200 }
    );
  } catch (err) {
    console.error("Token validation error:", err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
