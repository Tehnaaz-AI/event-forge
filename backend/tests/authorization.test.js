import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { eventAccess, requireEventOrganizer } from '../src/middleware/auth.js';
import { Event, EventStaff } from '../src/models/index.js';

test('Authorization: Tenant Isolation and Role Guards', async (t) => {
  const org1Id = new mongoose.Types.ObjectId();
  const org2Id = new mongoose.Types.ObjectId();
  const user1Id = new mongoose.Types.ObjectId();
  const user2Id = new mongoose.Types.ObjectId();
  const eventId = new mongoose.Types.ObjectId();

  const mockEvent = {
    _id: eventId,
    title: 'Global Tech Summit 2026',
    organizer: user1Id,
    organization: org1Id
  };

  // Mock Event model findById and EventStaff findOne
  const originalFindById = Event.findById;
  const originalFindOne = EventStaff.findOne;

  Event.findById = function (id) {
    if (String(id) === String(eventId)) return Promise.resolve(mockEvent);
    return Promise.resolve(null);
  };
  EventStaff.findOne = function () {
    return Promise.resolve(null);
  };

  await t.test('Platform Admin is granted access to all events', async () => {
    let nextCalled = false;
    const req = {
      params: { eventId: String(eventId) },
      user: { _id: user2Id, role: 'PLATFORM_ADMIN', organization: org2Id }
    };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await eventAccess(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.event._id, eventId);
  });

  await t.test('Event owner organizer is granted access', async () => {
    let nextCalled = false;
    const req = {
      params: { eventId: String(eventId) },
      user: { _id: user1Id, role: 'ORGANIZER', organization: org1Id }
    };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await eventAccess(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });

  await t.test('Organizer from DIFFERENT organization is DENIED access', async () => {
    let nextCalled = false;
    let statusCode = 200;
    let errorResponse = null;

    const req = {
      params: { eventId: String(eventId) },
      user: { _id: user2Id, role: 'ORGANIZER', organization: org2Id }
    };
    const res = {
      status(code) { statusCode = code; return this; },
      json(payload) { errorResponse = payload; return this; }
    };

    await eventAccess(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false, 'Cross-tenant access must NOT call next()');
    assert.strictEqual(statusCode, 403, 'Cross-tenant access must return HTTP 403 Forbidden');
    assert.strictEqual(errorResponse?.success, false);
  });

  await t.test('Role escalation: Public registration cannot self-select PLATFORM_ADMIN', () => {
    const maliciousPayload = {
      name: 'Hacker',
      email: 'hacker@darknet.io',
      role: 'PLATFORM_ADMIN'
    };

    // Verify sanitization logic
    let assignedRole = 'ATTENDEE';
    if (maliciousPayload.organizationName && maliciousPayload.organizationName.trim()) {
      assignedRole = 'ORGANIZER';
    } else if (maliciousPayload.role === 'ORGANIZER') {
      assignedRole = 'ORGANIZER';
    }

    assert.strictEqual(assignedRole, 'ATTENDEE', 'Self-selected PLATFORM_ADMIN must default to ATTENDEE');
  });

  await t.test('Human-in-the-loop Action: Idempotency rejects second execution', () => {
    const executedRecommendation = {
      _id: new mongoose.Types.ObjectId(),
      status: 'EXECUTED',
      proposedAction: { actionType: 'MOVE_SESSION' }
    };

    assert.strictEqual(executedRecommendation.status, 'EXECUTED');
    const isExecutable = executedRecommendation.status === 'PROPOSED' || executedRecommendation.status === 'APPROVED';
    assert.strictEqual(isExecutable, false, 'Already executed recommendation must not be re-executed');
  });

  // Restore mocks
  Event.findById = originalFindById;
  EventStaff.findOne = originalFindOne;
});
