#!/usr/bin/env node
const axios = require('axios');

axios.get('http://127.0.0.1:3000/api/status', { timeout: 5000 })
  .then(res => {
    console.log(JSON.stringify(res.data, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('error', err.message);
    process.exit(1);
  });
