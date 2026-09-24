import { Event, Session, TicketCategory, Registration, Ticket, Announcement, User, EventStaff, Organization } from '../models/index.js';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { eventBus } from '../realtime/eventBus.js';

export const getEvents = async (req, res) => {
  const q = req.query.q ? { title: { $regex: req.query.q, $options: 'i' } } : {};
  return await Event.find(q).populate('organization', 'name').sort({ startDate: 1 });
};

export const getOrganizerEvents = async (req, res) => {
  // If Platform Admin, return all events across the platform
  if (req.user.role === 'PLATFORM_ADMIN') {
    return await Event.find().populate('organization', 'name').sort({ startDate: -1 });
  }

  // If user has organization, return organization's events
  if (req.user.organization) {
    return await Event.find({ organization: req.user.organization }).populate('organization', 'name').sort({ startDate: -1 });
  }

  // Otherwise return events created by this organizer
  return await Event.find({ organizer: req.user._id }).populate('organization', 'name').sort({ startDate: -1 });
};

export const getEventById = async (req, res) => {
  return await Event.findById(req.params.id).populate('organizer', 'name').populate('organization', 'name');
};

export const getPublicEvent = async (req, res) => {
  const queryParam = req.params.slug;
  const isObjId = mongoose.isValidObjectId(queryParam);

  let event = await Event.findOne({
    $or: [
      { slug: queryParam },
      ...(isObjId ? [{ _id: queryParam }] : [])
    ]
  }).populate('organization', 'name').lean();

  if (!event) {
    event = await Event.findOne({
      slug: { $regex: new RegExp(`^${queryParam}$`, 'i') }
    }).populate('organization', 'name').lean();
  }

  if (!event) throw new Error('Event not found or not published');

  let [sessions, ticketCategories, sponsors] = await Promise.all([
    Session.find({ event: event._id }).populate('speakers', 'name bio avatar').sort({ startTime: 1 }).lean(),
    TicketCategory.find({ event: event._id }).lean(),
    mongoose.model('Sponsor').find({ event: event._id, status: 'ACTIVE' }).populate('package', 'name').lean()
  ]);

  // If no ticket categories exist yet, automatically provision standard and VIP tiers
  if (!ticketCategories || ticketCategories.length === 0) {
    const defaultTiers = await TicketCategory.insertMany([
      {
        event: event._id,
        name: 'General Admission Delegate Pass',
        description: 'Full 3-day access to keynotes, breakouts, and exhibition hall.',
        price: 299,
        capacity: event.capacity || 500,
        availableQuantity: (event.capacity || 500) - 5
      },
      {
        event: event._id,
        name: 'Executive VIP All-Access Pass',
        description: 'VIP lounge access, speaker dinner, and priority front-row seating.',
        price: 699,
        capacity: 100,
        availableQuantity: 92
      }
    ]);
    ticketCategories = defaultTiers.map(t => t.toObject ? t.toObject() : t);
  }

  return { ...event, sessions, ticketCategories, sponsors };
};

export const createEvent = async (req, res) => {
  const v = req.body;
  const slug = `${v.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
  
  let organizationId = req.user.organization || v.organization;
  if (!organizationId) {
    // Find or auto-provision default organization for this user
    let defaultOrg = await Organization.findOne({ contactEmail: req.user.email });
    if (!defaultOrg) {
      defaultOrg = await Organization.create({
        name: `${req.user.name}'s Enterprise` || 'EventForge Global Enterprise',
        contactEmail: req.user.email,
        industry: 'Conferences & Events',
        subscriptionPlan: 'Enterprise VIP',
        subscriptionStatus: 'ACTIVE'
      });
    }
    organizationId = defaultOrg._id;
    req.user.organization = defaultOrg._id;
    await req.user.save();
  }

  const event = await Event.create({ 
    ...v, 
    slug, 
    organization: organizationId, 
    organizer: req.user._id 
  });
  
  // Auto-provision initial ticket categories
  await TicketCategory.insertMany([
    {
      event: event._id,
      name: 'General Admission Pass',
      description: 'Full conference access, keynotes, masterclasses, and networking.',
      price: 299,
      capacity: v.capacity || 500,
      availableQuantity: v.capacity || 500
    },
    {
      event: event._id,
      name: 'Executive VIP Pass',
      description: 'Fast-track entrance, VIP lounge, and private speaker reception.',
      price: 699,
      capacity: 100,
      availableQuantity: 100
    }
  ]);

  return event;
};

