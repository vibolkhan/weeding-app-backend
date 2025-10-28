// functions/api.js (or similar)
const express = require('express');
const serverless = require('serverless-http');
const app = express();

// Your Express routes and middleware here
app.get('/.netlify/functions/api/hello', (req, res) => {
  res.send('Hello from Netlify Function!');
});

module.exports.handler = serverless(app);