import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['PLATFORM_ADMIN', 'ORGANIZER', 'STAFF', 'SPEAKER', 'ATTENDEE', 'SPONSOR'], 
    default: 'ATTENDEE' 
  },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  phone: String,
  avatar: String,
  bio: String, // Added for speakers
  savedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true }));
