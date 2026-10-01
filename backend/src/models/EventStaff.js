import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const eventStaffSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['CHECK_IN', 'SUPPORT', 'MANAGER'], default: 'CHECK_IN' }
}, { timestamps: true });

eventStaffSchema.index({ event: 1, user: 1 }, { unique: true });

export const EventStaff = model('EventStaff', eventStaffSchema);

