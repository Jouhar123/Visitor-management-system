import { NextResponse } from "next/server";
import { User } from "../db/models/Users";
import jwt from "jsonwebtoken";
import dbConnect from '../db/dbconnect'

export async function POST(req) {
  try {
    await dbConnect();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }
    const user = await User.create({ name, email, password, role: "sponsor" });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { message: "User created successfully", user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const password = searchParams.get("password");

    if (email && password) {
      const user = await User.findOne({ email });

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Invalid password" },
          { status: 401 }
        );
      }
      const userPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role:user.role,
        createdAt: user.createdAt,
      };
      const token = jwt.sign(
        userPayload,
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      return NextResponse.json(
        {
          message: "Login successful",
          token,
          user: userPayload,
        },
        { status: 200 }
      );
    }
    const users = await User.find().select("-password");
    return NextResponse.json(
      { message: "Users fetched successfully", users },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { message: "Error processing request", error: error.message },
      { status: 500 }
    );
  }
}
