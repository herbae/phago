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
  var game = getGameByPlayerId(playerId);

  var playerNumber = game.p1.id === playerId ? 'p1' : 'p2';

  return gameSrv.move(playerNumber, clientMove, game.grid);
}

exports.score = function(playerId) {
  var game = getGameByPlayerId(playerId);
  var grid = game.grid;
  var placarP1 = 0;
  var placarP2 = 0;

  for (var y = 1; y < game.sideSize + 1; y++) {
    for (var x = 1; x < game.sideSize + 1; x++) {
      if(grid[y][x].player === "p1") {
        placarP1++;
      } else if(grid[y][x].player === "p2") {
        placarP2++;
      }
    }
  }

  return {p1: placarP1, p2: placarP2};
}

function getGameByPlayerId(playerId) {
  return games.filter((g) => {
    return g.p1.id === playerId || g.p2.id === playerId;
  })[0];
}

function getInitialPhagos(playerId, quantity) {
  var phagos = [];
  for(var i = 0; i < quantity; i++) {
    phagos.push(exports.newPhago(playerId));
  }
  return phagos;
}
