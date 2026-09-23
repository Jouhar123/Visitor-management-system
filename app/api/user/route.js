import { NextResponse } from "next/server";
import { User } from "../db/models/Users";
import jwt from "jsonwebtoken";
import dbConnect from '../db/dbconnect';
import { jsonSuccess, jsonError } from '../../lib/api/response';
import { ValidationError, AuthError } from '../../lib/api/errors';
import { signupSchema, loginSchema } from '../../lib/validators';
import bcrypt from "bcryptjs";
import RefreshToken from "../db/models/RefreshToken";

/**
 * POST /api/user  →  Sign‑up (new account)
 */
export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  try {
    signupSchema.parse(body);
  } catch (e) {
    throw new ValidationError(e.errors?.[0]?.message || 'Invalid input');
  }

  const { name, email, password } = body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response(JSON.stringify(jsonError('User with this email already exists', 'USER_EXISTS', 409)), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await User.create({ name, email, password, role: "sponsor" });
  const payload = { _id: user._id, name: user.name, email: user.email, role: user.role };

  // Access token (short‑lived)
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "24h" });
  // Refresh token (long‑lived)
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
  await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

  return new Response(JSON.stringify(jsonSuccess({ token, refreshToken, user: payload }, 'User created successfully')), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * GET /api/user?email=...&password=...  →  Login
 * (We keep a GET for backward compatibility but it now validates input.)
 */
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const loginData = { email, password };
  try {
    loginSchema.parse(loginData);
  } catch (e) {
    throw new ValidationError(e.errors?.[0]?.message || 'Invalid credentials');
  }

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify(jsonError('User not found', 'USER_NOT_FOUND', 404)), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return new Response(JSON.stringify(jsonError('Invalid password', 'INVALID_PASSWORD', 401)), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = { _id: user._id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "24h" });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
  await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

  return new Response(JSON.stringify(jsonSuccess({ token, refreshToken, user: payload }, 'Login successful')), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

