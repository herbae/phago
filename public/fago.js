'use strict';

(function () {
  var jogador = 'j1';
  var fagoSelecionado;
  var numSelecionado = [];
  var lado = 20;
  var fagoMaximo = 10;
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
      if(elemento.parentNode.id === jogador) {
        selecionarFago(elemento);
      };
    });
  });

  function inicializarGrid() {
    for (var i = 1; i <= (lado * lado); i++) {
      $('#grid').append('<li class="noselect opcao-grid" id="q' + i + '"></li>');
    }
    $('#grid').css('width', (lado * 2 * 1.1) + 'em');
  }

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
        criarFago(jogador);
      }
    }
  }

  function criarFago(jogador) {
    var fago = fagos[obterNumeroAleatorio(0, fagoMaximo)];
    var elemento = $('<li noselect">' + fago + '</li>');
    $('#' + jogador).append(elemento);
    elemento.slideDown();
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

    numSelecionado.length = 0;
    $('#conta').text("");
    var quadradosSelecionados = $('.ui-selected');
    var produtoSelecionado = $(fagoSelecionado).text();
    if(!(produtoSelecionado == quadradosSelecionados.size())
      || quadradosSelecionados.hasClass('ocupado')) {
      $('#grid li').removeClass('ui-selected');
      return;
    };

    $(fagoSelecionado).slideUp();
    criarFago(jogador);
    $('#grid .ui-selected').addClass('ocupado');
    $('#grid .ui-selected').addClass('ocupado' + jogador);
    if(jogador === 'j1') {
      jogador = 'j2';
    } else {
      jogador = 'j1';
    }
    selecionarProximoFago();
  }

  function selecionarProximoFago() {
    fagoSelecionado = undefined;
    $('#grid li').removeClass('ui-selected');
    $('#grid').selectable('disable');
  }

  function obterNumeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
})();
