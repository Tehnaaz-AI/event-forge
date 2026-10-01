import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ticketSchema = new Schema({
  registration: { type: Schema.Types.ObjectId, ref: 'Registration', required: true, unique: true },
  ticketNumber: { type: String, required: true, unique: true },
  qrCode: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'CANCELLED'], default: 'ACTIVE' },
  checkedInAt: { type: Date, default: null, index: true }
}, { timestamps: true });

export const Ticket = model('Ticket', ticketSchema);

