import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const Coupon = model('Coupon', new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  code: { type: String, required: true, uppercase: true },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  discountValue: { type: Number, required: true },
  maxUses: { type: Number, default: 0 }, // 0 = unlimited
  currentUses: { type: Number, default: 0 },
  validFrom: Date,
  validUntil: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true }));
