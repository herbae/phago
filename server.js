'use strict';

var express = require('express');
var websockets = require('./websockets');

var app = express();

app.use(require('./controllers'));

var port = process.env.PORT || 5000;

var server = app.listen(port, () => {
  console.log('Phago is running on port', port);
});
websockets.connect(server);
