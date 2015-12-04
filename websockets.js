'use strict';

var _ = require('lodash');
var ws = require('ws');
var gameSrv = require('./services/gameSrv');
var util = require('./services/util');
var clients = [];
var games = [];

exports.connect = function (server) {
  var wss = new ws.Server({server: server});
  wss.on('connection', (ws) => {
    clients.push(ws);

    console.log('a client connected - ', clients.length, 'clients connected');
    ws.id = util.getRandom(10000, 90000); //TODO generate better id
    ws.send(JSON.stringify({topic: 'your-id', data: ws.id}));
    ws.game = joinGame(ws.id);
    ws.send(JSON.stringify({topic: 'new-game', data: ws.game}));

    ws.on('message', function incoming(message) {
      resolve(ws, JSON.parse(message));
    });

    ws.on('close', () => {
      _.remove(clients, ws);
      console.log('a client disconnected - ', clients.length, 'clients connected');
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
        var move = gameSrv.move(ws.id, message.data);
        ws.send(JSON.stringify({topic: 'move', data: move}));
        break;
      default:
        break;
    }
  }
}

exports.broadcast = function(topic, data) {
  var json = JSON.stringify({topic: topic, data: data});
  clients.forEach(function (client) {
    client.send(json);
  });
}
