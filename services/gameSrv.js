'use strict';

exports.getRandomPhago = phagoFactory();
//FIXME I need some cleaning

exports.move = function(player, move, grid) {
  for (var i = 0; i < move.length; i++) {
    grid[move[i].y][move[i].x].player = player;
    move[i].position = grid[move[i].y][move[i].x].position;
  }

  // fagocitar(player, grid, move[0]);
  return move;
}

exports.createGame = function() {
  var game = {
    id: 1,
    sideSize: 20,
    phagoQuantity: 7,
    level: 10
  }

  game.grid = createNewGrid(game.sideSize);
  game.initialPhagos = {
    p1: getInitialPhagos(game.phagoQuantity),
    p2: getInitialPhagos(game.phagoQuantity)
  }

  return game;

  function getInitialPhagos(quantity) {
    var phagos = [];
    for(var i = 0; i < quantity; i++) {
      phagos.push(exports.getRandomPhago());
    }
    return phagos;
  }
}

/*function fagocitar(jogador, grid, pontoInicial) {
  function pontosAoRedor(ponto) {
    var pontos = [];

    if(ponto.x > 1) {
      pontos.push({x: ponto.x - 1, y: ponto.y});
    }
    if(ponto.x < game.sideSize) {
      pontos.push({x: ponto.x + 1, y: ponto.y});
    }
    if(ponto.y > 1) {
      pontos.push({x: ponto.x, y: ponto.y - 1});
    }
    if(ponto.y < game.sideSize) {
      pontos.push({x: ponto.x, y: ponto.y + 1});
    }
    return pontos;
  }

  Array.prototype.pIndexOf = function(p) {
    for (var i = 0; i < this.length; i++) {
      if (this[i].x == p.x && this[i].y == p.y) {
        return i;
      }
    }
    return -1;
  }

  var figura = [pontoInicial];

  for (var i = 0; i < figura.length; i++) {
    var ponto = figura[i];
    var proximosPontos = pontosAoRedor(ponto);

    proximosPontos.forEach((ponto) => {
      if(figura.pIndexOf(ponto) === -1 && grid[ponto.y][ponto.x].jogador === jogador) {
        figura.push(ponto);
      }
    });
  }

  var esquerdoAcima = cantoEsquerdoAcima(figura);
  var direitoAbaixo = cantoDireitoAbaixo(figura);

  var encontrouQuadradoCinza = false;
  for (var y = esquerdoAcima.y; y <= direitoAbaixo.y; y++) {
    for (var x = esquerdoAcima.x; x <= direitoAbaixo.x; x++) {
      if(!grid[y][x]) {
        encontrouQuadradoCinza = true;
        break;
      };
    }
    if(encontrouQuadradoCinza) {
      break;
    }
  }

  if(!encontrouQuadradoCinza) {
    for (var y = esquerdoAcima.y; y <= direitoAbaixo.y; y++) {
      for (var x = esquerdoAcima.x; x <= direitoAbaixo.x; x++) {
        grid[y][x].jogador = jogador; //inócuo
        $('#q' + grid[y][x].id).removeClass('ocupadop1');
        $('#q' + grid[y][x].id).removeClass('ocupadop2');
        $('#q' + grid[y][x].id).addClass('ocupado' + jogador);
      }
    }
  }
}*/

function createNewGrid(size) {
  var grid = [];

  var pos = 1;
  for (var y = 0; y < size + 1; y++) {
    grid.push([]);
    for (var x = 0; x < size + 1; x++) {
      if(x > 0 && y > 0) {
        grid[y][x] = {position: pos++};
      }
    }
  }

  return grid;
}

function phagoFactory() {
  var phagos = [];
  for(var i = 1; i < 10; i++) {
    for(var j = 1; j < 10; j++) {
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

  var dificuldade = 19;
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