export const updateEvent = async (req, res) => {
  const fields = ['title', 'description', 'eventType', 'category', 'startDate', 'endDate', 'capacity', 'venue', 'tags', 'status'];
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      req.event[field] = req.body[field];
    }
  });

  if (req.body.waitlistEnabled !== undefined) {
    req.event.registrationSettings = {
      ...req.event.registrationSettings,
      waitlistEnabled: req.body.waitlistEnabled
    };
  }

  return await req.event.save();
};

export const updateEventStatus = async (req, res) => {
  const flow = {
    DRAFT: ['PUBLISHED'], PUBLISHED: ['REGISTRATION_OPEN', 'ARCHIVED'],
    REGISTRATION_OPEN: ['REGISTRATION_CLOSED'], REGISTRATION_CLOSED: ['LIVE'],
    LIVE: ['COMPLETED'], COMPLETED: ['ARCHIVED'], ARCHIVED: []
  };
  const status = req.body.status;
  if (!flow[req.event.status].includes(status)) throw new Error(`Invalid transition from ${req.event.status} to ${status}`);
  req.event.status = status;
  return await req.event.save();
};

export const deleteEvent = async (req, res) => {
  const eventId = req.event._id;
  await Promise.all([
    Session.deleteMany({ event: eventId }),
    TicketCategory.deleteMany({ event: eventId }),
    Registration.deleteMany({ event: eventId }),
    Ticket.deleteMany({ event: eventId }),
    Announcement.deleteMany({ event: eventId }),
    mongoose.model('Sponsor').deleteMany({ event: eventId }),
    mongoose.model('Feedback').deleteMany({ event: eventId }),
    Event.findByIdAndDelete(eventId)
  ]);
  return { success: true, deletedEventId: eventId };
};

export const createSession = async (req, res) => {
  const v = req.body;
  if (v.endTime <= v.startTime) throw new Error('Session end time must be after start time');
  const overlap = { event: req.event._id, startTime: { $lt: v.endTime }, endTime: { $gt: v.startTime } };
  
  if (await Session.exists({ ...overlap, room: v.room })) throw new Error('Room conflict: another session overlaps in this room');
  if (v.speakers?.length && await Session.exists({ ...overlap, speakers: { $in: v.speakers } })) throw new Error('Speaker conflict: assigned speaker is unavailable');
  
  return await Session.create({ ...v, event: req.event._id });
};

export const getSessions = async (req, res) => {
  return await Session.find({ event: req.params.eventId }).populate('speakers', 'name').sort({ startTime: 1 });
};

export const createTicketCategory = async (req, res) => {
  return await TicketCategory.create({ ...req.body, event: req.event._id, availableQuantity: req.body.capacity });
};

export const getTicketCategories = async (req, res) => {
  return await TicketCategory.find({ event: req.params.eventId });
};

export const updateTicketCategory = async (req, res) => {
  const { categoryId } = req.params;
  const cat = await TicketCategory.findOne({ _id: categoryId, event: req.event._id });
  if (!cat) throw new Error('Ticket category not found');
  
  if (req.body.name) cat.name = req.body.name;
  if (req.body.description !== undefined) cat.description = req.body.description;
  if (req.body.price !== undefined) cat.price = Number(req.body.price);
  if (req.body.capacity !== undefined) {
    const diff = Number(req.body.capacity) - cat.capacity;
    cat.capacity = Number(req.body.capacity);
    cat.availableQuantity = Math.max(0, (cat.availableQuantity || 0) + diff);
  }
  return await cat.save();
};

export const deleteTicketCategory = async (req, res) => {
  const { categoryId } = req.params;
  const deleted = await TicketCategory.findOneAndDelete({ _id: categoryId, event: req.event._id });
  if (!deleted) throw new Error('Ticket category not found');
  return deleted;
};

