import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const eventTelemetrySchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['ROOM_OCCUPANCY', 'CHECK_IN_RATE', 'SESSION_DEMAND', 'SPONSOR_ENGAGEMENT', 'SIMULATION_STEP'] 
  },
  source: { type: String, default: 'SYSTEM' },
  value: { type: Schema.Types.Mixed, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

eventTelemetrySchema.index({ event: 1, type: 1, timestamp: -1 });

export const EventTelemetry = model('EventTelemetry', eventTelemetrySchema);
