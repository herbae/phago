'use strict';

var express = require('express');

var app = module.exports = express.Router();

var obterFagoAleatorio = fabricaFagos();

app.get('/randomPhago', (req, res) => {
  res.json(obterFagoAleatorio());
});

function fabricaFagos() {
  var fagos = [];
  for(var i = 2; i < 10; i++) {
    for(var j = 2; j < 10; j++) {
      var produto = i * j;
      if(fagos.indexOf(produto) === -1) {
        fagos.push(produto);
      }
    }
  }

  var fabricaFagos = [];
  fabricaFagos = fagos.sort((a, b) => {
    if(a === b) { return 0; }

    return a < b ? -1 : 1;
  }).map((fago) => {
    return {fago: fago, peso: 90 - fago};
  });

  var dificuldade = 10;
  var obterFagoAleatorio = (function () {
    var pesoTotal = fabricaFagos.slice(0, dificuldade).reduce((acc, fago) => {
          return acc += fago.peso;
        }, 0);

    function obterNumeroAleatorio(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return function() {
      var pesoEscolhido = obterNumeroAleatorio(0, pesoTotal - 1);
      var fagoEscolhido = 0;
      for (var i = 0; i < fabricaFagos.length; i++) {
        pesoEscolhido -= fabricaFagos[i].peso;
        if(pesoEscolhido < 0) {
          fagoEscolhido = fabricaFagos[i].fago;
          break;
        }
      }
      return fagoEscolhido;
    }
  })();

  return obterFagoAleatorio;
}
