import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// TTL index – documents expire automatically after `expiresAt`
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ email: 1, expiresAt: 1 });

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
