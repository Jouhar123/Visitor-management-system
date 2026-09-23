
import Sponsor from '../db/models/sponsor';
import { jsonSuccess, jsonError } from '../../lib/api/response';
import { ValidationError, AuthError, ForbiddenError } from '../../lib/api/errors';
import { authMiddleware, requireRoles } from '../../lib/auth/middleware';
import dbConnect from '../db/dbconnect';
import { z } from 'zod';

// Validation schema for sponsor creation / update
const sponsorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  active: z.boolean().optional(),
});

/** POST /api/sponsor – create a new sponsor (ADMIN/SUPER_ADMIN only) */
export async function POST(req) {
  await authMiddleware(req);
  requireRoles(req, ['ADMIN', 'SUPER_ADMIN']);
  await dbConnect();
  const body = await req.json();
  try {
    sponsorSchema.parse(body);
  } catch (e) {
    throw new ValidationError(e.errors?.[0]?.message || 'Invalid sponsor data');
  }

  const existing = await Sponsor.findOne({ email: body.email });
  if (existing) {
    return new Response(JSON.stringify(jsonError('Sponsor already exists', 'SPONSOR_EXISTS', 409)), { status: 409, headers: { 'Content-Type': 'application/json' } });
  }

  const sponsor = await Sponsor.create(body);
  return new Response(JSON.stringify(jsonSuccess(sponsor, 'Sponsor created')), { status: 201, headers: { 'Content-Type': 'application/json' } });
}

/** GET /api/sponsor – list sponsors (any authenticated user) */
export async function GET(req) {
  await authMiddleware(req);
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const email = searchParams.get('email');
  const department = searchParams.get('department');
  const filter = {};
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (email) filter.email = email;
  if (department) filter.department = { $regex: department, $options: 'i' };
  const sponsors = await Sponsor.find(filter);
  if (!sponsors || sponsors.length === 0) {
    return new Response(JSON.stringify(jsonError('No sponsors found', 'NOT_FOUND', 404)), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify(jsonSuccess(sponsors, 'Sponsors fetched')), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

/** DELETE /api/sponsor – delete a sponsor (ADMIN/SUPER_ADMIN only) */
export async function DELETE(req) {
  await authMiddleware(req);
  requireRoles(req, ['ADMIN', 'SUPER_ADMIN']);
  await dbConnect();
  const { id } = await req.json();
  const sponsor = await Sponsor.findByIdAndDelete(id);
  if (!sponsor) {
    return new Response(JSON.stringify(jsonError('Sponsor not found', 'NOT_FOUND', 404)), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify(jsonSuccess({ message: 'Sponsor deleted successfully' })), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

/** PUT /api/sponsor – update a sponsor (ADMIN/SUPER_ADMIN only) */
export async function PUT(req) {
  await authMiddleware(req);
  requireRoles(req, ['ADMIN', 'SUPER_ADMIN']);
  await dbConnect();
  const body = await req.json();
  try {
    sponsorSchema.parse(body);
  } catch (e) {
    throw new ValidationError(e.errors?.[0]?.message || 'Invalid sponsor data');
  }
  const { email, ...update } = body;
  const sponsor = await Sponsor.findOneAndUpdate({ email }, update, { new: true });
  if (!sponsor) {
    return new Response(JSON.stringify(jsonError('Sponsor not found', 'NOT_FOUND', 404)), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify(jsonSuccess(sponsor, 'Sponsor updated')), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
