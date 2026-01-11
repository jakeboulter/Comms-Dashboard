#!/usr/bin/env node
const io = require('socket.io-client');
const socket = io('http://127.0.0.1:3000');

socket.on('connect', () => {
  console.log('connected', socket.id);
});

socket.on('bolero:update', (data) => {
  console.log('bolero:update', JSON.stringify(data, null, 2));
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.error('connect_error', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('timeout waiting for update');
  process.exit(1);
}, 10000);
