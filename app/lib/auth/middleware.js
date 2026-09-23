import { jsonError, jsonSuccess } from '../api/response';
import { ApiError, ValidationError, AuthError, ForbiddenError } from '../api/errors';
import { verify } from 'jsonwebtoken';
import User from '../../api/db/models/Users';
import dbConnect from '../../api/db/dbconnect';

/**
 * Middleware to protect API routes.
 * Usage in route file:
 *   export async function GET(req) {
 *     await authMiddleware(req);
 *     // ...your code
 *   }
 */
export async function authMiddleware(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) throw new AuthError('Missing Authorization header');

  const token = authHeader.split(' ')[1];
  if (!token) throw new AuthError('Missing token');

  await dbConnect();
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach to request
  } catch (err) {
    throw new AuthError('Invalid or expired token');
  }
}

/**
 * Simple role‑based access control.
 *   requireRoles(req, ['ADMIN', 'SUPER_ADMIN'])
 */
export function requireRoles(req, allowedRoles = []) {
  if (!req.user) throw new AuthError('User not authenticated');
  const userRole = req.user.role?.toUpperCase();
  if (!allowedRoles.includes(userRole)) {
    throw new ForbiddenError('Insufficient permissions');
  }
}

/**
 * Helper to handle async route functions and format responses.
 *   export async function GET(req) {
 *     return await handler(req, async () => { ... });
 *   }
 */
export async function handler(req, fn) {
  try {
    const result = await fn();
    return new Response(JSON.stringify(jsonSuccess(result)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return new Response(JSON.stringify(jsonError(err.message, err.code, err.status)), {
        status: err.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify(jsonError('Internal Server Error', 'INTERNAL_ERROR', 500)), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
