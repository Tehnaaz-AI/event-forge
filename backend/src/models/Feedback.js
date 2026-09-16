import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const Feedback = model('Feedback', new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  session: { type: Schema.Types.ObjectId, ref: 'Session' },
  attendee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: String
}, { timestamps: true }));
