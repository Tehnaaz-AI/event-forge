import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Event, EventStaff } from '../models/index.js';

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query?.token;
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

// Strict Event Access Verification
export async function eventAccess(req, res, next) {
  try {
    const eventId = req.params.eventId || req.params.id || req.body.event || req.body.eventId;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // 1. Platform Admin has global access
    if (req.user.role === 'PLATFORM_ADMIN') {
      req.event = event;
      return next();
    }

    // 2. Event Organizer (Owner)
    if (event.organizer && String(event.organizer) === String(req.user._id)) {
      req.event = event;
      return next();
    }

    // 3. Organization Match
    if (event.organization && req.user.organization && String(event.organization) === String(req.user.organization)) {
      req.event = event;
      return next();
    }

    // 4. Assigned Event Staff
    const staffRecord = await EventStaff.findOne({ event: event._id, user: req.user._id });
    if (staffRecord) {
      req.event = event;
      req.eventStaff = staffRecord;
      return next();
    }

    return res.status(403).json({ success: false, message: 'You do not have access to this event' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error verifying event access' });
  }
}

// Explicit middleware aliases and fine-grained guards
export const requireEventAccess = eventAccess;

export async function requireEventOrganizer(req, res, next) {
  return eventAccess(req, res, () => {
    if (
      req.user.role === 'PLATFORM_ADMIN' ||
      (req.event.organizer && String(req.event.organizer) === String(req.user._id)) ||
      (req.event.organization && req.user.organization && String(req.event.organization) === String(req.user.organization) && req.user.role === 'ORGANIZER')
    ) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Organizer privileges required for this event' });
  });
}

export const requireEventStaffRole = (...roles) => async (req, res, next) => {
  return eventAccess(req, res, () => {
    if (
      req.user.role === 'PLATFORM_ADMIN' ||
      (req.event.organizer && String(req.event.organizer) === String(req.user._id)) ||
      (req.event.organization && req.user.organization && String(req.event.organization) === String(req.user.organization))
    ) {
      return next();
    }
    if (req.eventStaff && roles.includes(req.eventStaff.role)) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Insufficient event staff permissions' });
  });
};

export const requireEventRole = (requiredRole) => allowRoles(requiredRole);

