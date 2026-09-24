import EventEmitter from 'events';

class RealtimeEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
    this.redisUrl = process.env.REDIS_URL || null;
    this.mode = this.redisUrl ? 'DISTRIBUTED_REDIS' : 'SINGLE_INSTANCE_MEMORY';
    this.redisClient = null;
    this.redisSub = null;
    this.initTransport();
  }

  async initTransport() {
    if (!this.redisUrl) {
      // In single-instance deployment, Node EventEmitter provides process-local SSE dispatching
      return;
    }

    try {
      // Dynamic import to support optional Redis deployment without crashing in standard dev/Render single-container mode
      const { default: Redis } = await import('ioredis').catch(() => ({ default: null }));
      if (!Redis) {
        console.warn('⚠️ [RealtimeEventBus] REDIS_URL specified but ioredis not installed. Falling back to single-instance memory bus.');
        this.mode = 'SINGLE_INSTANCE_MEMORY';
        return;
      }

      this.redisClient = new Redis(this.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2, enableOfflineQueue: false });
      this.redisSub = new Redis(this.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2, enableOfflineQueue: false });

      await Promise.all([this.redisClient.connect(), this.redisSub.connect()]);
      
      this.redisSub.psubscribe('event:*', 'global', (err) => {
        if (!err) {
          console.log('⚡ [RealtimeEventBus] Subscribed to Redis distributed channels');
        }
      });

      this.redisSub.on('pmessage', (pattern, channel, rawMsg) => {
        try {
          const parsed = JSON.parse(rawMsg);
          super.emit(channel, parsed);
        } catch {}
      });

      this.mode = 'DISTRIBUTED_REDIS';
      console.log('⚡ [RealtimeEventBus] Distributed Redis Pub/Sub transport active');
    } catch (err) {
      console.warn('⚠️ [RealtimeEventBus] Redis connection unavailable. Resilient fallback to single-instance in-memory bus:', err.message);
      this.mode = 'SINGLE_INSTANCE_MEMORY';
    }
  }

  /**
   * Broadcast a structured operational event to an event-scoped channel
   * @param {string} eventId - ID of the event
   * @param {string} type - Event type (e.g., 'ATTENDEE_CHECKED_IN', 'WAITLIST_PROMOTED', 'ANNOUNCEMENT_CREATED')
   * @param {object} payload - Focused payload
   */
  broadcast(eventId, type, payload = {}) {
    const channel = `event:${eventId}`;
    const message = {
      type,
      eventId: String(eventId),
      timestamp: new Date().toISOString(),
      payload
    };

    // Always deliver to local process listeners for zero latency
    this.emit(channel, message);
    this.emit('global', message);

    // If distributed Redis is active, publish to cluster
    if (this.mode === 'DISTRIBUTED_REDIS' && this.redisClient?.status === 'ready') {
      try {
        this.redisClient.publish(channel, JSON.stringify(message)).catch((err) => {
          console.warn('[RealtimeEventBus] Redis publish error (non-fatal):', err.message);
        });
      } catch (err) {
        // Non-blocking: database consistency is never compromised by realtime transport hiccups
      }
    }
  }

  getTransportInfo() {
    return {
      mode: this.mode,
      isDistributed: this.mode === 'DISTRIBUTED_REDIS',
      redisConfigured: Boolean(this.redisUrl)
    };
  }
}

export const eventBus = new RealtimeEventBus();
