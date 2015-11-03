'use strict';

(function () {
  var jogador = 'j1';
  var fagoSelecionado;
  var numSelecionado = [];
  var lado = 20;
  var fagoMaximo = 5;
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
      var elemento = evento.target;
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
    var elemento = $('<li class="noselect">' + fago + '</li>');
    $('#' + jogador).append(elemento);
    elemento.slideDown();
  }

  function mostrarLados(evento) {
    var selecting = $('.ui-selecting');
    numSelecionado.length = 0;
    for(var i = 0; i < selecting.length; i++) {
      numSelecionado.push(extrairPosicao(selecting[i]));
    }

    if(numSelecionado.length !== 0) {
      calculaConta();
    }
  }

  function extrairPosicao(quadrado) {
    return Number.parseInt(quadrado.id.substring(1));
  }

  function extrairPonto(quadrado) {
    var posicao = extrairPosicao(quadrado) - 1;
    var x = (posicao % lado) + 1;
    var y = Math.floor(posicao / lado) + 1;
    return {x: x, y: y};
  }

  function calculaConta() {
    var menor = menor(numSelecionado) - 1;
    var maior = maior(numSelecionado) - 1;

    var x1 = (menor % lado) + 1;
    var x2 = (maior % lado) + 1;
    var y1 = Math.floor(menor / lado) + 1;
    var y2 = Math.floor(maior / lado) + 1;

    var x = x2 - x1 + 1;
    var y = y2 - y1 + 1;
    $('#conta').text(x + " x " + y + " = " + x * y);

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
    $('.fagos li').removeClass('selecionado');
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

    preencherQuadradosOcupados(jogador);
    atualizarPlacar(jogador, quadradosSelecionados.size());
    if(jogador === 'j1') {
      jogador = 'j2';
    } else {
      jogador = 'j1';
    }
    selecionarProximoFago();
  }

  function atualizarPlacar(jogador, quantidade) {
    var placar = Number.parseInt($('#placar-' + jogador).text());
    placar += quantidade;
    $('#placar-' + jogador).text(placar);
  }

  function preencherQuadradosOcupados(jogador) {
    var selecionados = $('#grid .ui-selected');

    selecionados.addClass('ocupado');
    selecionados.addClass('ocupado' + jogador);

    selecionados = $('#grid .ocupado' + jogador);

    var pontos = [];
    for (var i = 0; i < selecionados.length; i++) {
      var elemento = $(selecionados[i]);
      var ponto = extrairPonto(selecionados[i]);
      pontos.push(ponto);
    }

    var menorPonto = pontos.reduce((menorPonto, ponto) => {
      return {
        x: menorPonto.x < ponto.x ? menorPonto.x : ponto.x,
        y: menorPonto.y < ponto.y ? menorPonto.y : ponto.y
      };
    }, {x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY});

    var maiorPonto = pontos.reduce((maiorPonto, ponto) => {
      return {
        x: maiorPonto.x > ponto.x ? maiorPonto.x : ponto.x,
        y: maiorPonto.y > ponto.y ? maiorPonto.y : ponto.y
      };
    }, {x: 0, y: 0});

    selecionados = $('#grid .ocupado');

    var grid = montaGrid();
    for (var i = 0; i < selecionados.length; i++) {
      var posicao = extrairPosicao(selecionados[i]);
      var ponto = extrairPonto(selecionados[i]);
      grid[ponto.y][ponto.x] = {id: posicao};
    }

    var encontrouQuadradoCinza = false;
    for (var y = menorPonto.y; y <= maiorPonto.y; y++) {
      for (var x = menorPonto.x; x <= maiorPonto.x; x++) {
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
      for (var y = menorPonto.y; y <= maiorPonto.y; y++) {
        for (var x = menorPonto.x; x <= maiorPonto.x; x++) {
          $('#q' + grid[y][x].id).removeClass('ocupadoj1');
          $('#q' + grid[y][x].id).removeClass('ocupadoj2');
          $('#q' + grid[y][x].id).addClass('ocupado' + jogador);
        }
      }
    }

    function montaGrid() {
      var grid = [];

      for (var y = 0; y < lado + 1; y++) {
        grid.push([]);
        for (var x = 0; x < lado + 1; x++) {
          grid[y][x] = "";
        }
      }

      return grid;
    }
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
