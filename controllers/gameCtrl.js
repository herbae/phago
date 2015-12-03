'use strict';

var express = require('express');
var ws = require('../websockets');
var gameSrv = require('../services/gameSrv');

var app = module.exports = express.Router();

var game;

app.get('/', (req, res) => {
  if(!game) {
    game = gameSrv.createGame();
  }
  res.json(game);
});

app.post('/play', (req, res) => {
  play(req.body);
  ws.broadcast('played', req.body);
  res.sendStatus(200);
});

app.get('/randomPhago', (req, res) => {
  res.json(gameSrv.getRandomPhago());
});

function play(points) {
  points.forEach((point) => {
    game.grid[point.y][point.x] = 'what';
  });
}
