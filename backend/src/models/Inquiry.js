import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const inquirySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'General Inquiry' },
  message: { type: String, required: true },
  status: { type: String, enum: ['NEW', 'IN_REVIEW', 'RESOLVED'], default: 'NEW' },
  adminNotes: String,
  recipientAdminEmail: String
}, { timestamps: true });

inquirySchema.index({ createdAt: -1 });

export const Inquiry = model('Inquiry', inquirySchema);
