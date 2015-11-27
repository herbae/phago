'use strict';

var _ = require('lodash');
var ws = require('ws');
var clients = [];

exports.connect = function (server) {
  var wss = new ws.Server({server: server});
  wss.on('connection', (ws) => {
    clients.push(ws);

    exports.broadcast('new client joined');

    console.log('a client connected - ', clients.length, 'clients connected');

    ws.on('close', () => {
      _.remove(clients, ws);
      console.log('a client disconnected - ', clients.length, 'clients connected');
    });
  });
}

exports.broadcast = function(topic, data) {
  var json = JSON.stringify({topic: topic, data: data});
  clients.forEach(function (client) {
    client.send(json);
  });
}
