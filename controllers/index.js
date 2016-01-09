'use strict';

var express = require('express');

var app = module.exports = express.Router();

app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.'});
});
