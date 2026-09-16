import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const Ticket = model('Ticket', new Schema({
  registration: { type: Schema.Types.ObjectId, ref: 'Registration', required: true, unique: true },
  ticketNumber: { type: String, required: true, unique: true },
  qrCode: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'CANCELLED'], default: 'ACTIVE' },
  checkedInAt: Date
}, { timestamps: true }));
