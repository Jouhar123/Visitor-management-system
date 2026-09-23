// models/Visit.js
import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor' },
  photoUrl: String,
  purpose: String,
  whomToMeet: String,
  time: String,
  approval: {
    type: Boolean,
    default: false,
  },
  rejected: {
    type: Boolean,
    default: false,
  },
  approvalToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  locationLat: Number,
  locationLong: Number,
  expiresAt: Date,
}, { timestamps: true });

// Indexes for fast lookups
visitSchema.index({ visitor: 1 });
visitSchema.index({ createdAt: 1 });
visitSchema.index({ expiresAt: 1 });
visitSchema.index({ approvalToken: 1 }, { unique: true, sparse: true });

export default mongoose.models.Visit || mongoose.model('Visit', visitSchema);
