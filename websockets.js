'use strict';

var _ = require('lodash');
var ws = require('ws');
var gameSrv = require('./services/gameSrv');
var util = require('./services/util');
var games = [];
var clients = [];

exports.connect = function (server) {
  var wss = new ws.Server({server: server});
  wss.on('connection', (ws) => {
    clients.push(ws);
    ws.id = util.getRandom(10000, 90000); //TODO generate better id
    ws.send(JSON.stringify({topic: 'your-id', data: ws.id}));
    ws.game = joinGame(ws.id);
    if(ws.game.p1 && ws.game.p2) {
      clients.filter((c) => {
        return c.id === ws.game.p1.id || c.id === ws.game.p2.id;
      }).forEach((c) => {
        c.send(JSON.stringify({topic: 'new-game', data: ws.game}));
      });
    }

    ws.on('message', function incoming(message) {
      resolve(ws, JSON.parse(message));
    });

    ws.on('close', () => {
      _.remove(clients, ws);
    });
  });

  function joinGame(playerId) {
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

  function resolve(ws, message) {
    switch (message.topic) {
      case 'move':
        var player = ws.game.p1.id === ws.id ? 'p1' : 'p2';
        var clientMove = message.data;
        var move = gameSrv.move(player, clientMove, ws.game.grid);
        var phago = gameSrv.getRandomPhago();
        //TODO improve this player search (maybe change to {game.ws.p1 & game.ws.p2})
        clients.filter((c) => {
          return c.id === ws.game.p1.id || c.id === ws.game.p2.id;
        }).forEach((c) => {
          c.send(JSON.stringify({topic: 'move', player: player, move: move, phago: clientMove.length}));
          c.send(JSON.stringify({topic: 'new-phago', player: player, phago: phago}));
        });
        break;
      case 'ping':
      default:
        break;
    }
  }
}
