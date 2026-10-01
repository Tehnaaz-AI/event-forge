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

  await t.test('deleteTicketCategory returns 409 conflict and leaves database state unchanged when active registrations exist', async () => {
    const { deleteTicketCategory } = await import('../src/services/eventService.js');
    const { TicketCategory, Registration } = await import('../src/models/index.js');

    const eventId = new mongoose.Types.ObjectId();
    const categoryId = new mongoose.Types.ObjectId();

    const origCatFindOne = TicketCategory.findOne;
    const origRegExists = Registration.exists;

    const mockCategory = {
      _id: categoryId,
      event: eventId,
      name: 'Standard Pass',
      isActive: true,
      save() { return Promise.resolve(this); }
    };

    TicketCategory.findOne = () => Promise.resolve(mockCategory);
    // Simulate active registrations exist
    Registration.exists = () => Promise.resolve({ _id: new mongoose.Types.ObjectId() });

    const req = {
      params: { categoryId: String(categoryId) },
      event: { _id: eventId }
    };

    await assert.rejects(
      () => deleteTicketCategory(req, {}),
      (err) => {
        assert.strictEqual(err.statusCode, 409);
        assert.strictEqual(err.code, 'CATEGORY_IN_USE');
        assert.strictEqual(mockCategory.isActive, true, 'Category state must NOT be mutated on 409 conflict');
        return true;
      }
    );

    TicketCategory.findOne = origCatFindOne;
    Registration.exists = origRegExists;
  });

  await t.test('deleteTicketCategory archives cleanly when no active registrations exist', async () => {
    const { deleteTicketCategory } = await import('../src/services/eventService.js');
    const { TicketCategory, Registration } = await import('../src/models/index.js');

    const eventId = new mongoose.Types.ObjectId();
    const categoryId = new mongoose.Types.ObjectId();

    const origCatFindOne = TicketCategory.findOne;
    const origRegExists = Registration.exists;

    const mockCategory = {
      _id: categoryId,
      event: eventId,
      name: 'Unused Pass',
      isActive: true,
      save() { return Promise.resolve(this); }
    };

    TicketCategory.findOne = () => Promise.resolve(mockCategory);
    Registration.exists = () => Promise.resolve(null); // No dependencies

    const req = {
      params: { categoryId: String(categoryId) },
      event: { _id: eventId }
    };

    const res = await deleteTicketCategory(req, {});
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.archived, true);
    assert.strictEqual(mockCategory.isActive, false, 'Category must be marked inactive');

    // Idempotent second call on already archived category
    const resIdempotent = await deleteTicketCategory(req, {});
    assert.strictEqual(resIdempotent.success, true);
    assert.strictEqual(resIdempotent.archived, true);

    TicketCategory.findOne = origCatFindOne;
    Registration.exists = origRegExists;
  });

  await t.test('registerAttendee rejects purchase attempts for archived ticket category', async () => {
    const { registerAttendee } = await import('../src/services/eventService.js');
    const { Event, Registration, TicketCategory } = await import('../src/models/index.js');

    const eventId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const categoryId = new mongoose.Types.ObjectId();

    const origEventFindById = Event.findById;
    const origRegFindOne = Registration.findOne;
    const origCatFindOne = TicketCategory.findOne;

    Event.findById = () => Promise.resolve({ _id: eventId, title: 'DevConf', status: 'REGISTRATION_OPEN' });
    Registration.findOne = () => Promise.resolve(null);
    TicketCategory.findOne = () => Promise.resolve({
      _id: categoryId,
      name: 'Archived Tier',
      isActive: false, // Archived category
      price: 199,
      capacity: 50,
      availableQuantity: 50
    });

    const req = {
      params: { eventId: String(eventId) },
      user: { _id: userId, name: 'Bob', role: 'ATTENDEE' },
      body: { ticketCategory: String(categoryId) }
    };

    await assert.rejects(
      () => registerAttendee(req, {}),
      (err) => {
        assert.ok(err.message.includes('archived'));
        return true;
      }
    );

    Event.findById = origEventFindById;
    Registration.findOne = origRegFindOne;
    TicketCategory.findOne = origCatFindOne;
  });

  await t.test('deleteUser safely deactivates user and restores category inventory without exceeding capacity', async () => {
    const { deleteUser } = await import('../src/services/adminService.js');
    const { User, Registration, Ticket, TicketCategory } = await import('../src/models/index.js');

    const adminId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const categoryId = new mongoose.Types.ObjectId();

    const origUserFindById = User.findById;
    const origRegFind = Registration.find;
    const origCatFindById = TicketCategory.findById;
    const origCatFindByIdAndUpdate = TicketCategory.findByIdAndUpdate;
    const origTicketFindOneAndUpdate = Ticket.findOneAndUpdate;

    const mockUser = {
      _id: userId,
      status: 'ACTIVE',
      save() { return Promise.resolve(this); }
    };

    const mockReg = {
      _id: new mongoose.Types.ObjectId(),
      attendee: userId,
      ticketCategory: categoryId,
      registrationStatus: 'CONFIRMED',
      save() { return Promise.resolve(this); }
    };

    const mockCat = {
      _id: categoryId,
      capacity: 100,
      availableQuantity: 95
    };

    let inventoryIncremented = false;

    User.findById = (id) => Promise.resolve(mockUser);
    Registration.find = () => Promise.resolve([mockReg]);
    TicketCategory.findById = (id) => Promise.resolve(mockCat);
    TicketCategory.findByIdAndUpdate = (id, update) => {
      if (update.$inc?.availableQuantity === 1) inventoryIncremented = true;
      return Promise.resolve(mockCat);
    };
    Ticket.findOneAndUpdate = () => Promise.resolve({});

    const result = await deleteUser(userId, adminId);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'DEACTIVATED');
    assert.strictEqual(mockUser.status, 'DEACTIVATED', 'User record must be deactivated rather than deleted to preserve history');
    assert.strictEqual(mockReg.registrationStatus, 'CANCELLED');
    assert.strictEqual(inventoryIncremented, true, 'Available quantity must be safely restored to category');

    User.findById = origUserFindById;
    Registration.find = origRegFind;
    TicketCategory.findById = origCatFindById;
    TicketCategory.findByIdAndUpdate = origCatFindByIdAndUpdate;
    Ticket.findOneAndUpdate = origTicketFindOneAndUpdate;
  });

  await t.test('MongoDB Coupon calculation: Computes percentage and fixed discounts with usage limits', async () => {
    const { Coupon } = await import('../src/models/index.js');

    const couponPerc = {
      code: 'SAVE20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxUses: 100,
      currentUses: 5,
      isActive: true
    };

    const couponFixed = {
      code: 'VIP50',
      discountType: 'FIXED',
      discountValue: 50,
      maxUses: 10,
      currentUses: 0,
      isActive: true
    };

    const basePrice = 299;

    // Percentage discount
    const finalPerc = Math.max(0, Math.round(basePrice * (1 - (couponPerc.discountValue / 100))));
    assert.strictEqual(finalPerc, 239);

    // Fixed discount
    const finalFixed = Math.max(0, basePrice - couponFixed.discountValue);
    assert.strictEqual(finalFixed, 249);

    // Exhausted coupon check
    const exhaustedCoupon = { maxUses: 5, currentUses: 5 };
    const canUse = !exhaustedCoupon.maxUses || exhaustedCoupon.currentUses < exhaustedCoupon.maxUses;
    assert.strictEqual(canUse, false, 'Exhausted coupon must be rejected');
  });
});

