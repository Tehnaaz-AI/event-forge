import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const EventStaff = model('EventStaff', new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['CHECK_IN', 'SUPPORT', 'MANAGER'], default: 'CHECK_IN' }
}, { timestamps: true }));
