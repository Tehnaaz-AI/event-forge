import { eventBus } from './eventBus.js';

export const handleEventStream = (req, res) => {
  const eventId = req.params.eventId;
  if (!eventId) {
    return res.status(400).json({ success: false, message: 'Event ID is required for real-time subscription' });
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Disable proxy buffering (Nginx / Render)
  });

  // Send initial connection acknowledgement
  res.write(`event: connected\ndata: ${JSON.stringify({ 
    status: 'connected', 
    eventId, 
    time: new Date().toISOString() 
  })}\n\n`);

  // Channel listener
  const channel = `event:${eventId}`;
  const listener = (data) => {
    try {
      if (!res.writableEnded && !res.closed) {
        res.write(`event: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    } catch (e) {
      console.warn('SSE write error:', e.message);
    }
  };

  eventBus.on(channel, listener);

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    try {
      if (!res.writableEnded && !res.closed) {
        res.write(': heartbeat\n\n');
      } else {
        clearInterval(heartbeat);
      }
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 20000);

  // Clean up on disconnect or error
  const cleanup = () => {
    clearInterval(heartbeat);
    eventBus.removeListener(channel, listener);
    if (!res.writableEnded) {
      try {
        res.end();
      } catch (e) {
        // ignore
      }
    }
  };

  req.on('close', cleanup);
  req.on('error', cleanup);
  res.on('error', cleanup);
};
