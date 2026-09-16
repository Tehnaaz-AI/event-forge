import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const eventSchema = new Schema({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  shortDescription: String, // Added for AI generation
  tagline: String, // Added for AI generation
  highlights: [String], // Added for AI generation
  eventType: String,
  category: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timezone: { type: String, default: 'Asia/Kolkata' },
  venue: {
    name: String,
    address: String
  },
  capacity: { type: Number, min: 1 },
  status: { 
    type: String, 
    enum: ['DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE', 'COMPLETED', 'ARCHIVED'], 
    default: 'DRAFT' 
  },
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  registrationSettings: {
    waitlistEnabled: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false }
  }
}, { timestamps: true });

eventSchema.index({ organization: 1, startDate: 1 });

export const Event = model('Event', eventSchema);
