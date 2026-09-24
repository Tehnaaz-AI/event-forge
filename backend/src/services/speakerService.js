import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const getSpeakers = async (organizationId, isPlatformAdmin = false) => {
  const filter = isPlatformAdmin ? {} : { organization: organizationId, role: 'SPEAKER' };
  return await User.find(filter).select('-passwordHash').sort({ name: 1 });
};

export const createSpeaker = async (organizationId, speakerData) => {
  if (await User.exists({ email: speakerData.email.toLowerCase().trim() })) {
    throw new Error('Email already registered');
  }

  const rawPassword = speakerData.password || crypto.randomBytes(16).toString('base64url') + '!A1';
  const hash = await bcrypt.hash(rawPassword, 12);
  
  return await User.create({
    ...speakerData,
    email: speakerData.email.toLowerCase().trim(),
    organization: organizationId || null,
    role: 'SPEAKER',
    passwordHash: hash
  });
};

export const updateSpeaker = async (organizationId, speakerId, speakerData, isPlatformAdmin = false) => {
  const filter = isPlatformAdmin ? { _id: speakerId, role: 'SPEAKER' } : { _id: speakerId, organization: organizationId, role: 'SPEAKER' };
  const speaker = await User.findOneAndUpdate(
    filter,
    speakerData,
    { new: true }
  ).select('-passwordHash');
  
  if (!speaker) throw new Error('Speaker not found');
  return speaker;
};

export const deleteSpeaker = async (organizationId, speakerId, isPlatformAdmin = false) => {
  const filter = isPlatformAdmin ? { _id: speakerId, role: 'SPEAKER' } : { _id: speakerId, organization: organizationId, role: 'SPEAKER' };
  const speaker = await User.findOneAndDelete(filter);
  if (!speaker) throw new Error('Speaker not found');
  return speaker;
};
