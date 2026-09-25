import mongoose from 'mongoose';
import { Event, Registration, TicketCategory, Ticket } from '../models/index.js';

export const getEventAnalytics = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');

  const objEventId = new mongoose.Types.ObjectId(eventId);

  const [registrationStats, ticketStats, confirmedRegistrations, timelineAgg] = await Promise.all([
    Registration.aggregate([
      { $match: { event: objEventId } },
      { $group: { _id: '$registrationStatus', count: { $sum: 1 } } }
    ]),
    TicketCategory.find({ event: eventId }).lean(),
    Registration.find({ event: eventId, registrationStatus: 'CONFIRMED' }).select('_id amount createdAt').lean(),
    Registration.aggregate([
      { $match: { event: objEventId, registrationStatus: 'CONFIRMED' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          registrations: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$amount', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const regIds = confirmedRegistrations.map(r => r._id);
  const checkedInCount = regIds.length > 0 
    ? await Ticket.countDocuments({ registration: { $in: regIds }, checkedInAt: { $ne: null } })
    : 0;

  let totalRevenue = 0;
  let totalCapacity = 0;
  let totalAvailable = 0;

  ticketStats.forEach(cat => {
    totalCapacity += (cat.capacity || 0);
    totalAvailable += (cat.availableQuantity || 0);
  });

  // Calculate actual revenue from confirmed registrations
  totalRevenue = confirmedRegistrations.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const totalSold = confirmedRegistrations.length;

  const statusCounts = { CONFIRMED: 0, WAITLISTED: 0, CANCELLED: 0 };
  registrationStats.forEach(stat => {
    statusCounts[stat._id] = stat.count;
  });

  // Construct a continuous 14-day rolling chronological time series for smooth, dynamic telemetry
  const timelineMap = {};
  timelineAgg.forEach(t => {
    timelineMap[t._id] = { registrations: t.registrations || 0, revenue: t.revenue || 0 };
  });

  const timelineData = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const dayData = timelineMap[dateKey] || { registrations: 0, revenue: 0 };
    
    timelineData.push({
      day: label,
      date: dateKey,
      registrations: dayData.registrations,
      revenue: dayData.revenue
    });
  }

  return {
    totalRevenue,
    totalCapacity,
    totalSold,
    checkedIn: checkedInCount,
    statusCounts,
    timelineData,
    ticketCategories: ticketStats.map(c => {
      const sold = Math.max(0, (c.capacity || 0) - (c.availableQuantity || 0));
      return {
        _id: c._id,
        name: c.name,
        sold,
        capacity: c.capacity || 0,
        price: c.price || 0,
        revenue: sold * (c.price || 0)
      };
    })
  };
};
