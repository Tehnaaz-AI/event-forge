import * as adminService from '../services/adminService.js';
import { ok, fail } from '../utils/http.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers(req.query);
    ok(res, users);
  } catch (e) {
    next(e);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    ok(res, user, 'User created successfully', 201);
  } catch (e) {
    if (e.message.includes('already')) return fail(res, e.message, 409);
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    ok(res, user, 'User updated successfully');
  } catch (e) {
    if (e.message.includes('not found')) return fail(res, e.message, 404);
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(req.params.id, req.user._id);
    ok(res, result, 'User deleted successfully');
  } catch (e) {
    if (e.message.includes('Cannot delete')) return fail(res, e.message, 400);
    if (e.message.includes('not found')) return fail(res, e.message, 404);
    next(e);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await adminService.getAllEventsPlatformWide(req.query);
    ok(res, events);
  } catch (e) {
    next(e);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const result = await adminService.deleteEventPlatformWide(req.params.id);
    ok(res, result, 'Event deleted platform-wide successfully');
  } catch (e) {
    if (e.message.includes('not found')) return fail(res, e.message, 404);
    next(e);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getPlatformStats();
    ok(res, stats);
  } catch (e) {
    next(e);
  }
};
