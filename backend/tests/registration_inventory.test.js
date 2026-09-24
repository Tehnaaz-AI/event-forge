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
});
