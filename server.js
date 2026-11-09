/**
 * SANAD Abu Dhabi (سند) - Root Server Launcher
 * Delegates cleanly to the decoupled backend architecture in /backend/server.js
 */

const { server, startServer } = require('./backend/server');

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  startServer(PORT);
}

module.exports = { server, startServer };
