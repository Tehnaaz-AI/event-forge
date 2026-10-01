import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const couponSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  discountValue: { type: Number, required: true },
  maxUses: { type: Number, default: 0 }, // 0 = unlimited
  currentUses: { type: Number, default: 0 },
  validFrom: Date,
  validUntil: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

couponSchema.index({ event: 1, code: 1 }, { unique: true });

export const Coupon = model('Coupon', couponSchema);

