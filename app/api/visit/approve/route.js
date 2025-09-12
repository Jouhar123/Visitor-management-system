import dbConnect from "../../db/dbconnect";
import Visit from "../../db/models/Visit";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const token = searchParams.get("token");
    const action = searchParams.get("action") || "approve";
    if (!token) {
      return new Response(
        "<h2>Missing approval token.</h2>",
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }
    const visit = await Visit.findOne({ approvalToken: token });
    if (!visit) {
      return new Response(
        "<h2>Invalid or expired approval token.</h2>",
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }
    if (action === "approve") {
      if (visit.approval) {
        return new Response(
          "<h2>Visit already approved.</h2>",
          { headers: { "Content-Type": "text/html" } }
        );
      }
      visit.approval = true;
      visit.rejected = false;
      await visit.save();
      return new Response(
        "<h2>Visit approved successfully.</h2>",
        { headers: { "Content-Type": "text/html" } }
      );
    } else if (action === "reject") {
      if (visit.rejected) {
        return new Response(
          "<h2>Visit already rejected.</h2>",
          { headers: { "Content-Type": "text/html" } }
        );
      }
      visit.approval = false;
      visit.rejected = true;
      await visit.save();
      return new Response(
        "<h2>Visit rejected successfully.</h2>",
        { headers: { "Content-Type": "text/html" } }
      );
    } else {
      return new Response(
        "<h2>Invalid action.</h2>",
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }
  } catch (error) {
    return new Response(
      `<h2>Error: ${error.message}</h2>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
} 