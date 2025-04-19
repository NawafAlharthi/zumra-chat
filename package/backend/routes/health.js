const express = require('express');
const router = express.Router();

// Get health status of the server
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Get server stats (for monitoring)
router.get('/stats', (req, res) => {
  const stats = {
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    rooms: {
      active: global.rooms ? global.rooms.size : 0,
      totalParticipants: getTotalParticipants()
    },
    connections: {
      current: global.io ? global.io.engine.clientsCount : 0
    }
  };
  
  res.json(stats);
});

// Helper function to get total participants across all rooms
function getTotalParticipants() {
  if (!global.rooms) return 0;
  
  let count = 0;
  global.rooms.forEach(room => {
    count += room.participants ? room.participants.size : 0;
  });
  
  return count;
}

module.exports = router;
