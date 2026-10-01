import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ticketCategorySchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  tier: { 
    type: String, 
    enum: ['STANDARD', 'VIP', 'EXECUTIVE', 'OTHER'], 
    default: 'STANDARD' 
  },
  isVipEligible: { type: Boolean, default: false },
  price: { type: Number, min: 0, required: true },
  capacity: { type: Number, min: 1, required: true },
  availableQuantity: { type: Number, min: 0, required: true },
  saleStart: Date,
  saleEnd: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

ticketCategorySchema.index({ event: 1, name: 1 });

export const TicketCategory = model('TicketCategory', ticketCategorySchema);

