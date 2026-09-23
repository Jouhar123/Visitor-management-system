import dbConnect from "../../db/dbconnect";
import Visitor from "../../db/models/Visitor";
import Visit from "../../db/models/Visit";
import { jsonSuccess, jsonError } from "../../../lib/api/response";
import { ValidationError } from "../../../lib/api/errors";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const date = searchParams.get("date"); // YYYY-MM-DD
  const email = searchParams.get("email");

  try {
    let visits;
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);

    if (filter === "visitToday" || filter === "today") {
      visits = await Visit.find({ createdAt: { $gte: todayUTC, $lt: tomorrowUTC } }).populate("visitor");
    } else if (filter === "latest") {
      const latestVisits = await Visit.aggregate([
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$visitor", latestVisit: { $first: "$$ROOT" } } },
      ]);
      visits = await Visit.populate(latestVisits.map(v => v.latestVisit), { path: "visitor" });
    } else if (filter === "active") {
      visits = await Visit.find({ expiresAt: { $gte: now } }).populate("visitor");
    } else if (date) {
      const targetUTC = new Date(date + 'T00:00:00.000Z');
      const nextUTC = new Date(targetUTC);
      nextUTC.setUTCDate(targetUTC.getUTCDate() + 1);
      visits = await Visit.find({ createdAt: { $gte: targetUTC, $lt: nextUTC } }).populate("visitor");
    } else if (email) {
      const visitor = await Visitor.findOne({ email });
      if (!visitor) {
        return new Response(JSON.stringify(jsonSuccess([])), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      visits = await Visit.find({ visitor: visitor._id }).populate("visitor");
    } else {
      visits = await Visit.find().sort({ createdAt: -1 }).populate("visitor");
    }

    return new Response(JSON.stringify(jsonSuccess(visits)), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify(jsonError('Internal Server Error', 'INTERNAL_ERROR', 500)), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const body = await req.json();
  try {
    const visit = await Visit.findById(id).populate("visitor");
    if (!visit) {
      return new Response(JSON.stringify(jsonError('Visit not found', 'NOT_FOUND', 404)), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    const visitFields = ["photoUrl", "purpose", "whomToMeet", "time", "locationLat", "locationLong", "expiresAt"];
    const visitorFields = ["name", "email", "phone"];
    let visitUpdated = false;
    let visitorUpdated = false;
    for (let key of visitFields) {
      if (body.hasOwnProperty(key)) {
        visit[key] = body[key];
        visitUpdated = true;
      }
    }
    if (visitUpdated) await visit.save();
    if (visit.visitor) {
      const visitor = visit.visitor;
      for (let key of visitorFields) {
        if (body.hasOwnProperty(key)) {
          visitor[key] = body[key];
          visitorUpdated = true;
        }
      }
      if (visitorUpdated) await visitor.save();
    }
    return new Response(JSON.stringify(jsonSuccess({ message: 'Update successful' })), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Update error:", error);
    return new Response(JSON.stringify(jsonError('Internal Server Error', 'INTERNAL_ERROR', 500)), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const visitId = searchParams.get("visitId");
  const visitorId = searchParams.get("visitorId");
  try {
    if (visitId) {
      const visit = await Visit.findByIdAndDelete(visitId);
      if (!visit) {
        return new Response(JSON.stringify(jsonError('Visit not found', 'NOT_FOUND', 404)), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify(jsonSuccess({ message: 'Visit deleted successfully' })), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (visitorId) {
      const visitor = await Visitor.findById(visitorId);
      if (!visitor) {
        return new Response(JSON.stringify(jsonError('Visitor not found', 'NOT_FOUND', 404)), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      await Visit.deleteMany({ visitor: visitorId });
      await visitor.deleteOne();
      return new Response(JSON.stringify(jsonSuccess({ message: 'Visitor and all their visits deleted successfully' })), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(jsonError('Invalid request. Provide either visitId or visitorId', 'BAD_REQUEST', 400)), { status: 400, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify(jsonError('Internal Server Error', 'INTERNAL_ERROR', 500)), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
