import dbConnect from "../../db/dbconnect";
import User from "../../db/models/Users";
import RefreshToken from "../../db/models/RefreshToken";
import jwt from "jsonwebtoken";
import { jsonSuccess, jsonError } from "../../../lib/api/response";
import { ValidationError, AuthError } from "../../../lib/api/errors";
import { z } from 'zod';

// Expect refresh token in request body (could be in cookie in real prod)
const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  try {
    refreshSchema.parse(body);
  } catch (e) {
    throw new ValidationError(e.errors?.[0]?.message || 'Invalid input');
  }

  const { refreshToken } = body;
  // Verify token signature & extract payload
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (e) {
    throw new AuthError('Invalid or expired refresh token');
  }

  // Find stored token and ensure not revoked
  const stored = await RefreshToken.findOne({ token: refreshToken, userId: decoded._id });
  if (!stored) {
    throw new AuthError('Refresh token not recognized');
  }

  // Issue new access token (short‑lived)
  const payload = { _id: decoded._id, name: decoded.name, email: decoded.email, role: decoded.role };
  const newAccess = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '24h' });

  // Optionally rotate refresh token: generate new one, replace in DB
  const newRefresh = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
  stored.token = newRefresh;
  stored.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await stored.save();

  return new Response(JSON.stringify(jsonSuccess({ accessToken: newAccess, refreshToken: newRefresh }, 'Tokens refreshed')), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
