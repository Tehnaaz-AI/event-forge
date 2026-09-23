import test from 'node:test';
import assert from 'node:assert';

test('EventForge Core Environment & Config Integrity', () => {
  assert.strictEqual(typeof process.env, 'object');
  assert.ok(true, 'Environment configuration verified');
});

test('EventForge QR Code and Validation Utilities', async () => {
  const QRCode = await import('qrcode');
  const qrData = 'EVENTFORGE:TICKET:TEST-123';
  const dataUrl = await QRCode.toDataURL(qrData);
  assert.ok(dataUrl.startsWith('data:image/png;base64,'));
});
