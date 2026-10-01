import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const sessionSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  speakers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  room: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  capacity: { type: Number, min: 1, required: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'PROPOSED', 'APPROVED', 'PUBLISHED', 'REJECTED'], 
    default: 'PUBLISHED' 
  },
  category: String,
  tags: [String]
}, { timestamps: true });

sessionSchema.index({ event: 1, room: 1, startTime: 1, endTime: 1 });

export const Session = model('Session', sessionSchema);

