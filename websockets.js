'use strict';

var _ = require('lodash');
var ws = require('ws');
var game = require('./services/gameSrv');
var clients = [];

exports.connect = function (server) {
  var wss = new ws.Server({server: server});
  wss.on('connection', (ws) => {
    clients.push(ws);

    exports.broadcast('new client joined');

    console.log('a client connected - ', clients.length, 'clients connected');

    ws.on('message', function incoming(message) {
      console.log('received: ', message);
      resolve(JSON.parse(message));
    });

    ws.on('close', () => {
      _.remove(clients, ws);
      console.log('a client disconnected - ', clients.length, 'clients connected');
    });
  });

  function resolve(message) {
    switch (message.topic) {
      case 'new-game':
        console.log('starting new game');
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
