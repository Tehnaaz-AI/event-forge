import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { Session } from '../src/models/index.js';
import { 
  createSession, 
  updateSessionStatus, 
  generateProposedSchedule 
} from '../src/services/eventService.js';

describe('Session Lifecycle & Conflict Validation Engine', () => {
  const eventId = new mongoose.Types.ObjectId();
  const speakerId = new mongoose.Types.ObjectId();
  const mockEvent = {
    _id: eventId,
    title: 'Cloud Architecture Summit 2026',
    startDate: new Date('2026-10-15T09:00:00Z'),
    endDate: new Date('2026-10-17T18:00:00Z')
  };

  it('Rejects session creation with negative or zero capacity', async () => {
    const req = {
      event: mockEvent,
      body: {
        title: 'Microservices Resilience',
        room: 'Hall A',
        capacity: 0,
        startTime: new Date('2026-10-15T10:00:00Z'),
        endTime: new Date('2026-10-15T11:00:00Z')
      }
    };

    await assert.rejects(
      () => createSession(req, {}),
      /capacity must be positive/i
    );
  });

  it('Rejects session with start time after end time', async () => {
    const req = {
      event: mockEvent,
      body: {
        title: 'Invalid Clock Session',
        room: 'Hall A',
        capacity: 100,
        startTime: new Date('2026-10-15T12:00:00Z'),
        endTime: new Date('2026-10-15T10:00:00Z')
      }
    };

    await assert.rejects(
      () => createSession(req, {}),
      /Session end time must be after start time/i
    );
  });

  it('Detects and blocks overlapping session in the same room', async () => {
    const originalExists = Session.exists;
    // Mock Session.exists to simulate conflict
    Session.exists = (query) => {
      if (query.room === 'Hall A') return Promise.resolve({ _id: new mongoose.Types.ObjectId() });
      return Promise.resolve(null);
    };

    const req = {
      event: mockEvent,
      body: {
        title: 'Concurrent Room Clash',
        room: 'Hall A',
        capacity: 200,
        startTime: new Date('2026-10-15T10:00:00Z'),
        endTime: new Date('2026-10-15T11:00:00Z')
      }
    };

    await assert.rejects(
      () => createSession(req, {}),
      /Room conflict: another session overlaps/i
    );

    Session.exists = originalExists;
  });

  it('Detects and blocks speaker double-booking across concurrent rooms', async () => {
    const originalExists = Session.exists;
    Session.exists = (query) => {
      if (query.speakers && query.speakers.$in?.includes(speakerId)) {
        return Promise.resolve({ _id: new mongoose.Types.ObjectId() });
      }
      return Promise.resolve(null);
    };

    const req = {
      event: mockEvent,
      body: {
        title: 'Speaker Double Booked Session',
        room: 'Hall B',
        speakers: [speakerId],
        capacity: 150,
        startTime: new Date('2026-10-15T14:00:00Z'),
        endTime: new Date('2026-10-15T15:00:00Z')
      }
    };

    await assert.rejects(
      () => createSession(req, {}),
      /Speaker conflict: assigned speaker is unavailable/i
    );

    Session.exists = originalExists;
  });

  it('Session Maker AI proposals generate PROPOSED sessions without auto-publishing', async () => {
    const originalCreate = Session.create;
    const originalExists = Session.exists;

    Session.exists = () => Promise.resolve(null);
    const createdSessions = [];
    Session.create = (doc) => {
      const saved = { ...doc, _id: new mongoose.Types.ObjectId() };
      createdSessions.push(saved);
      return Promise.resolve(saved);
    };

    const req = {
      event: mockEvent,
      body: {
        trackTitle: 'Enterprise Kubernetes Track',
        rooms: ['Auditorium 1', 'Auditorium 2'],
        slots: 3,
        durationMinutes: 45
      }
    };

    const result = await generateProposedSchedule(req, {});
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.count, 3);
    assert.strictEqual(createdSessions.length, 3);

    // Verify all generated sessions are in PROPOSED status and NOT published
    for (const s of createdSessions) {
      assert.strictEqual(s.status, 'PROPOSED', 'Proposed sessions must be in PROPOSED draft status');
      assert.ok(s.room);
      assert.ok(s.startTime < s.endTime);
    }

    Session.create = originalCreate;
    Session.exists = originalExists;
  });

  it('Enforces valid session status transitions', async () => {
    const originalFindOne = Session.findOne;
    const mockSession = {
      _id: new mongoose.Types.ObjectId(),
      event: eventId,
      status: 'PROPOSED',
      save() { return Promise.resolve(this); }
    };

    Session.findOne = () => Promise.resolve(mockSession);

    // 1. Valid Approval transition
    const reqApproved = {
      params: { sessionId: String(mockSession._id) },
      event: mockEvent,
      body: { status: 'APPROVED' }
    };
    const approved = await updateSessionStatus(reqApproved, {});
    assert.strictEqual(approved.status, 'APPROVED');

    // 2. Valid Publication transition
    const reqPublish = {
      params: { sessionId: String(mockSession._id) },
      event: mockEvent,
      body: { status: 'PUBLISHED' }
    };
    const published = await updateSessionStatus(reqPublish, {});
    assert.strictEqual(published.status, 'PUBLISHED');

    // 3. Invalid transition rejection
    const reqInvalid = {
      params: { sessionId: String(mockSession._id) },
      event: mockEvent,
      body: { status: 'EXPLODED_STATUS' }
    };
    await assert.rejects(
      () => updateSessionStatus(reqInvalid, {}),
      /Invalid session status transition/i
    );

    Session.findOne = originalFindOne;
  });
});
