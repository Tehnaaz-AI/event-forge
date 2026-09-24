import { Router } from 'express';
import { authenticate, allowRoles, eventAccess } from '../middleware/auth.js';
import * as c from '../controllers/eventController.js';

const r = Router();

// 1. Static and specific sub-routes MUST come before parameterized routes
r.get('/public/:slug', c.getPublicEvent);
r.get('/organizer/me', authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), c.getOrganizerEvents);
r.get('/attendee/my-tickets', authenticate, c.getMyTickets);
r.get('/attendee/my-waitlist', authenticate, c.getMyWaitlist);
r.post('/staff/check-in', authenticate, allowRoles('STAFF', 'ORGANIZER', 'PLATFORM_ADMIN'), c.checkInAnyTicket);

// 2. Collection root routes
r.get('/', c.getEvents);
r.post('/', authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), c.createEvent);

// 3. Specific Event Sub-resources
r.get('/:eventId/sessions', c.getSessions);
r.post('/:eventId/sessions', authenticate, eventAccess, c.createSession);

r.get('/:eventId/tickets', c.getTicketCategories);
r.post('/:eventId/tickets', authenticate, eventAccess, c.createTicketCategory);
r.patch('/:eventId/tickets/:categoryId', authenticate, eventAccess, c.updateTicketCategory);
r.delete('/:eventId/tickets/:categoryId', authenticate, eventAccess, c.deleteTicketCategory);

r.post('/:eventId/register', authenticate, allowRoles('ATTENDEE', 'ORGANIZER', 'PLATFORM_ADMIN'), c.registerAttendee);
r.post('/:eventId/registrations/:registrationId/cancel', authenticate, c.cancelRegistration);
r.post('/:eventId/check-in', authenticate, eventAccess, c.checkInTicket);

// VIP & Priority Waitlist Sub-resource
r.get('/:eventId/waitlist', authenticate, eventAccess, c.getEventWaitlist);
r.post('/:eventId/waitlist/:registrationId/promote', authenticate, eventAccess, c.promoteWaitlistedAttendee);
r.patch('/:eventId/waitlist/:registrationId/priority', authenticate, eventAccess, c.updateWaitlistPriority);

r.get('/:eventId/staff', authenticate, eventAccess, c.getEventStaff);
r.post('/:eventId/staff', authenticate, eventAccess, c.addEventStaff);
r.delete('/:eventId/staff/:staffId', authenticate, eventAccess, c.removeEventStaff);

// 4. Parameterized Single Event CRUD routes
r.get('/:id', c.getEventById);
r.put('/:id', authenticate, eventAccess, c.updateEvent);
r.patch('/:id', authenticate, eventAccess, c.updateEvent);
r.delete('/:id', authenticate, eventAccess, c.deleteEvent);
r.patch('/:id/status', authenticate, eventAccess, c.updateEventStatus);

export default r;

