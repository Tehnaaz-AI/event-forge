import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const registrationSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  attendee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ticketCategory: { type: Schema.Types.ObjectId, ref: 'TicketCategory', required: true },
  registrationStatus: { 
    type: String, 
    enum: ['CONFIRMED', 'WAITLISTED', 'CANCELLED'], 
    default: 'CONFIRMED' 
  },
  amount: Number
}, { timestamps: true });

registrationSchema.index({ event: 1, attendee: 1 }, { 
  unique: true, 
  partialFilterExpression: { registrationStatus: { $ne: 'CANCELLED' } } 
});

export const Registration = model('Registration', registrationSchema);
