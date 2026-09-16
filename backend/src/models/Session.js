import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const Session = model('Session', new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  speakers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  room: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  capacity: { type: Number, min: 1, required: true },
  category: String,
  tags: [String]
}, { timestamps: true }));
