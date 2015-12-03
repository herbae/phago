'use strict';

var express = require('express');
var gameSrv = require('../services/gameSrv');

var app = module.exports = express.Router();

var game;

app.get('/randomPhago', (req, res) => {
  res.json(gameSrv.getRandomPhago());
});
