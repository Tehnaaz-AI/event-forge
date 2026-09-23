import { z } from 'zod';
import * as aiService from '../services/aiService.js';
import { ok } from '../utils/http.js';

export const generateMarketingCopy = async (req, res, next) => {
  try {
    const { targetAudience, apiKey } = z.object({ 
      targetAudience: z.string().min(2),
      apiKey: z.string().optional()
    }).parse(req.body);
    const result = await aiService.generateMarketingCopy(req.params.eventId, targetAudience, apiKey);
    ok(res, { content: result }, 'Marketing copy generated successfully');
  } catch (e) { next(e); }
};

export const recommendSessions = async (req, res, next) => {
  try {
    const { topic, apiKey } = z.object({ 
      topic: z.string().min(2),
      apiKey: z.string().optional()
    }).parse(req.body);
    const result = await aiService.recommendSessions(req.params.eventId, topic, apiKey);
    ok(res, { content: result }, 'Session recommendations generated successfully');
  } catch (e) { next(e); }
};

export const getAttendeeRecommendations = async (req, res, next) => {
  try {
    const { interests } = z.object({ interests: z.string().min(2) }).parse(req.body);
    const result = await aiService.getAttendeeRecommendations(req.params.eventId, interests);
    ok(res, { recommendations: result }, 'Attendee session recommendations generated successfully');
  } catch (e) { next(e); }
};

export const generateSpeechCoach = async (req, res, next) => {
  try {
    const { speechTitle, speakerBio, durationMinutes, apiKey } = z.object({
      speechTitle: z.string().min(2),
      speakerBio: z.string().optional(),
      durationMinutes: z.number().min(1).max(120).optional().default(15),
      apiKey: z.string().optional()
    }).parse(req.body);

    const result = await aiService.generateSpeechCoach(
      req.params.eventId, 
      speechTitle, 
      speakerBio, 
      durationMinutes, 
      apiKey
    );
    ok(res, { content: result }, 'Speech coach and Q&A framework synthesized successfully');
  } catch (e) {
    next(e);
  }
};

export const testAIKey = async (req, res, next) => {
  try {
    const { apiKey, provider, model } = z.object({
      apiKey: z.string().min(4, 'API key is required'),
      provider: z.string().optional(),
      model: z.string().optional()
    }).parse(req.body);
    const result = await aiService.testAIConnection(apiKey, provider, model);
    ok(res, { message: result, success: true }, 'AI Connection Verified');
  } catch (e) {
    next(e);
  }
};

