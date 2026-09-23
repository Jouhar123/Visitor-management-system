import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  company: String,
  department: String,
  active: {
    type: Boolean,
    default: true,
  },
});

// Indexes
sponsorSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.models.sponsor || mongoose.model('Sponsor', sponsorSchema);

