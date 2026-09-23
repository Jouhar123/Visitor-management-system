import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "../../db/models/Users";
import dbConnect from "../../db/dbconnect";
import { jsonSuccess, jsonError } from "../../../lib/api/response";
import { AuthError, ValidationError } from "../../../lib/api/errors";

export async function GET(req) {
  try {
    await dbConnect();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new AuthError('Missing Authorization header');
    const token = authHeader.split(' ')[1];
    if (!token) throw new AuthError('Missing token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select("-password");
    if (!user) throw new AuthError('User not found');
    return new Response(JSON.stringify(jsonSuccess(user, 'Valid session')), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message = err.message || 'Internal Server Error';
    return new Response(JSON.stringify(jsonError(message, err.code || 'AUTH_ERROR', status)), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
