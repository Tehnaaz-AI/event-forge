import { describe, it } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { eventBus } from '../src/realtime/eventBus.js';
import { authenticateStreamToken } from '../src/routes/intelligence.js';
import { User } from '../src/models/index.js';

describe('Real-time EventBus Transport & Scoped Channels', () => {
  it('Broadcasts event to event-scoped channel with structured envelope', (t, done) => {
    const eventId = '66f000000000000000000001';
    const channel = `event:${eventId}`;

    const testListener = (message) => {
      assert.strictEqual(message.type, 'ATTENDEE_CHECKED_IN');
      assert.strictEqual(message.eventId, eventId);
      assert.strictEqual(message.payload.ticketNumber, 'EF-TEST-999');
      assert.ok(message.timestamp);
      eventBus.removeListener(channel, testListener);
      done();
    };

    eventBus.on(channel, testListener);

    eventBus.broadcast(eventId, 'ATTENDEE_CHECKED_IN', {
      ticketNumber: 'EF-TEST-999',
      checkedInAt: new Date().toISOString()
    });
  });

  it('Channel isolation: Events on Event A do NOT trigger listeners for Event B', (t, done) => {
    const eventA = '66f00000000000000000000a';
    const eventB = '66f00000000000000000000b';

    let eventBTriggered = false;

    const listenerB = () => {
      eventBTriggered = true;
    };

    eventBus.on(`event:${eventB}`, listenerB);

    // Broadcast only to Event A
    eventBus.broadcast(eventA, 'ROOM_OCCUPANCY_CHANGED', { room: 'Main Stage', occupancy: 95 });

    setTimeout(() => {
      eventBus.removeListener(`event:${eventB}`, listenerB);
      assert.strictEqual(eventBTriggered, false, 'Event B listener must NOT receive Event A broadcasts');
      done();
    }, 100);
  });

  it('Realtime transport mode reports explicit architecture', () => {
    const info = eventBus.getTransportInfo();
    assert.ok(info.mode === 'SINGLE_INSTANCE_MEMORY' || info.mode === 'DISTRIBUTED_REDIS');
    assert.strictEqual(typeof info.isDistributed, 'boolean');
  });

  it('SSE Stream Token Authentication: Valid scoped stream token is accepted', async () => {
    const secret = process.env.JWT_SECRET || 'testsecret12345678901234567890';
    process.env.JWT_SECRET = secret;

    const userId = new mongoose.Types.ObjectId();
    const eventId = new mongoose.Types.ObjectId();

    // Mock User.findById
    const originalFindById = User.findById;
    User.findById = () => Promise.resolve({ _id: userId, status: 'ACTIVE', role: 'ORGANIZER' });

    const validStreamToken = jwt.sign(
      { purpose: 'SSE_STREAM', userId: String(userId), eventId: String(eventId), role: 'ORGANIZER' },
      secret,
      { expiresIn: '120s' }
    );

    let nextCalled = false;
    const req = {
      params: { eventId: String(eventId) },
      query: { token: validStreamToken }
    };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };

    await authenticateStreamToken(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(String(req.user._id), String(userId));

    // Restore mock
    User.findById = originalFindById;
  });

  it('SSE Stream Token Security: General API token without SSE_STREAM purpose is rejected', async () => {
    const secret = process.env.JWT_SECRET || 'testsecret12345678901234567890';
    const userId = new mongoose.Types.ObjectId();
    const eventId = new mongoose.Types.ObjectId();

    // General API token
    const generalToken = jwt.sign({ id: String(userId), role: 'ORGANIZER' }, secret, { expiresIn: '1h' });

    let nextCalled = false;
    let statusCode = 200;
    let responseBody = null;
    const req = {
      params: { eventId: String(eventId) },
      query: { token: generalToken }
    };
    const res = {
      status(code) { statusCode = code; return this; },
      json(data) { responseBody = data; return this; }
    };

    await authenticateStreamToken(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 401);
    assert.ok(responseBody.message.includes('Invalid token purpose'));
  });

  it('SSE Stream Token Security: Token for Event A attempting Event B stream is rejected (403)', async () => {
    const secret = process.env.JWT_SECRET || 'testsecret12345678901234567890';
    const userId = new mongoose.Types.ObjectId();
    const eventA = new mongoose.Types.ObjectId();
    const eventB = new mongoose.Types.ObjectId();

    const streamTokenA = jwt.sign(
      { purpose: 'SSE_STREAM', userId: String(userId), eventId: String(eventA), role: 'ORGANIZER' },
      secret,
      { expiresIn: '120s' }
    );

    let nextCalled = false;
    let statusCode = 200;
    const req = {
      params: { eventId: String(eventB) }, // Target event B with token A
      query: { token: streamTokenA }
    };
    const res = {
      status(code) { statusCode = code; return this; },
      json(data) { return this; }
    };

    await authenticateStreamToken(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 403);
  });
});
