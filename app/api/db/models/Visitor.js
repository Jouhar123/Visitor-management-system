// models/Visitor.js
import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    sponsor: String,
    name: String,
    email: String,
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Visitor ||
  mongoose.model("Visitor", visitorSchema);
