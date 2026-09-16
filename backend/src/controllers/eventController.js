import { z } from 'zod';
import * as eventService from '../services/eventService.js';
import { ok, fail } from '../utils/http.js';
import { Session } from '../models/index.js';

export const getEvents = async (req, res, next) => {
  try { ok(res, await eventService.getEvents(req, res)); } catch (e) { next(e); }
};

export const getOrganizerEvents = async (req, res, next) => {
  try { ok(res, await eventService.getOrganizerEvents(req, res)); } catch (e) { next(e); }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req, res);
    if (!event) return fail(res, 'Event not found', 404);
    ok(res, event);
  } catch (e) { next(e); }
};

export const getPublicEvent = async (req, res, next) => {
  try {
    const eventData = await eventService.getPublicEvent(req, res);
    ok(res, eventData);
  } catch (e) {
    if (e.message.includes('not found')) return fail(res, e.message, 404);
    next(e);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    req.body = z.object({
      title: z.string().min(3), description: z.string().optional(), eventType: z.string().optional(),
      category: z.string().optional(), startDate: z.coerce.date(), endDate: z.coerce.date(),
      capacity: z.number().int().positive(), venue: z.object({ name: z.string(), address: z.string().optional() }),
      tags: z.array(z.string()).default([])
    }).parse(req.body);
    if (req.body.endDate <= req.body.startDate) return fail(res, 'End date must be after start date');
    ok(res, await eventService.createEvent(req, res), 'Event created', 201);
  } catch (e) { next(e); }
};

export const updateEvent = async (req, res, next) => {
  try { ok(res, await eventService.updateEvent(req, res), 'Event updated'); } catch (e) { next(e); }
};

export const updateEventStatus = async (req, res, next) => {
  try { ok(res, await eventService.updateEventStatus(req, res), 'Event status updated'); } catch (e) { next(e); }
};

export const deleteEvent = async (req, res, next) => {
  try { ok(res, await eventService.deleteEvent(req, res), 'Event deleted successfully'); } catch (e) { next(e); }
};

export const createSession = async (req, res, next) => {
  try {
    req.body = z.object({
      title: z.string().min(3), description: z.string().optional(), speakers: z.array(z.string()).default([]),
      room: z.string().min(1), startTime: z.coerce.date(), endTime: z.coerce.date(), capacity: z.number().int().positive(),
      category: z.string().optional(), tags: z.array(z.string()).default([])
    }).parse(req.body);
    ok(res, await eventService.createSession(req, res), 'Session created', 201);
  } catch (e) { 
    if (e.message.includes('conflict')) return fail(res, e.message, 409);
    if (e.message.includes('end time')) return fail(res, e.message, 400);
    next(e); 
  }
};

export const getSessions = async (req, res, next) => {
  try { ok(res, await eventService.getSessions(req, res)); } catch (e) { next(e); }
};

export const createTicketCategory = async (req, res, next) => {
  try {
    req.body = z.object({
      name: z.string().min(2), description: z.string().optional(), price: z.number().min(0),
      capacity: z.number().int().positive(), saleStart: z.coerce.date().optional(), saleEnd: z.coerce.date().optional()
    }).parse(req.body);
    ok(res, await eventService.createTicketCategory(req, res), 'Ticket category created', 201);
  } catch (e) { next(e); }
};

export const getTicketCategories = async (req, res, next) => {
  try { ok(res, await eventService.getTicketCategories(req, res)); } catch (e) { next(e); }
};

export const updateTicketCategory = async (req, res, next) => {
  try {
    req.body = z.object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      price: z.number().min(0).optional(),
      capacity: z.number().int().positive().optional()
    }).parse(req.body);
    ok(res, await eventService.updateTicketCategory(req, res), 'Ticket category updated');
  } catch (e) { next(e); }
};

export const deleteTicketCategory = async (req, res, next) => {
  try {
    ok(res, await eventService.deleteTicketCategory(req, res), 'Ticket category deleted');
  } catch (e) { next(e); }
};

export const registerAttendee = async (req, res, next) => {
  try {
    const result = await eventService.registerAttendee(req, res);
    ok(res, result, result.ticket ? 'Registration confirmed' : 'Added to waitlist', 201);
  } catch (e) {
    fail(res, e.message, e.message.includes('already') ? 409 : 400);
  }
};

export const checkInTicket = async (req, res, next) => {
  try { ok(res, await eventService.checkInTicket(req, res), 'Check-in successful'); } catch (e) { fail(res, e.message, 400); }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    req.body = z.object({
      title: z.string().min(2), message: z.string().min(2),
      type: z.enum(['INFO', 'REMINDER', 'URGENT', 'SCHEDULE_CHANGE']).default('INFO'),
      audience: z.string().default('ALL_ATTENDEES')
    }).parse(req.body);
    ok(res, await eventService.createAnnouncement(req, res), 'Announcement sent', 201);
  } catch (e) { next(e); }
};

export const getAnalytics = async (req, res, next) => {
  try { ok(res, await eventService.getAnalytics(req, res)); } catch (e) { next(e); }
};

export const getMyTickets = async (req, res, next) => {
  try { ok(res, await eventService.getMyTickets(req, res)); } catch (e) { next(e); }
};

export const checkInAnyTicket = async (req, res, next) => {
  try { ok(res, await eventService.checkInAnyTicket(req, res), 'Check-in successful'); } catch (e) { fail(res, e.message, 400); }
};

export const getEventStaff = async (req, res, next) => {
  try { ok(res, await eventService.getEventStaff(req, res)); } catch (e) { next(e); }
};

export const addEventStaff = async (req, res, next) => {
  try {
    req.body = z.object({
      name: z.string().min(2, 'Name is required'),
      email: z.string().email('Valid email is required'),
      password: z.string().optional(),
      role: z.enum(['CHECK_IN', 'SUPPORT', 'MANAGER']).default('CHECK_IN'),
      phone: z.string().optional()
    }).parse(req.body);
    ok(res, await eventService.addEventStaff(req, res), 'Staff member added successfully', 201);
  } catch (e) {
    fail(res, e.message || 'Failed to add staff member', 400);
  }
};

export const removeEventStaff = async (req, res, next) => {
  try {
    ok(res, await eventService.removeEventStaff(req, res), 'Staff member removed');
  } catch (e) {
    fail(res, e.message || 'Failed to remove staff member', 400);
  }
};



