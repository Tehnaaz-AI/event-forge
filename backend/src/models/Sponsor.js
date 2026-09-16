import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const Sponsor = model('Sponsor', new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  package: { type: Schema.Types.ObjectId, ref: 'SponsorshipPackage', required: true },
  contactUser: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'CANCELLED'], default: 'PENDING' },
  logo: String,
  website: String
}, { timestamps: true }));
