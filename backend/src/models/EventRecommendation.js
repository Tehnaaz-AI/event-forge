import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const eventRecommendationSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  alert: { type: Schema.Types.ObjectId, ref: 'EventAlert' },
  title: { type: String, required: true },
  recommendation: { type: String, required: true },
  evidence: [{ type: String, required: true }],
  reasoning: String,
  status: { 
    type: String, 
    enum: ['PROPOSED', 'APPROVED', 'REJECTED', 'EXECUTED'], 
    default: 'PROPOSED' 
  },
  confidence: { type: String, default: 'heuristic' },
  proposedAction: {
    actionType: { 
      type: String, 
      enum: ['MOVE_SESSION', 'OPEN_OVERFLOW_ROOM', 'BROADCAST_ANNOUNCEMENT', 'REASSIGN_STAFF', 'ADJUST_SESSION_STATUS', 'CUSTOM'],
      required: true 
    },
    payload: { type: Schema.Types.Mixed, default: {} }
  },
  resolutionNotes: String
}, { timestamps: true });

eventRecommendationSchema.index({ event: 1, status: 1, createdAt: -1 });

export const EventRecommendation = model('EventRecommendation', eventRecommendationSchema);
