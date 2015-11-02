'use strict';

(function () {
  var jogador = 'j1';
  var fagoSelecionado;
  var numSelecionado = [];
  var lado = 20;
  var fagos = [];

  $(window).load(() => {
    inicializarGrid();
    inicializarFagos();

    $('#grid').selectable({
      delay: 150,
      stop: aoSelecionar,
      selecting: mostrarLados,
      unselecting: mostrarLados,
      disabled: true
    });

    $('.fagos').click((evento) => {
      var elemento = evento.toElement;
      if($(elemento).hasClass(jogador)) {
        selecionarFago(elemento);
      };
    });
  });

  function inicializarFagos() {
    for(var i = 2; i < 10; i++) {
      for(var j = 2; j < 10; j++) {
        var produto = i * j;
        if(fagos.indexOf(produto) === -1) {
          fagos.push(produto);
        }
      }
    }

    fagos = fagos.sort((a, b) => {
      if(a === b) { return 0; }

      return a < b ? -1 : 1;
    });

    preencherFagosIniciais('j1');
    preencherFagosIniciais('j2');

    function preencherFagosIniciais(jogador) {
      for(var i = 0; i < 3; i++) {
        var fago = fagos[obterNumeroAleatorio(0, fagos.length - 1)];
        $('#' + jogador).append('<li noselect">' + fago + '</li>');
      }
    }
  }

  function mostrarLados(evento) {
    var selecting = $('.ui-selecting');
    numSelecionado.length = 0;
    for(var i = 0; i < selecting.length; i++) {
      numSelecionado.push(Number.parseInt(selecting[i].id.substring(1)));
    }

    if(numSelecionado.length !== 0) {
      calculaConta();
    }
  }

  function calculaConta() {
    var menor = menor(numSelecionado);
    var maior = maior(numSelecionado);

    var x1 = menor % lado;
    var x2 = maior % lado;
    var y1 = Math.floor(menor / lado) + 1;
    var y2 = Math.floor(maior / lado) + 1;

    var x = x2 - x1 + 1;
    var y = y2 - y1 + 1;
    $('#conta').text(x + " x " + y);

    function menor(conjunto) {
      return conjunto.reduce((acc, num) => {
        return acc >= num ? num : acc;
      });
    }

    function maior(conjunto) {
      return conjunto.reduce((acc, num) => {
        return acc <= num ? num : acc;
      });
    }
  }

  function selecionarFago(fago) {
    fagoSelecionado = fago;
    $('.' + jogador).removeClass('selecionado');
    $(fago).addClass('selecionado');
    $('#grid').selectable('enable');
  }

  function aoSelecionar(event) {
    if(!fagoSelecionado) {
      return;
    }

    $('#conta').text("");
    numSelecionado.length = 0;
    if(!($(fagoSelecionado).text() == $('.ui-selected').size())) {
      $('#grid li').removeClass('ui-selected');
      return;
    };
    if(jogador === 'j1') {
      jogador = 'j2';
      $('#grid .ui-selected').css('background', 'rgba(0, 0, 255, 0.8)');
    } else {
      jogador = 'j1';
      $('#grid .ui-selected').css('background', 'rgba(255, 0, 0, 0.8)');
    }
    $(fagoSelecionado).slideUp();
    fagoSelecionado = undefined;
    $('#grid').selectable('disable');
  }

  function inicializarGrid() {
    for (let i = 1; i <= (lado * lado); i++) {
      $('#grid').append('<li class="noselect opcao-grid" id="q' + i + '"></li>');
    }
    $('#grid').css('width', (lado * 2 * 1.1) + 'em');
  }

  function obterNumeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
})();
