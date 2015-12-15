'use strict';

var gameSrv = require('../services/gameSrv');
var util = require('../services/util');
var games = [];
var players = [];

exports.joinGame = function(playerId) {
  var game;
  var newPlayer = {id: playerId, name: util.getRandomName(), phagoCount: 0};
  players.push(newPlayer);

  if(games.length && !games[games.length - 1].p2) {
    game = games[games.length - 1];
    game.p2 = newPlayer;
  } else {
    game = gameSrv.createGame();
    game.p1 = newPlayer;
    games.push(game);
  }

  newPlayer.initialPhagos = getInitialPhagos(newPlayer.id, game.phagoQuantity);

  return game;
}

exports.newPhago = function(playerId) {
  var player = players.filter((p) => {
    return p.id === playerId;
  })[0];

  var id = 'player' + playerId + 'phago' + ++(player.phagoCount);
  return {id: id, phago: gameSrv.getRandomPhago()};
}

exports.playerMove = function(playerId, clientMove) {
  var game = games.filter((g) => {
    return g.p1.id === playerId || g.p2.id === playerId;
  })[0];

  var playerNumber = game.p1.id === playerId ? 'p1' : 'p2';

  return gameSrv.move(playerNumber, clientMove, game.grid);
}

function getInitialPhagos(playerId, quantity) {
  var phagos = [];
  for(var i = 0; i < quantity; i++) {
    phagos.push(exports.newPhago(playerId));
  }
  return phagos;
}
