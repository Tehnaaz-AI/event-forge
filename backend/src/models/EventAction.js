import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const eventActionSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  recommendation: { type: Schema.Types.ObjectId, ref: 'EventRecommendation' },
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, default: {} },
  result: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
  error: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

eventActionSchema.index({ event: 1, timestamp: -1 });

export const EventAction = model('EventAction', eventActionSchema);
