'use strict';

var express = require('express');

var app = module.exports = express.Router();

var getRandomPhago = phagoFactory();

var game;

app.get('/', (req, res) => {
  if(!game) {
    game = createGame();
  }
  res.json(game);
});

app.post('/play', (req, res) => {
  console.log('points received ', req.body);
  res.sendStatus(200);
});

app.get('/randomPhago', (req, res) => {
  res.json(getRandomPhago());
});

function createGame() {
  var game = {
    id: 1,
    sideSize: 20,
    phagoQuantity: 7,
    level: 10
  }

  game.grid = createNewGrid(game.sideSize);
  game.initialPhagos = {
    j1: getInitialPhagos(game.phagoQuantity),
    j2: getInitialPhagos(game.phagoQuantity)
  }

  return game;

  function getInitialPhagos(quantity) {
    var phagos = [];
    for(var i = 0; i < quantity; i++) {
      phagos.push(getRandomPhago());
    }
    return phagos;
  }
}

function createNewGrid(size) {
  var grid = [];

  for (var y = 0; y < size + 1; y++) {
    grid.push([]);
    for (var x = 0; x < size + 1; x++) {
      grid[y][x] = "";
    }
  }

  return grid;
}

function phagoFactory() {
  var phagos = [];
  for(var i = 2; i < 10; i++) {
    for(var j = 2; j < 10; j++) {
      var produto = i * j;
      if(phagos.indexOf(produto) === -1) {
        phagos.push(produto);
      }
    }
  }

  var phagoFactory = [];
  phagoFactory = phagos.sort((a, b) => {
    if(a === b) { return 0; }

    return a < b ? -1 : 1;
  }).map((phago) => {
    return {phago: phago, peso: 90 - phago};
  });

  var dificuldade = 10;
  var getRandomPhago = (function () {
    var pesoTotal = phagoFactory.slice(0, dificuldade).reduce((acc, phago) => {
          return acc += phago.peso;
        }, 0);

    function obterNumeroAleatorio(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return function() {
      var pesoEscolhido = obterNumeroAleatorio(0, pesoTotal - 1);
      var phagoEscolhido = 0;
      for (var i = 0; i < phagoFactory.length; i++) {
        pesoEscolhido -= phagoFactory[i].peso;
        if(pesoEscolhido < 0) {
          phagoEscolhido = phagoFactory[i].phago;
          break;
        }
      }
      return phagoEscolhido;
    }
  })();

  return getRandomPhago;
}
