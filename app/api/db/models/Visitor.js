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

// Indexes
visitorSchema.index({ phone: 1 }, { unique: true });
visitorSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.models.Visitor || mongoose.model("Visitor", visitorSchema);

