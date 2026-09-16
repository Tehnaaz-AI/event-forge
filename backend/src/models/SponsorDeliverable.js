import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const SponsorDeliverable = model('SponsorDeliverable', new Schema({
  sponsor: { type: Schema.Types.ObjectId, ref: 'Sponsor', required: true },
  title: { type: String, required: true },
  description: String,
  deadline: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'OVERDUE'], 
    default: 'PENDING' 
  },
  assetUrl: String,
  notes: String
}, { timestamps: true }));
