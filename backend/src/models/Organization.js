import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const Organization = model('Organization', new Schema({
  name: { type: String, required: true, trim: true },
  industry: String,
  contactEmail: String,
  subscriptionPlan: { type: String, default: 'Starter' },
  subscriptionStatus: { type: String, default: 'ACTIVE' },
  settings: { type: Object, default: {} }
}, { timestamps: true }));
