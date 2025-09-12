import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  company: String,
  department: String,
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.sponsor || mongoose.model('Sponsor', sponsorSchema);
