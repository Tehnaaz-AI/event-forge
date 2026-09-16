import { Announcement, Registration } from '../models/index.js';

export const createAnnouncement = async (eventId, organizerId, data) => {
  const announcement = await Announcement.create({
    title: data.title,
    message: data.message,
    type: data.type || 'INFO',
    audience: data.targetAudience || 'ALL',
    event: eventId,
    createdBy: organizerId,
    sentAt: new Date()
  });

  // Fetch target audience to simulate sending
  let query = { event: eventId };
  if (data.targetAudience === 'CONFIRMED') query.registrationStatus = 'CONFIRMED';
  if (data.targetAudience === 'WAITLISTED') query.registrationStatus = 'WAITLISTED';

  const recipients = await Registration.find(query).populate('attendee', 'name email');

  // Simulate email dispatch
  console.log(`\n=== 📧 SIMULATED EMAIL DISPATCH ===`);
  console.log(`Event ID: ${eventId}`);
  console.log(`Subject: ${data.title}`);
  console.log(`To: ${recipients.length} recipients (${data.targetAudience})`);
  console.log(`Message: ${data.message}`);
  console.log(`==================================\n`);

  return announcement;
};

export const getAnnouncements = async (eventId) => {
  return await Announcement.find({ event: eventId }).sort({ sentAt: -1 }).populate('createdBy', 'name');
};
