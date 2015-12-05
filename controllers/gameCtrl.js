'use strict';

var gameSrv = require('../services/gameSrv');
var util = require('../services/util');
var games = [];

exports.joinGame = function(playerId) {
  var game;
  if(games.length && !games[games.length - 1].p2) {
    game = games[games.length - 1];
    game.p2 = {id: playerId, name: util.getRandomName()};
  } else {
    game = gameSrv.createGame();
    game.p1 = {id: playerId, name: util.getRandomName()};
    games.push(game);
  }
  return game;
}
