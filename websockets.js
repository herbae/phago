'use strict';

var _ = require('lodash');
var ws = require('ws');
var util = require('./services/util');
var wsCtrl = require('./controllers/wsCtrl');

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
