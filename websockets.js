'use strict';

var _ = require('lodash');
var ws = require('ws');
var gameSrv = require('./services/gameSrv');
var gameCtrl = require('./controllers/gameCtrl');
var util = require('./services/util');
var wsCtrl = wsCtrl();

exports.connect = function (server) {
  var wss = new ws.Server({server: server});
  wss.on('connection', (ws) => {
    wsCtrl.welcomeNewPlayer(ws);
    wsCtrl.joinGame(ws);

    ws.on('message', function incoming(message) {
      wsCtrl.resolve(ws, message);
    });

    ws.on('close', () => {
      wsCtrl.shutdownGame(ws);
    });
  });
}

function wsCtrl() {
  var clients = [];

  function sendMessage(game, topic, data) {
    clients.filter((c) => {
      return c.id === game.p1.id || c.id === game.p2.id;
    }).forEach((c) => {
      c.send(JSON.stringify({topic: topic, data: data}));
    });
  }

  return {
    welcomeNewPlayer: function(ws) {
      ws.id = util.getRandom(10000, 90000); //TODO generate better id
      ws.send(JSON.stringify({topic: 'your-id', id: ws.id}));
      clients.push(ws);
    },

    joinGame: function(ws) {
      ws.game = gameCtrl.joinGame(ws.id);
      if(ws.game.p1 && ws.game.p2) {
        sendMessage(ws.game, 'new-game', ws.game);
      }
    },

    shutdownGame: function(ws) {
      //TODO: properly communicate clients about game ending
      _.remove(clients, ws);
    },

    resolve: function(ws, strMessage) {
      var message = JSON.parse(strMessage);
      switch (message.topic) {
        case 'move':
          var player = ws.game.p1.id === ws.id ? 'p1' : 'p2';
          var clientMove = message.data;
          var move = gameSrv.move(player, clientMove, ws.game.grid);
          var phago = gameSrv.getRandomPhago();
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
}