export const registerAttendee = async (req, res) => {
  const eventId = req.params.eventId;
  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');

  // Enforce Event Lifecycle
  const allowedStatuses = ['REGISTRATION_OPEN', 'PUBLISHED', 'LIVE'];
  if (!allowedStatuses.includes(event.status)) {
    throw new Error(`Registration is not permitted. Current event status is "${event.status}"`);
  }

  const existing = await Registration.findOne({
    event: eventId, 
    attendee: req.user._id, 
    registrationStatus: { $ne: 'CANCELLED' }
  });
  if (existing) throw new Error('You already have an active registration for this event');
  
  let targetCategoryId = req.body.ticketCategory;
  if (!targetCategoryId || !mongoose.Types.ObjectId.isValid(targetCategoryId)) {
    // Find first active category for event or create default
    let defaultCat = await TicketCategory.findOne({ event: eventId });
    if (!defaultCat) {
      defaultCat = await TicketCategory.create({
        event: event._id,
        name: 'General Admission Pass',
        description: 'Standard conference admission pass.',
        price: 299,
        capacity: event.capacity || 500,
        availableQuantity: event.capacity || 500
      });
    }
    targetCategoryId = defaultCat._id;
  }

  // Validate category belongs to this event
  const categoryCheck = await TicketCategory.findOne({ _id: targetCategoryId, event: eventId });
  if (!categoryCheck) {
    throw new Error('Selected ticket category does not belong to this event');
  }

  // Check sale dates
  const now = new Date();
  if (categoryCheck.saleStart && now < new Date(categoryCheck.saleStart)) {
    throw new Error('Ticket sales for this category have not opened yet');
  }
  if (categoryCheck.saleEnd && now > new Date(categoryCheck.saleEnd)) {
    throw new Error('Ticket sales for this category have ended');
  }

  // Atomic reservation
  let category = await TicketCategory.findOneAndUpdate(
    { _id: targetCategoryId, event: eventId, availableQuantity: { $gt: 0 } },
    { $inc: { availableQuantity: -1 } },
    { new: true }
  );

  let finalAmount = categoryCheck.price || 0;
  const code = (req.body.couponCode || '').trim().toUpperCase();
  if (code === 'SAVE20') {
    finalAmount = Math.round(finalAmount * 0.8);
  } else if (code === 'EARLYBIRD') {
    finalAmount = Math.round(finalAmount * 0.85);
  } else if (code === 'WELCOME10') {
    finalAmount = Math.round(finalAmount * 0.9);
  } else if (code === 'VIP50') {
    finalAmount = Math.max(0, finalAmount - 50);
  }

  // Determine VIP / Priority status (Server-authoritative: Only genuine VIP ticket tiers grant VIP status)
  const isVIPTier = (categoryCheck.name || '').toLowerCase().includes('vip') ||
                    (categoryCheck.name || '').toLowerCase().includes('executive');
  const priorityScore = isVIPTier ? 10 : 0;

  // If sold out, handle waitlist with deterministic priority positioning
  if (!category) {
    if (!event.registrationSettings?.waitlistEnabled) {
      throw new Error('This ticket category is currently sold out and waitlist is disabled');
    }

    const waitlistCount = await Registration.countDocuments({
      event: event._id,
      ticketCategory: targetCategoryId,
      registrationStatus: 'WAITLISTED'
    });
    const waitlistPosition = waitlistCount + 1;

    const registration = await Registration.create({
      event: event._id,
      attendee: req.user._id,
      ticketCategory: targetCategoryId,
      registrationStatus: 'WAITLISTED',
      isVIP: isVIPTier,
      priorityScore,
      waitlistPosition,
      amount: finalAmount
    });

    return { 
      registration, 
      ticket: null, 
      waitlisted: true, 
      isVIP: isVIPTier,
      priorityScore,
      position: waitlistPosition 
    };
  }

  // Confirmed registration with safe ticket generation
  let registration;
  try {
    registration = await Registration.create({
      event: event._id,
      attendee: req.user._id,
      ticketCategory: targetCategoryId,
      registrationStatus: 'CONFIRMED',
      isVIP: isVIPTier,
      priorityScore,
      amount: finalAmount
    });

    const ticketNumber = `EF-${isVIPTier ? 'VIP-' : ''}${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const qrCode = await QRCode.toDataURL(JSON.stringify({ 
      registration: String(registration._id), 
      ticketNumber,
      attendee: req.user.name || req.user.email,
      event: event.title
    }));

    const ticket = await Ticket.create({ 
      registration: registration._id, 
      ticketNumber, 
      qrCode,
      status: 'ACTIVE'
    });

    return { registration, ticket, waitlisted: false, isVIP: isVIPTier };
  } catch (err) {
    // Rollback inventory on creation failure
    await TicketCategory.findByIdAndUpdate(targetCategoryId, { $inc: { availableQuantity: 1 } });
    if (registration?._id) await Registration.findByIdAndDelete(registration._id);
    throw err;
  }
};

// Waitlist Auto-Promotion Engine & Ticket Cancellation
export const cancelRegistration = async (req, res) => {
  const { registrationId } = req.params;
  const registration = await Registration.findById(registrationId);
  if (!registration) throw new Error('Registration not found');

  // Verify authorization (Must be the attendee themselves or event organizer/platform admin)
  const isAttendee = String(registration.attendee) === String(req.user._id);
  const isOrganizer = req.user.role === 'PLATFORM_ADMIN' || 
    (req.event && String(req.event.organizer) === String(req.user._id)) ||
    (req.event && req.user.organization && String(req.event.organization) === String(req.user.organization));

  if (!isAttendee && !isOrganizer) {
    throw new Error('Not authorized to cancel this registration');
  }

  if (registration.registrationStatus === 'CANCELLED') {
    return { success: true, message: 'Registration is already cancelled' };
  }

  const previousStatus = registration.registrationStatus;
  registration.registrationStatus = 'CANCELLED';
  registration.cancelledAt = new Date();
  registration.waitlistPosition = null;
  await registration.save();

  // Cancel associated ticket
  const ticket = await Ticket.findOneAndUpdate(
    { registration: registration._id },
    { status: 'CANCELLED' },
    { new: true }
  );

  let promotedRegistration = null;

  // If previous registration was CONFIRMED, free inventory and promote highest priority / oldest waitlisted attendee
  if (previousStatus === 'CONFIRMED') {
    // 1. Restore 1 seat
    await TicketCategory.findByIdAndUpdate(registration.ticketCategory, { $inc: { availableQuantity: 1 } });

    // 2. Find highest priority, oldest eligible waitlisted attendee (Deterministic: VIP > Standard, then FIFO)
    const oldestWaitlisted = await Registration.findOne({
      event: registration.event,
      ticketCategory: registration.ticketCategory,
      registrationStatus: 'WAITLISTED'
    }).sort({ isVIP: -1, priorityScore: -1, createdAt: 1 });

    if (oldestWaitlisted) {
      // 3. Atomically consume the seat
      const reserved = await TicketCategory.findOneAndUpdate(
        { _id: registration.ticketCategory, availableQuantity: { $gt: 0 } },
        { $inc: { availableQuantity: -1 } },
        { new: true }
      );

      if (reserved) {
        // 4. Promote waitlisted attendee
        oldestWaitlisted.registrationStatus = 'CONFIRMED';
        oldestWaitlisted.promotedAt = new Date();
        oldestWaitlisted.waitlistPosition = null;
        await oldestWaitlisted.save();

        // 5. Generate badge ticket
        const ticketNumber = `EF-${oldestWaitlisted.isVIP ? 'VIP-' : ''}PROMO-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const event = await Event.findById(registration.event);
        const qrCode = await QRCode.toDataURL(JSON.stringify({
          registration: String(oldestWaitlisted._id),
          ticketNumber,
          attendee: String(oldestWaitlisted.attendee),
          event: event?.title || 'EventForge'
        }));

        await Ticket.create({
          registration: oldestWaitlisted._id,
          ticketNumber,
          qrCode,
          status: 'ACTIVE'
        });

        // 6. Send announcement / alert
        await Announcement.create({
          event: registration.event,
          title: 'Waitlist Promotion',
          content: `A confirmed seat has opened up and registration has been automatically promoted.`,
          type: 'INFO',
          createdBy: req.user._id,
          sentAt: new Date()
        }).catch(() => {});

        // 7. Update remaining waitlist positions
        const remaining = await Registration.find({
          event: registration.event,
          ticketCategory: registration.ticketCategory,
          registrationStatus: 'WAITLISTED'
        }).sort({ isVIP: -1, priorityScore: -1, createdAt: 1 });

        for (let i = 0; i < remaining.length; i++) {
          remaining[i].waitlistPosition = i + 1;
          await remaining[i].save();
        }

        promotedRegistration = oldestWaitlisted;
      }
    }
  }

  return {
    success: true,
    cancelledRegistrationId: registration._id,
    promotedAttendee: promotedRegistration ? promotedRegistration.attendee : null
  };
};

