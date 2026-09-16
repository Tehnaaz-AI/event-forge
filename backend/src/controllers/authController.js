import { z } from 'zod';
import * as authService from '../services/authService.js';
import { ok, fail } from '../utils/http.js';

export const register = async (req, res, next) => {
  try {
    const input = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      organizationName: z.string().min(2).optional()
    }).parse(req.body);

    const result = await authService.registerUser(input);
    ok(res, result, 'Account created', 201);
  } catch (e) {
    if (e.message === 'Email already registered') {
      return fail(res, e.message, 409);
    }
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const input = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    }).parse(req.body);

    const result = await authService.loginUser(input);
    ok(res, result, 'Welcome back');
  } catch (e) {
    if (e.message === 'Invalid email or password') {
      return fail(res, e.message, 401);
    }
    next(e);
  }
};

export const updateOrganization = async (req, res, next) => {
  try {
    if (!req.user.organization) return fail(res, 'No organization associated with this account', 400);
    const orgId = typeof req.user.organization === 'object' ? req.user.organization._id : req.user.organization;
    const updatedOrg = await authService.updateOrganization(orgId, req.body);
    ok(res, updatedOrg, 'Organization settings updated successfully');
  } catch (e) { next(e); }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    ok(res, user);
  } catch (e) { next(e); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateUserProfile(req.user._id, req.body);
    ok(res, updatedUser, 'Profile updated successfully');
  } catch (e) { next(e); }
};

export const changePassword = async (req, res, next) => {
  try {
    const input = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6)
    }).parse(req.body);

    const result = await authService.changeUserPassword(req.user._id, input);
    ok(res, result, 'Password changed successfully');
  } catch (e) {
    if (e.message.includes('not match')) return fail(res, e.message, 400);
    next(e);
  }
};

