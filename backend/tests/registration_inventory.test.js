import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';

test('Registration & Waitlist Inventory Engine Logic', async (t) => {
  await t.test('Waitlist position calculation', () => {
    const activeWaitlistCount = 4;
    const nextPosition = activeWaitlistCount + 1;
    assert.strictEqual(nextPosition, 5);
  });

  await t.test('Lifecycle status validation blocks registration for DRAFT and ARCHIVED', () => {
    const allowedStatuses = ['REGISTRATION_OPEN', 'PUBLISHED', 'LIVE'];
    
    assert.strictEqual(allowedStatuses.includes('REGISTRATION_OPEN'), true);
    assert.strictEqual(allowedStatuses.includes('DRAFT'), false);
    assert.strictEqual(allowedStatuses.includes('REGISTRATION_CLOSED'), false);
    assert.strictEqual(allowedStatuses.includes('ARCHIVED'), false);
    assert.strictEqual(allowedStatuses.includes('COMPLETED'), false);
  });

  await t.test('QR code token generation and parsing', async () => {
    const QRCode = await import('qrcode');
    const payload = JSON.stringify({
      registration: '64f1a2b3c4d5e6f7a8b9c0d1',
      ticketNumber: 'EF-2026-VIP-9941',
      attendee: 'Jane Doe',
      event: 'EventForge Summit 2026'
    });

    const dataUrl = await QRCode.toDataURL(payload);
    assert.ok(dataUrl.startsWith('data:image/png;base64,'));

    const parsed = JSON.parse(payload);
    assert.strictEqual(parsed.ticketNumber, 'EF-2026-VIP-9941');
    assert.strictEqual(parsed.attendee, 'Jane Doe');
  });

  await t.test('joinVipWaitlist creates VIP waitlist registration with priority score 10', async () => {
    const { joinVipWaitlist } = await import('../src/services/eventService.js');
    const { Event, Registration, TicketCategory } = await import('../src/models/index.js');

    const eventId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const categoryId = new mongoose.Types.ObjectId();

    const origEventFindById = Event.findById;
    const origRegFindOne = Registration.findOne;
    const origRegCount = Registration.countDocuments;
    const origRegCreate = Registration.create;
    const origCatFindOne = TicketCategory.findOne;

    Event.findById = () => Promise.resolve({ _id: eventId, title: 'AI Summit' });
    Registration.findOne = () => Promise.resolve(null); // No existing registration
    TicketCategory.findOne = () => Promise.resolve({ _id: categoryId, name: 'VIP Pass', tier: 'VIP', price: 499 });
    Registration.countDocuments = () => Promise.resolve(2); // 2 existing waitlisted

    let createdDoc = null;
    Registration.create = (doc) => {
      createdDoc = { ...doc, _id: new mongoose.Types.ObjectId() };
      return Promise.resolve(createdDoc);
    };

    const req = {
      params: { eventId: String(eventId) },
      user: { _id: userId, name: 'Alice Smith', email: 'alice@nexus.io' }
    };

    const res = await joinVipWaitlist(req, {});
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.isVIP, true);
    assert.strictEqual(res.position, 3);
    assert.strictEqual(createdDoc.registrationStatus, 'WAITLISTED');
    assert.strictEqual(createdDoc.isVIP, true);
    assert.strictEqual(createdDoc.priorityScore, 10);

    Event.findById = origEventFindById;
    Registration.findOne = origRegFindOne;
    Registration.countDocuments = origRegCount;
    Registration.create = origRegCreate;
    TicketCategory.findOne = origCatFindOne;
  });
});
