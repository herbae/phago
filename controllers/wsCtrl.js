'use strict';

var _ = require('lodash');
var gameCtrl = require('./gameCtrl');
var util = require('../services/util');


module.exports = (function() {
  var clients = [];

  function send(client, topic, data) {
    client.send(JSON.stringify({topic: topic, data: data}));
  }

  function broadcast(game, topic, data) {
    clients.filter((c) => {
      return game.p1.id === c.id || game.p2.id === c.id;
    }).forEach((c) => {
      send(c, topic, data);
    });
  }

  return {
    welcomeNewPlayer: function(ws) {
      ws.id = util.getRandom(10000, 90000); //TODO generate better id
      send(ws, 'your-id', ws.id);
      clients.push(ws);
    },

    joinGame: function(ws) {
      ws.game = gameCtrl.joinGame(ws.id);
      if(ws.game.p1 && ws.game.p2) {
        broadcast(ws.game, 'new-game', ws.game);
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
          var move = gameCtrl.playerMove(ws.id, clientMove.move);
          var phago = gameCtrl.newPhago(ws.id);

          broadcast(ws.game, 'move', {player: player, move: move});
          broadcast(ws.game, 'new-phago', {player: player, phago: phago});
          broadcast(ws.game, 'remove-phago', clientMove.phagoId);

          break;
        case 'ping':
        default:
          break;
      }
    }
  }
})();