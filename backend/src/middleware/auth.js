import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Event } from '../models/index.js';

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user || req.user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Account unavailable' });
    }
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};

export async function eventAccess(req, res, next) {
  try {
    const eventId = req.params.eventId || req.params.id || req.body.event;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (
      req.user.role === 'PLATFORM_ADMIN' ||
      (event.organizer && String(event.organizer) === String(req.user._id)) ||
      (event.organization && req.user.organization && String(event.organization) === String(req.user.organization)) ||
      (req.user.role === 'ORGANIZER')
    ) {
      req.event = event;
      return next();
    }
    return res.status(403).json({ success: false, message: 'You do not have access to this event' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error verifying event access' });
  }
}
