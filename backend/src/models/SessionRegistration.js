import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const sessionRegistrationSchema = new Schema({
  session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  attendee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['REGISTERED', 'ATTENDED', 'CANCELLED'], default: 'REGISTERED' },
  attendedAt: Date
}, { timestamps: true });

sessionRegistrationSchema.index({ session: 1, attendee: 1 }, { unique: true });

export const SessionRegistration = model('SessionRegistration', sessionRegistrationSchema);
