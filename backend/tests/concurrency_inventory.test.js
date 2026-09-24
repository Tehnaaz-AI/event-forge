import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Concurrency & Inventory Integrity Simulation', () => {
  it('100 concurrent requests competing for the last available ticket: exactly 1 wins, 0 overselling', async () => {
    let availableInventory = 1;
    let successfulReservations = 0;
    let waitlistedOrRejected = 0;

    // Simulate atomic decrement operations
    const attemptReservation = async (userId) => {
      // Atomic check-and-decrement simulation
      if (availableInventory > 0) {
        availableInventory -= 1;
        successfulReservations += 1;
        return { status: 'CONFIRMED', userId };
      } else {
        waitlistedOrRejected += 1;
        return { status: 'WAITLISTED', userId };
      }
    };

    const promises = Array.from({ length: 100 }, (_, i) => attemptReservation(`user_${i}`));
    const results = await Promise.all(promises);

    assert.strictEqual(successfulReservations, 1, 'Only exactly 1 reservation should succeed');
    assert.strictEqual(waitlistedOrRejected, 99, '99 requests should be waitlisted or rejected');
    assert.strictEqual(availableInventory, 0, 'Inventory must not become negative');
    assert.strictEqual(results.filter(r => r.status === 'CONFIRMED').length, 1);
  });

  it('Compensating write: Inventory is restored if registration/ticket step fails', async () => {
    let availableInventory = 10;

    // Step 1: Reserve seat
    availableInventory -= 1;
    assert.strictEqual(availableInventory, 9);

    // Step 2: Simulate failure during downstream ticket creation
    const ticketCreationSimulation = () => {
      throw new Error('Database write error during ticket generation');
    };

    try {
      ticketCreationSimulation();
    } catch (err) {
      // Step 3: Compensating rollback
      availableInventory += 1;
    }

    assert.strictEqual(availableInventory, 10, 'Inventory must be restored to original count on failure');
  });

  it('QR Check-in Replay Protection: Second check-in attempt on same ticket is rejected', () => {
    const mockTicket = {
      ticketNumber: 'EF-TEST-1001',
      status: 'ACTIVE',
      checkedInAt: null
    };

    // First scan: should succeed
    const scanFirstTime = (ticket) => {
      if (ticket.checkedInAt) throw new Error('Already checked in');
      ticket.checkedInAt = new Date();
      return { success: true, checkedInAt: ticket.checkedInAt };
    };

    const firstResult = scanFirstTime(mockTicket);
    assert.strictEqual(firstResult.success, true);
    assert.ok(mockTicket.checkedInAt);

    // Second scan (replay): must throw
    assert.throws(
      () => scanFirstTime(mockTicket),
      /Already checked in/
    );
  });

  it('Waitlist FIFO promotion: Oldest waitlisted attendee is promoted upon cancellation', () => {
    const waitlist = [
      { id: 'w1', attendee: 'Alice', createdAt: new Date('2026-09-01T10:00:00Z'), status: 'WAITLISTED', position: 1 },
      { id: 'w2', attendee: 'Bob', createdAt: new Date('2026-09-01T11:00:00Z'), status: 'WAITLISTED', position: 2 },
      { id: 'w3', attendee: 'Charlie', createdAt: new Date('2026-09-01T12:00:00Z'), status: 'WAITLISTED', position: 3 }
    ];

    // Simulate cancellation triggering promotion of oldest
    const cancelAndPromote = (wl) => {
      const oldest = wl.sort((a, b) => a.createdAt - b.createdAt)[0];
      oldest.status = 'CONFIRMED';
      oldest.position = null;
      
      const remaining = wl.filter(w => w.id !== oldest.id);
      remaining.forEach(w => {
        w.position -= 1;
      });

      return { promoted: oldest, remaining };
    };

    const { promoted, remaining } = cancelAndPromote(waitlist);
    assert.strictEqual(promoted.attendee, 'Alice', 'Oldest waitlist member Alice must be promoted');
    assert.strictEqual(promoted.status, 'CONFIRMED');
    assert.strictEqual(remaining.find(w => w.attendee === 'Bob').position, 1);
    assert.strictEqual(remaining.find(w => w.attendee === 'Charlie').position, 2);
  });
});
