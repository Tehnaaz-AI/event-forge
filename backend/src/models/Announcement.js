import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const Announcement = model('Announcement', new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['INFO', 'REMINDER', 'URGENT', 'SCHEDULE_CHANGE'], default: 'INFO' },
  audience: { type: String, default: 'ALL_ATTENDEES' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sentAt: Date
}, { timestamps: true }));
