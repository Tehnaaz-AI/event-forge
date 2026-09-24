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
    res.write(`event: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  eventBus.on(channel, listener);

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    eventBus.removeListener(channel, listener);
    res.end();
  });
};
