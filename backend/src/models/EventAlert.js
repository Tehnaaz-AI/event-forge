import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const eventAlertSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: ['CAPACITY_RISK', 'ATTENDANCE_GAP', 'SESSION_OVERFLOW', 'SPONSOR_ENGAGEMENT_LOW', 'SCHEDULE_CONFLICT', 'OPERATIONAL_INCIDENT'] 
  },
  severity: { 
    type: String, 
    enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
    default: 'MEDIUM' 
  },
  title: { type: String, required: true },
  evidence: [{ type: String, required: true }],
  recommendedAction: String,
  status: { 
    type: String, 
    enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'], 
    default: 'ACTIVE' 
  },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

eventAlertSchema.index({ event: 1, status: 1, createdAt: -1 });

export const EventAlert = model('EventAlert', eventAlertSchema);