// 📋 All Event Registrations & Registered Delegates Directory
export const getEventRegistrations = async (req, res) => {
  const registrations = await Registration.find({ event: req.event._id })
    .populate('attendee', 'name email role avatar phone')
    .populate('ticketCategory', 'name price capacity availableQuantity')
    .sort({ createdAt: -1 })
    .lean();

  const regIds = registrations.map(r => r._id);
  const tickets = await Ticket.find({ registration: { $in: regIds } }).lean();
  const ticketMap = new Map();
  tickets.forEach(t => ticketMap.set(String(t.registration), t));

  return registrations.map(r => ({
    ...r,
    ticket: ticketMap.get(String(r._id)) || null
  }));
};

// 👑 VIP & Priority Waitlist Management Endpoints
export const getEventWaitlist = async (req, res) => {
  const registrations = await Registration.find({
    event: req.event._id,
    registrationStatus: 'WAITLISTED'
  })
    .populate('attendee', 'name email role avatar phone')
    .populate('ticketCategory', 'name price capacity availableQuantity')
    .sort({ isVIP: -1, priorityScore: -1, createdAt: 1 })
    .lean();

  return registrations.map((r, idx) => ({
    ...r,
    queueIndex: idx + 1
  }));
};

export const promoteWaitlistedAttendee = async (req, res) => {
  const { registrationId } = req.params;
  const registration = await Registration.findOne({
    _id: registrationId,
    event: req.event._id,
    registrationStatus: 'WAITLISTED'
  }).populate('attendee', 'name email').populate('ticketCategory');

  if (!registration) throw new Error('Waitlisted registration not found');

  // Atomically claim 1 seat from ticket category if available
  const category = await TicketCategory.findOneAndUpdate(
    { _id: registration.ticketCategory._id, availableQuantity: { $gt: 0 } },
    { $inc: { availableQuantity: -1 } },
    { new: true }
  );

  if (!category && !req.body.overrideCapacity) {
    throw new Error('No available seats remaining in this ticket category. Enable capacity override to proceed.');
  }

  if (!category && req.body.overrideCapacity) {
    await TicketCategory.findByIdAndUpdate(registration.ticketCategory._id, {
      $inc: { capacity: 1 }
    });
  }

  registration.registrationStatus = 'CONFIRMED';
  registration.promotedAt = new Date();
  registration.waitlistPosition = null;
  await registration.save();

  const ticketNumber = `EF-${registration.isVIP ? 'VIP-' : ''}PROMO-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const qrCode = await QRCode.toDataURL(JSON.stringify({
    registration: String(registration._id),
    ticketNumber,
    attendee: registration.attendee?.name || registration.attendee?.email,
    event: req.event.title
  }));

  const ticket = await Ticket.create({
    registration: registration._id,
    ticketNumber,
    qrCode,
    status: 'ACTIVE'
  });

  // Re-index remaining waitlist positions
  const remaining = await Registration.find({
    event: req.event._id,
    ticketCategory: registration.ticketCategory._id,
    registrationStatus: 'WAITLISTED'
  }).sort({ isVIP: -1, priorityScore: -1, createdAt: 1 });

  for (let i = 0; i < remaining.length; i++) {
    remaining[i].waitlistPosition = i + 1;
    await remaining[i].save();
  }

  return { success: true, registration, ticket };
};

export const updateWaitlistPriority = async (req, res) => {
  const { registrationId } = req.params;
  const { isVIP, priorityScore } = req.body;

  const registration = await Registration.findOne({
    _id: registrationId,
    event: req.event._id,
    registrationStatus: 'WAITLISTED'
  });

  if (!registration) throw new Error('Waitlisted registration not found');

  if (isVIP !== undefined) registration.isVIP = Boolean(isVIP);
  if (priorityScore !== undefined) registration.priorityScore = Number(priorityScore);
  await registration.save();

  // Re-calculate queue positions deterministically
  const waitlist = await Registration.find({
    event: req.event._id,
    ticketCategory: registration.ticketCategory,
    registrationStatus: 'WAITLISTED'
  }).sort({ isVIP: -1, priorityScore: -1, createdAt: 1 });

  for (let i = 0; i < waitlist.length; i++) {
    waitlist[i].waitlistPosition = i + 1;
    await waitlist[i].save();
  }

  return { success: true, registration };
};

export const getMyWaitlist = async (req, res) => {
  const waitlisted = await Registration.find({
    attendee: req.user._id,
    registrationStatus: 'WAITLISTED'
  })
    .populate({ path: 'event', populate: { path: 'organization', select: 'name' } })
    .populate('ticketCategory')
    .sort({ createdAt: -1 })
    .lean();

  return waitlisted;
};

// Helper to extract clean ticket number or registration ID from any QR payload
function extractTicketQuery(input) {
  if (!input) return null;
  let raw = String(input).trim();

  // 1. Check if JSON payload (e.g. from QRCode.toDataURL)
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.ticketNumber) return { ticketNumber: parsed.ticketNumber.trim().toUpperCase() };
      if (parsed.registration && mongoose.Types.ObjectId.isValid(parsed.registration)) {
        return { registration: parsed.registration };
      }
    } catch (e) {}
  }

  // 2. Check if EVENTFORGE:eventId:regId:ticketNum format
  if (raw.includes(':')) {
    const parts = raw.split(':').map(p => p.trim()).filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (lastPart.startsWith('EF-') || lastPart.length >= 6) {
      return { ticketNumber: lastPart.toUpperCase() };
    }
    for (const part of parts) {
      if (mongoose.Types.ObjectId.isValid(part)) {
        return { $or: [{ ticketNumber: raw.toUpperCase() }, { registration: part }] };
      }
    }
  }

  // 3. Direct ticket number (e.g. EF-2026-AI-...)
  return { ticketNumber: raw.toUpperCase() };
}

export const checkInTicket = async (req, res) => {
  const query = extractTicketQuery(req.body.ticketNumber || req.body.code);
  if (!query) throw new Error('Valid ticket code or QR payload is required');

  const ticket = await Ticket.findOne(query).populate('registration');
  if (!ticket || String(ticket.registration.event) !== String(req.event._id)) throw new Error('Invalid ticket for this event');
  if (ticket.status !== 'ACTIVE') throw new Error('Ticket is not active or has been cancelled');
  if (ticket.checkedInAt) throw new Error(`Already checked in on ${new Date(ticket.checkedInAt).toLocaleTimeString()}`);
  
  ticket.checkedInAt = new Date();
  await ticket.save();

  // Broadcast real-time check-in to organizer dashboards
  eventBus.broadcast(String(req.event._id), 'ATTENDEE_CHECKED_IN', {
    ticketNumber: ticket.ticketNumber,
    checkedInAt: ticket.checkedInAt
  });

  return ticket;
};

export const createAnnouncement = async (req, res) => {
  const ann = await Announcement.create({ ...req.body, event: req.event._id, createdBy: req.user._id, sentAt: new Date() });
  
  // Broadcast real-time announcement
  eventBus.broadcast(String(req.event._id), 'ANNOUNCEMENT_CREATED', {
    id: ann._id,
    title: ann.title,
    message: ann.message,
    type: ann.type,
    sentAt: ann.sentAt
  });

  return ann;
};

export const getAnalytics = async (req, res) => {
  const [registrations, confirmed, waitlisted, checkedIn, sessions] = await Promise.all([
    Registration.countDocuments({ event: req.event._id }),
    Registration.countDocuments({ event: req.event._id, registrationStatus: 'CONFIRMED' }),
    Registration.countDocuments({ event: req.event._id, registrationStatus: 'WAITLISTED' }),
    Ticket.countDocuments({
      registration: { $in: await Registration.find({ event: req.event._id }).distinct('_id') },
      checkedInAt: { $ne: null }
    }),
    Session.find({ event: req.event._id })
  ]);
  return { 
    registrations, 
    confirmed, 
    waitlisted,
    checkedIn, 
    attendanceRate: confirmed ? Math.round(checkedIn / confirmed * 100) : 0, 
    sessions: sessions.length 
  };
};

export const getMyTickets = async (req, res) => {
  const registrations = await Registration.find({ attendee: req.user._id })
    .populate({ path: 'event', populate: { path: 'organization', select: 'name' } })
    .populate('ticketCategory')
    .sort({ createdAt: -1 })
    .lean();

  const regIds = registrations.map(r => r._id);
  const tickets = await Ticket.find({ registration: { $in: regIds } }).lean();

  const ticketMap = {};
  tickets.forEach(t => {
    ticketMap[String(t.registration)] = t;
  });

  return registrations.map(r => ({
    ...r,
    ticket: ticketMap[String(r._id)] || null
  }));
};

export const checkInAnyTicket = async (req, res) => {
  const rawInput = req.body.ticketNumber || req.body.code || req.body.qrData;
  if (!rawInput) throw new Error('Ticket number or scanned QR data is required');

  const query = extractTicketQuery(rawInput);
  if (!query) throw new Error('Invalid QR format or ticket number');

  const ticket = await Ticket.findOne(query).populate({
    path: 'registration',
    populate: [
      { path: 'event', select: 'title startDate endDate venue organization' },
      { path: 'attendee', select: 'name email role phone avatar' },
      { path: 'ticketCategory', select: 'name price description' }
    ]
  });

  if (!ticket) throw new Error('Ticket not found in platform records. Check the code or scan again.');
  if (ticket.status !== 'ACTIVE') throw new Error('This ticket has been cancelled or deactivated');
  if (ticket.checkedInAt) {
    throw new Error(`Duplicate Badge Warning: Already checked in at ${new Date(ticket.checkedInAt).toLocaleTimeString()}`);
  }

  ticket.checkedInAt = new Date();
  await ticket.save();

  // Broadcast real-time check-in
  if (ticket.registration?.event?._id) {
    eventBus.broadcast(String(ticket.registration.event._id), 'ATTENDEE_CHECKED_IN', {
      ticketNumber: ticket.ticketNumber,
      attendee: ticket.registration?.attendee?.name,
      checkedInAt: ticket.checkedInAt
    });
  }

  return ticket;
};

export const getEventStaff = async (req, res) => {
  const staff = await EventStaff.find({ event: req.event._id })
    .populate('user', 'name email avatar phone role status')
    .sort({ createdAt: -1 });
  return staff;
};

export const addEventStaff = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!email || !name) throw new Error('Name and email are required');

  let user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const rawPassword = password || crypto.randomBytes(16).toString('base64url') + '!A1';
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: await bcrypt.hash(rawPassword, 12),
      role: 'STAFF',
      phone: phone || '',
      organization: req.event.organization || req.user.organization
    });
  } else {
    // If existing user was attendee, upgrade to staff so they can access staff mode
    if (user.role === 'ATTENDEE') {
      user.role = 'STAFF';
      await user.save();
    }
  }

  // Check if staff assignment already exists
  let eventStaff = await EventStaff.findOne({ event: req.event._id, user: user._id });
  if (!eventStaff) {
    eventStaff = await EventStaff.create({
      event: req.event._id,
      user: user._id,
      role: role || 'CHECK_IN'
    });
  } else if (role && eventStaff.role !== role) {
    eventStaff.role = role;
    await eventStaff.save();
  }

  await eventStaff.populate('user', 'name email avatar phone role status');
  return eventStaff;
};

export const removeEventStaff = async (req, res) => {
  const { staffId } = req.params;
  const deleted = await EventStaff.findOneAndDelete({ _id: staffId, event: req.event._id });
  if (!deleted) throw new Error('Staff assignment not found');
  return { message: 'Staff member removed from this event' };
};


