import dbConnect from "../../db/dbconnect";
import Visitor from "../../db/models/Visitor";

import { NextResponse } from "next/server";


export async function GET(_, { params }) {
  try {
    await dbConnect();
    const visitor = await Visitor.findById(params.id);
    if (!visitor) {
      return new Response("Visitor not found", { status: 404 });
    }
    return NextResponse.json(visitor);
  } catch (error) {
    return new Response("Error fetching visitor", { status: 500 });
  }
}

export async function PUT(req, { params }) {

  try {
    await dbConnect();
    const updates = await req.json();
    const updatedVisitor = await Visitor.findByIdAndUpdate(params.id, updates, {
      new: true,
    });

    if (!updatedVisitor) {
      return new Response("Visitor not found", { status: 404 });
    }
    return NextResponse.json(updatedVisitor);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating visitor", error },
      { status: 500 }
    );
  }
}

export async function DELETE(_, { params }) {
  try {
    await dbConnect();
    const deleteVisitor = await Visitor.findOneAndDelete(params.id);
    if (!deleteVisitor) {
      return new Response("Visitor not found", { status: 404 });
    }
    return NextResponse.json({ message: "Visitor deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting visitor", error },
      { status: 500 }
    );
  }
}
