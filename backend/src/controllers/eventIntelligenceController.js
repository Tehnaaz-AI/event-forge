import jwt from 'jsonwebtoken';
import { z } from 'zod';
import * as intelService from '../services/eventIntelligenceService.js';
import { ok, fail } from '../utils/http.js';

export const getEventPulse = async (req, res, next) => {
  try {
    const pulse = await intelService.getEventPulse(req.params.eventId);
    ok(res, pulse);
  } catch (e) {
    next(e);
  }
};

export const askEventCopilot = async (req, res, next) => {
  try {
    const body = z.object({
      question: z.string().min(1, 'Question cannot be empty')
    }).parse(req.body);

    const result = await intelService.askEventCopilot(req.params.eventId, body.question, req.user);
    ok(res, result);
  } catch (e) {
    next(e);
  }
};

export const executeAction = async (req, res, next) => {
  try {
    const body = z.object({
      actionType: z.string(),
      payload: z.record(z.any()).default({}),
      recommendationId: z.string().optional()
    }).parse(req.body);

    const result = await intelService.executeOrganizerAction(req.params.eventId, body, req.user);
    ok(res, result, 'Action executed and verified successfully');
  } catch (e) {
    next(e);
  }
};

export const advanceSimulationStep = async (req, res, next) => {
  try {
    const body = z.object({
      targetOccupancy: z.number().min(0).max(200).optional(),
      roomName: z.string().optional(),
      checkInBurst: z.number().int().min(1).max(200).optional()
    }).parse(req.body || {});

    const result = await intelService.advanceSimulationStep(req.params.eventId, body);
    ok(res, result, 'Simulation telemetry injected successfully');
  } catch (e) {
    next(e);
  }
};

export const resetSimulation = async (req, res, next) => {
  try {
    const result = await intelService.resetSimulation(req.params.eventId);
    ok(res, result, 'Simulation telemetry reset to real live state');
  } catch (e) {
    next(e);
  }
};

export const getPostEventReport = async (req, res, next) => {
  try {
    const report = await intelService.getPostEventReport(req.params.eventId);
    ok(res, report);
  } catch (e) {
    next(e);
  }
};

export const getRecoveryScenarios = async (req, res, next) => {
  try {
    const pulse = await intelService.getEventPulse(req.params.eventId);
    
    // Propose recovery plans for common operational hazards
    const scenarios = [
      {
        id: 'scenario-speaker-cancel',
        title: 'Speaker Sudden Cancellation',
        category: 'SPEAKER',
        impact: 'Keynote track delayed or empty podium',
        proposals: [
          'Promote co-speaker or panel lead to solo keynote delivery',
          'Reschedule session to afternoon breakout slot',
          'Broadcast immediate schedule change notification to registered delegates'
        ],
        actionPayload: {
          actionType: 'BROADCAST_ANNOUNCEMENT',
          payload: {
            title: 'Schedule Update: Keynote Speaker Substitution',
            message: 'Due to unexpected speaker travel delay, the opening session has been substituted with our Principal Architect Panel in Main Hall.',
            type: 'SCHEDULE_CHANGE'
          }
        }
      },
      {
        id: 'scenario-room-unavailable',
        title: 'Room AV or HVAC Failure (Room Evacuation)',
        category: 'VENUE',
        impact: 'Room unsafe or unusable for active sessions',
        proposals: [
          'Relocate active session to closest available hall with surplus capacity',
          'Deploy room usher staff to redirect incoming delegate traffic',
          'Switch video stream to overflow broadcast lounge'
        ],
        actionPayload: {
          actionType: 'MOVE_SESSION',
          payload: {
            fromRoom: 'Hall A',
            toRoom: 'Hall B',
            sessionTitle: pulse.sessions[0]?.title || 'Main Keynote'
          }
        }
      },
      {
        id: 'scenario-scanner-outage',
        title: 'Entrance Wi-Fi Degraded / Scanner Outage',
        category: 'HARDWARE_NETWORK',
        impact: 'Badge check-in bottleneck at turnstiles',
        proposals: [
          'Switch door staff scanners to Offline Queue Mode (local cache validation)',
          'Open manual lookup desks at Registration Counters 3 and 4',
          'Auto-sync scanned badges upon network reconnection'
        ],
        actionPayload: {
          actionType: 'BROADCAST_ANNOUNCEMENT',
          payload: {
            title: 'Express Door Entry Active',
            message: 'All badge turnstiles are operating in high-speed express mode. Have your mobile QR code open on screen.',
            type: 'INFO'
          }
        }
      },
      {
        id: 'scenario-hall-overflow',
        title: 'Hall Overflow (>95% Capacity Risk)',
        category: 'SAFETY_CAPACITY',
        impact: 'Standing room fire code violation',
        proposals: [
          'Open Hall B as video simulcast overflow seating',
          'Restrict further entrance badges into primary hall',
          'Direct overflow traffic with volunteer marshals'
        ],
        actionPayload: {
          actionType: 'OPEN_OVERFLOW_ROOM',
          payload: {
            primaryRoom: 'Hall A',
            overflowRoom: 'Hall B'
          }
        }
      }
    ];

    ok(res, scenarios);
  } catch (e) {
    next(e);
  }
};

export const generateStreamToken = async (req, res, next) => {
  try {
    const streamToken = jwt.sign(
      {
        purpose: 'SSE_STREAM',
        userId: String(req.user._id),
        eventId: String(req.event._id),
        role: req.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '120s' }
    );
    ok(res, { streamToken, expiresIn: 120 });
  } catch (e) {
    next(e);
  }
};
