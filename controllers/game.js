'use strict';

var express = require('express');

var app = module.exports = express.Router();

app.get('/', (req, res) => {
  res.json({id: 1});
});
