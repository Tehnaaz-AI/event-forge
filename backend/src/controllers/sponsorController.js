import { z } from 'zod';
import * as sponsorService from '../services/sponsorService.js';
import { ok, fail } from '../utils/http.js';

export const getPackages = async (req, res, next) => {
  try { ok(res, await sponsorService.getPackages(req.params.eventId)); } catch (e) { next(e); }
};

export const createPackage = async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string(),
      description: z.string().optional(),
      price: z.number().min(0),
      benefits: z.array(z.string()).default([]),
      availableSpots: z.number().min(0).default(0)
    }).parse(req.body);
    ok(res, await sponsorService.createPackage(req.params.eventId, data), 'Package created', 201);
  } catch (e) { next(e); }
};

export const getSponsors = async (req, res, next) => {
  try { ok(res, await sponsorService.getSponsors(req.params.eventId)); } catch (e) { next(e); }
};

export const addSponsor = async (req, res, next) => {
  try {
    const data = z.object({
      packageId: z.string(),
      organizationId: z.string().optional(),
      companyName: z.string().optional(),
      contactEmail: z.string().email().optional().or(z.literal('')),
      website: z.string().optional(),
      logo: z.string().optional()
    }).parse(req.body);

    if (!data.organizationId && !data.companyName) {
      return fail(res, 'Either Organization or Company Name is required', 400);
    }

    const sponsor = await sponsorService.addSponsor(req.params.eventId, data);
    ok(res, sponsor, 'Sponsor added successfully', 201);
  } catch (e) { next(e); }
};

export const deletePackage = async (req, res, next) => {
  try {
    await sponsorService.deletePackage(req.params.packageId);
    ok(res, null, 'Package deleted successfully');
  } catch (e) { next(e); }
};

export const removeSponsor = async (req, res, next) => {
  try {
    await sponsorService.removeSponsor(req.params.sponsorId);
    ok(res, null, 'Sponsor removed successfully');
  } catch (e) { next(e); }
};

export const getDeliverables = async (req, res, next) => {
  try { ok(res, await sponsorService.getDeliverables(req.params.sponsorId)); } catch (e) { next(e); }
};

export const createDeliverable = async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string(),
      description: z.string().optional(),
      deadline: z.coerce.date()
    }).parse(req.body);
    ok(res, await sponsorService.createDeliverable(req.params.sponsorId, data), 'Deliverable added', 201);
  } catch (e) { next(e); }
};

export const updateDeliverableStatus = async (req, res, next) => {
  try {
    const data = z.object({ status: z.enum(['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'OVERDUE']) }).parse(req.body);
    ok(res, await sponsorService.updateDeliverableStatus(req.params.deliverableId, data.status), 'Status updated');
  } catch (e) { next(e); }
};
