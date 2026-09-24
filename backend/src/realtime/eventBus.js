import EventEmitter from 'events';

class RealtimeEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Broadcast a structured operational event to a specific event room
   * @param {string} eventId - ID of the event
   * @param {string} type - Event type (e.g., 'ROOM_OCCUPANCY_CHANGED', 'ATTENDEE_CHECKED_IN', 'CAPACITY_ALERT', 'ACTION_EXECUTED', 'PULSE_UPDATED')
   * @param {object} payload - Focused payload
   */
  broadcast(eventId, type, payload = {}) {
    const channel = `event:${eventId}`;
    const message = {
      type,
      eventId,
      timestamp: new Date().toISOString(),
      payload
    };
    this.emit(channel, message);
    this.emit('global', message);
  }
}

export const eventBus = new RealtimeEventBus();
