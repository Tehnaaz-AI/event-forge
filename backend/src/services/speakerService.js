import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

export const getSpeakers = async (organizationId) => {
  const filter = organizationId ? { organization: organizationId, role: 'SPEAKER' } : { role: 'SPEAKER' };
  return await User.find(filter).select('-passwordHash').sort({ name: 1 });
};

export const createSpeaker = async (organizationId, speakerData) => {
  if (await User.exists({ email: speakerData.email.toLowerCase().trim() })) {
    throw new Error('Email already registered');
  }

  const hash = await bcrypt.hash('SpeakerPass123!', 12); // Default password for newly created speakers
  
  return await User.create({
    ...speakerData,
    email: speakerData.email.toLowerCase().trim(),
    organization: organizationId || null,
    role: 'SPEAKER',
    passwordHash: hash
  });
};

export const updateSpeaker = async (organizationId, speakerId, speakerData) => {
  const filter = organizationId ? { _id: speakerId, organization: organizationId, role: 'SPEAKER' } : { _id: speakerId, role: 'SPEAKER' };
  const speaker = await User.findOneAndUpdate(
    filter,
    speakerData,
    { new: true }
  ).select('-passwordHash');
  
  if (!speaker) throw new Error('Speaker not found');
  return speaker;
};

export const deleteSpeaker = async (organizationId, speakerId) => {
  const filter = organizationId ? { _id: speakerId, organization: organizationId, role: 'SPEAKER' } : { _id: speakerId, role: 'SPEAKER' };
  const speaker = await User.findOneAndDelete(filter);
  if (!speaker) throw new Error('Speaker not found');
  return speaker;
};
