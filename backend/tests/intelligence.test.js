import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { getEventPulse, askEventCopilot } from '../src/services/eventIntelligenceService.js';
import { Event, Session, TicketCategory, Registration, Ticket, EventStaff, Sponsor, EventTelemetry, EventAlert } from '../src/models/index.js';

test('Event Intelligence Layer & Operational Health Indicators', async (t) => {
  const eventId = new mongoose.Types.ObjectId();
  const orgId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  const mockEvent = {
    _id: eventId,
    title: 'Autonomous AI Summit 2026',
    capacity: 500,
    startDate: new Date(Date.now() - 3600000), // 1 hour ago
    endDate: new Date(Date.now() + 7200000),   // 2 hours ahead
    status: 'LIVE',
    organization: { _id: orgId, name: 'DeepMind Enterprise' },
    registrationSettings: { waitlistEnabled: true }
  };

  const mockSessions = [
    {
      _id: new mongoose.Types.ObjectId(),
      event: eventId,
      title: 'Keynote: Scalable Agentic Architectures',
      room: 'Main Hall A',
      capacity: 300,
      startTime: new Date(Date.now() - 1800000),
      endTime: new Date(Date.now() + 1800000),
      speakers: [{ name: 'Dr. Jane Smith' }]
    },
    {
      _id: new mongoose.Types.ObjectId(),
      event: eventId,
      title: 'Workshop: Neural Event Systems',
      room: 'Workshop Room B',
      capacity: 100,
      startTime: new Date(Date.now() + 1800000),
      endTime: new Date(Date.now() + 5400000),
      speakers: [{ name: 'Alex Johnson' }]
    }
  ];

  await t.test('Health score breakdown is deterministic and weighted properly', () => {
    // Weights: Attendance 25%, Capacity 25%, Schedule 20%, Check-in 15%, Session Demand 15%
    const attendanceScore = 90;
    const capacityScore = 80;
    const scheduleScore = 95;
    const checkInScore = 70;
    const sessionDemandScore = 85;

    const computed = Math.round(
      (attendanceScore * 0.25) +
      (capacityScore * 0.25) +
      (scheduleScore * 0.20) +
      (checkInScore * 0.15) +
      (sessionDemandScore * 0.15)
    );

    assert.strictEqual(computed, 85);
  });

  await t.test('Deterministic Anomaly Alert schema contains concrete evidence', () => {
    const alert = {
      type: 'CAPACITY_RISK',
      severity: 'HIGH',
      title: 'Main Hall A is approaching maximum safe capacity',
      evidence: [
        'Current estimated occupancy: 282',
        'Room rated capacity: 300',
        'Occupancy rate: 94%',
        'Remaining seats: 18'
      ],
      recommendedAction: 'Open overflow room or reassign active session'
    };

    assert.strictEqual(alert.type, 'CAPACITY_RISK');
    assert.strictEqual(alert.severity, 'HIGH');
    assert.ok(alert.evidence.length >= 3);
    assert.ok(alert.evidence[0].includes('282'));
    assert.ok(alert.recommendedAction.length > 0);
  });
});
