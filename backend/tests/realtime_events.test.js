import { describe, it } from 'node:test';
import assert from 'node:assert';
import { eventBus } from '../src/realtime/eventBus.js';

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
});
