import { Router } from 'express';
import { Inquiry } from '../models/index.js';

const r = Router();

// POST /api/contact - Submit public contact/support inquiry
r.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const adminRecipient = process.env.ADMIN_EMAIL || 'admin@eventforge.com';

    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'General Inquiry',
      message: message.trim(),
      recipientAdminEmail: adminRecipient,
      status: 'NEW'
    });

    console.log(`📬 [New Inquiry Received] From: ${inquiry.name} <${inquiry.email}> | Subject: "${inquiry.subject}" | Routed to Admin: ${adminRecipient}`);

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been delivered directly to the platform administration.',
      data: {
        ticketId: inquiry._id,
        receivedAt: inquiry.createdAt,
        routedTo: adminRecipient
      }
    });
  } catch (error) {
    next(error);
  }
});

export default r;
