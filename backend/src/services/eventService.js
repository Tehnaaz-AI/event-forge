import { Event, Session, TicketCategory, Registration, Ticket, Announcement, User, EventStaff } from '../models/index.js';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
export const getEvents = async (req, res) => {
  const q = req.query.q ? { title: { $regex: req.query.q, $options: 'i' } } : {};
  return await Event.find(q).populate('organization', 'name').sort({ startDate: 1 });
};

export const getOrganizerEvents = async (req, res) => {
  return await Event.find({ organization: req.user.organization }).sort({ startDate: -1 });
};

export const getEventById = async (req, res) => {
  return await Event.findById(req.params.id).populate('organizer', 'name').populate('organization', 'name');
};

export const getPublicEvent = async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug, status: { $in: ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE', 'COMPLETED'] } })
    .populate('organization', 'name')
    .lean();
  
  if (!event) throw new Error('Event not found or not published');

  const [sessions, ticketCategories, sponsors] = await Promise.all([
    Session.find({ event: event._id }).populate('speakers', 'name bio avatar').sort({ startTime: 1 }).lean(),
    TicketCategory.find({ event: event._id }).lean(),
    mongoose.model('Sponsor').find({ event: event._id, status: 'ACTIVE' }).populate('package', 'name').lean() // we'll use Sponsor model directly here
  ]);

  return { ...event, sessions, ticketCategories, sponsors };
};

export const createEvent = async (req, res) => {
  const v = req.body; // Assuming validation happened in middleware/controller
  const slug = `${v.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
  return await Event.create({ ...v, slug, organization: req.user.organization, organizer: req.user._id });
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
  const existing = await Registration.findOne({
    event: req.params.eventId, 
    attendee: req.user._id, 
    registrationStatus: { $ne: 'CANCELLED' }
  });
  if (existing) throw new Error('You already have an active registration for this event');
  
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new Error('Event not found');

  const category = await TicketCategory.findOneAndUpdate(
    { _id: req.body.ticketCategory, event: req.params.eventId, availableQuantity: { $gt: 0 } },
    { $inc: { availableQuantity: -1 } },
    { new: true }
  );
  
  const status = category ? 'CONFIRMED' : (event.registrationSettings?.waitlistEnabled ? 'WAITLISTED' : null);
  if (!status) throw new Error('This ticket category is currently sold out');
  
  let finalAmount = category?.price || 0;
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

  const registration = await Registration.create({
    event: event._id,
    attendee: req.user._id,
    ticketCategory: req.body.ticketCategory,
    registrationStatus: status,
    amount: finalAmount
  });
  
  let ticket = null;
  if (category) {
    const ticketNumber = `EF-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const qrCode = await QRCode.toDataURL(JSON.stringify({ 
      registration: String(registration._id), 
      ticketNumber,
      attendee: req.user.name || req.user.email,
      event: event.title
    }));
    ticket = await Ticket.create({ 
      registration: registration._id, 
      ticketNumber, 
      qrCode,
      status: 'ACTIVE'
    });
  }
  
  return { registration, ticket };
};

export const checkInTicket = async (req, res) => {
  const ticket = await Ticket.findOne({ ticketNumber: req.body.ticketNumber }).populate('registration');
  if (!ticket || String(ticket.registration.event) !== String(req.event._id)) throw new Error('Invalid ticket for this event');
  if (ticket.status !== 'ACTIVE') throw new Error('Ticket is not active');
  if (ticket.checkedInAt) throw new Error('This ticket has already been checked in');
  
  ticket.checkedInAt = new Date();
  return await ticket.save();
};

export const createAnnouncement = async (req, res) => {
  return await Announcement.create({ ...req.body, event: req.event._id, createdBy: req.user._id, sentAt: new Date() });
};

export const getAnalytics = async (req, res) => {
  const [registrations, confirmed, checkedIn, sessions] = await Promise.all([
    Registration.countDocuments({ event: req.event._id }),
    Registration.countDocuments({ event: req.event._id, registrationStatus: 'CONFIRMED' }),
    Ticket.countDocuments({
      registration: { $in: await Registration.find({ event: req.event._id }).distinct('_id') },
      checkedInAt: { $ne: null }
    }),
    Session.find({ event: req.event._id })
  ]);
  return { registrations, confirmed, checkedIn, attendanceRate: confirmed ? Math.round(checkedIn / confirmed * 100) : 0, sessions: sessions.length };
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
  const { ticketNumber } = req.body;
  if (!ticketNumber) throw new Error('Ticket number is required');

  const ticket = await Ticket.findOne({ ticketNumber: ticketNumber.trim().toUpperCase() }).populate({
    path: 'registration',
    populate: [{ path: 'event' }, { path: 'attendee', select: 'name email' }, { path: 'ticketCategory' }]
  });

  if (!ticket) throw new Error('Ticket not found. Check the ticket code.');
  if (ticket.status !== 'ACTIVE') throw new Error('This ticket is not active');
  if (ticket.checkedInAt) throw new Error(`Already checked in on ${new Date(ticket.checkedInAt).toLocaleTimeString()}`);

  ticket.checkedInAt = new Date();
  await ticket.save();
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
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password || 'StaffPass123!',
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


