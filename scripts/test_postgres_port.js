const net = require('net');
const tls = require('tls');

const host = 'db.wgyscapdywroefsjenno.supabase.co';
const port = 5432;

console.log(`Connecting to ${host}:${port}...`);
const start = Date.now();

const socket = new net.Socket();
socket.setTimeout(5000);

socket.connect(port, host, () => {
  const latency = Date.now() - start;
  console.log(`\x1b[32m✔ SUCCESS:\x1b[0m TCP socket connected to ${host}:${port} in ${latency}ms.`);
  socket.destroy();
  process.exit(0);
});

socket.on('error', (err) => {
  console.error(`\x1b[31m✖ TCP Connection Error:\x1b[0m ${err.message}`);
  process.exit(1);
});

socket.on('timeout', () => {
  console.error(`\x1b[31m✖ TCP Connection Timeout (5000ms)\x1b[0m`);
  socket.destroy();
  process.exit(1);
});
