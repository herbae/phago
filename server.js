'use strict';

var express = require('express');

var app = express();

app.use(express.static('./bower_components/jquery/dist'));
app.use(express.static('./bower_components/jquery-color'));
app.use(express.static('./bower_components/jquery-ui'));
app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.'});
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Fago está rodando na porta 5000.');
});
