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

  // Format dynamic timeline data from database
  let timelineData = timelineAgg.map(t => {
    const d = new Date(t._id);
    const label = !isNaN(d) ? d.toLocaleDateString([], { month: 'short', day: 'numeric' }) : t._id;
    return {
      day: label,
      date: t._id,
      registrations: t.registrations,
      revenue: t.revenue
    };
  });

  if (timelineData.length === 0) {
    const todayStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
    timelineData = [
      { day: todayStr, registrations: 0, revenue: 0 }
    ];
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
