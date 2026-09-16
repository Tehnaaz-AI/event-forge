import bcrypt from 'bcryptjs';
import { User, Event, Session, TicketCategory, Registration, Ticket, Announcement, Organization } from '../models/index.js';
import mongoose from 'mongoose';

export const getAllUsers = async (filters = {}) => {
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.q) {
    query.$or = [
      { name: { $regex: filters.q, $options: 'i' } },
      { email: { $regex: filters.q, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .populate('organization', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return users;
};

export const createUser = async ({ name, email, password, role = 'ATTENDEE', organization, phone, bio, avatar }) => {
  if (await User.exists({ email })) {
    throw new Error('Email already registered');
  }

  let orgId = organization;
  if (typeof organization === 'string' && organization.length > 0 && !mongoose.Types.ObjectId.isValid(organization)) {
    // If an organization name was provided rather than an ID
    const newOrg = await Organization.create({ name: organization, contactEmail: email });
    orgId = newOrg._id;
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password || 'DemoPass123!', 12),
    role,
    organization: orgId || null,
    phone,
    bio,
    avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
  });

  return await User.findById(user._id).populate('organization');
};

export const updateUser = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) user.email = data.email;
  if (data.role !== undefined) user.role = data.role;
  if (data.status !== undefined) user.status = data.status;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.avatar !== undefined) user.avatar = data.avatar;
  if (data.organization !== undefined) user.organization = data.organization || null;

  if (data.password && data.password.trim().length >= 6) {
    user.passwordHash = await bcrypt.hash(data.password, 12);
  }

  await user.save();
  return await User.findById(userId).populate('organization');
};

export const deleteUser = async (userId, currentAdminId) => {
  if (userId.toString() === currentAdminId.toString()) {
    throw new Error('Cannot delete your own active Platform Administrator account');
  }

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Cascade delete associated tickets and registrations
  const userRegs = await Registration.find({ attendee: userId }).distinct('_id');
  await Promise.all([
    Ticket.deleteMany({ registration: { $in: userRegs } }),
    Registration.deleteMany({ attendee: userId }),
    User.findByIdAndDelete(userId)
  ]);

  return { success: true, deletedUserId: userId };
};

export const getAllEventsPlatformWide = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.q) {
    query.$or = [
      { title: { $regex: filters.q, $options: 'i' } },
      { 'venue.name': { $regex: filters.q, $options: 'i' } }
    ];
  }

  const events = await Event.find(query)
    .populate('organizer', 'name email avatar')
    .populate('organization', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // Attach registration counts and stats
  const eventIds = events.map(e => e._id);
  const registrations = await Registration.aggregate([
    { $match: { event: { $in: eventIds }, registrationStatus: 'CONFIRMED' } },
    { $group: { _id: '$event', count: { $sum: 1 }, totalRevenue: { $sum: { $ifNull: ['$amount', 0] } } } }
  ]);

  const regMap = {};
  registrations.forEach(r => {
    regMap[r._id.toString()] = { count: r.count, revenue: r.totalRevenue };
  });

  return events.map(e => ({
    ...e,
    registrationCount: regMap[e._id.toString()]?.count || 0,
    totalRevenue: regMap[e._id.toString()]?.revenue || 0
  }));
};

export const deleteEventPlatformWide = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');

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

export const getPlatformStats = async () => {
  const [
    totalUsers,
    usersByRole,
    totalEvents,
    publishedEvents,
    totalRegistrations,
    totalOrganizations,
    revenueAgg
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Event.countDocuments(),
    Event.countDocuments({ status: { $in: ['PUBLISHED', 'REGISTRATION_OPEN', 'LIVE'] } }),
    Registration.countDocuments({ registrationStatus: 'CONFIRMED' }),
    Organization.countDocuments(),
    Registration.aggregate([
      { $match: { registrationStatus: 'CONFIRMED' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$amount', 0] } } } }
    ])
  ]);

  const roleCounts = {};
  usersByRole.forEach(r => { roleCounts[r._id] = r.count; });

  return {
    totalUsers,
    roleCounts,
    totalEvents,
    publishedEvents,
    totalRegistrations,
    totalOrganizations,
    totalRevenue: revenueAgg[0]?.total || 0
  };
};

export const getAllInquiries = async () => {
  const { Inquiry } = await import('../models/index.js');
  return await Inquiry.find().sort({ createdAt: -1 }).lean();
};

export const updateInquiryStatus = async (id, status, adminNotes) => {
  const { Inquiry } = await import('../models/index.js');
  const inquiry = await Inquiry.findById(id);
  if (!inquiry) throw new Error('Inquiry not found');
  if (status) inquiry.status = status;
  if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;
  await inquiry.save();
  return inquiry;
};
