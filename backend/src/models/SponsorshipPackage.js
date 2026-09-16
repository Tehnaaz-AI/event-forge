import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const SponsorshipPackage = model('SponsorshipPackage', new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  benefits: [String],
  availableSpots: { type: Number, default: 0 }
}, { timestamps: true }));
