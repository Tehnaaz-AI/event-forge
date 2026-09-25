import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Organization } from '../models/index.js';

export const registerUser = async ({ name, email, password, organizationName, role: requestedRole }) => {
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) throw new Error('Email already registered');
  
  // Authoritative role assignment: Public users cannot register as PLATFORM_ADMIN or STAFF
  let assignedRole = 'ATTENDEE';
  let org = null;

  if (organizationName && organizationName.trim()) {
    org = await Organization.create({ name: organizationName.trim(), contactEmail: normalizedEmail });
    assignedRole = 'ORGANIZER';
  } else if (requestedRole === 'ORGANIZER') {
    // If requested organizer but without explicit organization name, provide default org
    org = await Organization.create({ name: `${name.trim()}'s Organization`, contactEmail: normalizedEmail });
    assignedRole = 'ORGANIZER';
  }
  
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    role: assignedRole,
    organization: org?._id
  });

  const populatedUser = await User.findById(user._id).populate('organization');
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  return { token, user: populatedUser };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash').populate('organization');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('Invalid email or password');
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  user.passwordHash = undefined;
  return { token, user };
};

export const updateOrganization = async (orgId, data) => {
  const org = await Organization.findById(orgId);
  if (!org) throw new Error('Organization not found');
  if (data.name) org.name = data.name;
  if (data.contactEmail) org.contactEmail = data.contactEmail;
  if (data.settings) org.settings = { ...org.settings, ...data.settings };
  return await org.save();
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).populate('organization');
  if (!user) throw new Error('User not found');
  return user;
};

export const updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (data.name) user.name = data.name;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.avatar !== undefined) user.avatar = data.avatar;
  if (data.bio !== undefined) user.bio = data.bio;

  await user.save();
  return await User.findById(userId).populate('organization');
};

export const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw new Error('Current password does not match');

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  return { success: true, message: 'Password updated successfully' };
};

export const getSavedEvents = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'savedEvents',
    populate: { path: 'organization', select: 'name logo' }
  });
  return user?.savedEvents || [];
};

export const toggleSavedEvent = async (userId, eventId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const idStr = eventId.toString();
  const exists = user.savedEvents?.some(id => id.toString() === idStr);
  
  if (exists) {
    user.savedEvents = user.savedEvents.filter(id => id.toString() !== idStr);
  } else {
    user.savedEvents = user.savedEvents || [];
    user.savedEvents.push(eventId);
  }
  
  await user.save();
  return { saved: !exists, savedEvents: user.savedEvents };
};

export const removeSavedEvent = async (userId, eventId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const idStr = eventId.toString();
  user.savedEvents = (user.savedEvents || []).filter(id => id.toString() !== idStr);
  await user.save();
  return { savedEvents: user.savedEvents };
};

