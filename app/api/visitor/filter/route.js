import dbConnect from "../../db/dbconnect";
import Visitor from "../../db/models/Visitor";
import Visit from "../../db/models/Visit";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");
    const date = searchParams.get("date"); // YYYY-MM-DD
    const email = searchParams.get("email");

    console.log("API Request - filter:", filter, "date:", date, "email:", email);

    let visits;

    // Get the beginning and end of today in UTC
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);

    if (filter === "visitToday" || filter === "today") {
      console.log("Filtering for today's visits (UTC):", { todayUTC, tomorrowUTC });
      visits = await Visit.find({
        createdAt: {
          $gte: todayUTC,
          $lt: tomorrowUTC,
        },
      }).populate("visitor");
      console.log("Today's visits found:", visits.length);
      return NextResponse.json(visits);
    }

    if (filter === "latest") {
      console.log("Filtering for latest visits per visitor");
      const latestVisits = await Visit.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$visitor",
            latestVisit: { $first: "$$ROOT" },
          },
        },
      ]);
      const populated = await Visit.populate(
        latestVisits.map((v) => v.latestVisit),
        { path: "visitor" }
      );
      console.log("Latest visits found:", populated.length);
      return NextResponse.json(populated);
    }

    if (filter === "active") {
      const now = new Date();
      console.log("Filtering for active visits (not expired):", now);
      visits = await Visit.find({ expiresAt: { $gte: now } }).populate(
        "visitor"
      );
      console.log("Active visits found:", visits.length);
      return NextResponse.json(visits);
    }

    if (date) {
      // Parse the date as UTC start of day
      const targetUTC = new Date(date + 'T00:00:00.000Z');
      const nextUTC = new Date(targetUTC);
      nextUTC.setUTCDate(targetUTC.getUTCDate() + 1);
      console.log("Filtering for specific date (UTC):", { targetUTC, nextUTC });
      visits = await Visit.find({
        createdAt: { $gte: targetUTC, $lt: nextUTC },
      }).populate("visitor");
      console.log("Visits for date", date, "found:", visits.length);
      return NextResponse.json(visits);
    }

    if (email) {
      console.log("Filtering for email:", email);
      const visitor = await Visitor.findOne({ email });
      if (!visitor) {
        console.log("No visitor found for email:", email);
        return NextResponse.json([]);
      }
      visits = await Visit.find({ visitor: visitor._id }).populate("visitor");
      console.log("Visits for email", email, "found:", visits.length);
      return NextResponse.json(visits);
    }

    // Default: all visits
    console.log("Fetching all visits");
    visits = await Visit.find().sort({ createdAt: -1 }).populate("visitor");
    console.log("Total visits found:", visits.length);
    if (visits.length > 0) {
      console.log("Sample visit structure:", {
        id: visits[0]._id,
        createdAt: visits[0].createdAt,
        visitor: visits[0].visitor ? {
          id: visits[0].visitor._id,
          name: visits[0].visitor.name,
          email: visits[0].visitor.email
        } : null
      });
    }
    return NextResponse.json(visits);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
     const body = await req.json();

    const visit = await Visit.findById(id).populate("visitor");
    if (!visit) {
      return NextResponse.json({ message: "Visit not found" }, { status: 404 });
    }

    const visitFields = [
      "photoUrl",
      "purpose",
      "whomToMeet",
      "time",
      "locationLat",
      "locationLong",
      "expiresAt",
    ];
    const visitorFields = ["name", "email", "phone"];

    let visitUpdated = false;
    let visitorUpdated = false;

    // ✅ Update Visit if any visit-related fields are present
    for (let key of visitFields) {
      if (body.hasOwnProperty(key)) {
        visit[key] = body[key];
        visitUpdated = true;
      }
    }

    if (visitUpdated) {
      await visit.save();
    }

    // ✅ Update Visitor if any visitor-related fields are present
    if (visit.visitor) {
      const visitor = visit.visitor;
      for (let key of visitorFields) {
        if (body.hasOwnProperty(key)) {
          visitor[key] = body[key];
          visitorUpdated = true;
        }
      }

      if (visitorUpdated) {
        await visitor.save();
      }
    }

    return NextResponse.json({
      message: `Update successful${visitUpdated ? " (visit)" : ""}${
        visitorUpdated ? " (visitor)" : ""
      }`,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const visitId = searchParams.get("visitId");
    const visitorId = searchParams.get("visitorId");

    if (visitId) {
      const visit = await Visit.findByIdAndDelete(visitId);
      if (!visit) {
        return NextResponse.json(
          { message: "Visit not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: "Visit deleted successfully" });
    }

    if (visitorId) {
      const visitor = await Visitor.findById(visitorId);
      if (!visitor) {
        return NextResponse.json(
          { message: "Visitor not found" },
          { status: 404 }
        );
      }

      await Visit.deleteMany({ visitor: visitorId });
      await visitor.deleteOne();

      return NextResponse.json({
        message: "Visitor and all their visits deleted successfully",
      });
    }

    return NextResponse.json(
      { message: "Invalid request. Provide either visitId or visitorId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/visits/delete?visitId=VISIT_ID → Deletes one visit.

// DELETE /api/visits/delete?visitorId=VISITOR_ID → Deletes all visits for a visitor and the visitor

/*
| Filter          | Description                         | Example Request                      |
| --------------- | ----------------------------------- | ------------------------------------ |
| `filter=today`  | All visits **created today**        | `/api/visits?filter=today`           |
| `filter=latest` | Latest visit per visitor            | `/api/visits?filter=latest`          |
| `filter=active` | Visitors still inside (not expired) | `/api/visits?filter=active`          |
| `email`         | Filter visits by email              | `/api/visits?email=john@example.com` |
| `date`          | Filter visits by specific date      | `/api/visits?date=2025-06-20`        |
| *(none)*        | Return all visits                   | `/api/visits`                        |

*/
