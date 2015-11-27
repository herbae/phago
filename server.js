'use strict';

var express = require('express');
var websockets = require('./websockets');

var app = express();

app.use(express.static('./bower_components/jquery/dist'));
app.use(express.static('./bower_components/jquery-color'));
app.use(express.static('./bower_components/jquery-ui'));
app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.'});
});

var port = process.env.PORT || 5000;

var server = app.listen(port, () => {
  console.log('Phago is running on port', port);
});
websockets.connect(server);
