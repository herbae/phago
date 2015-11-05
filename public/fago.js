'use strict';

(function () {
  var jogadorAtivo = 'j1';
  var fagoSelecionado;
  var lado = 20;
  var fabricaFagos = [];
  var quantidadeFagos = 7;

  $(window).load(() => {
    inicializarGrid();
    inicializarFabricaFagos();

    $('#grid').selectable({
      delay: 150,
      stop: realizarJogada,
      selecting: calcularTamanhoRetangulo,
      unselecting: calcularTamanhoRetangulo,
      disabled: true
    });

    $('.fagos').click((evento) => {
      var elemento = evento.target;
      if(elemento.parentNode.id === jogadorAtivo) {
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

  function inicializarFabricaFagos() {
    var fagos = [];
    for(var i = 2; i < 10; i++) {
      for(var j = 2; j < 10; j++) {
        var produto = i * j;
        if(fagos.indexOf(produto) === -1) {
          fagos.push(produto);
        }
      }
    }

    fabricaFagos = fagos.sort((a, b) => {
      if(a === b) { return 0; }

      return a < b ? -1 : 1;
    }).map((fago) => {
      return {fago: fago, peso: 81 - fago};
    });

    preencherFagosIniciais('j1');
    preencherFagosIniciais('j2');

    function preencherFagosIniciais(jogador) {
      for(var i = 0; i < quantidadeFagos; i++) {
        criarFago(jogador);
      }
    }
  }

  function criarFago(jogador) {
    var fago = obterFagoAleatorio();
    var elemento = $('<li class="noselect">' + fago + '</li>');
    $('#' + jogador).append(elemento);
    elemento.slideDown();
  }

  function calcularTamanhoRetangulo(evento) {
    var selecting = $('.ui-selecting');
    var pontosSelecionados = [];
    for(var i = 0; i < selecting.length; i++) {
      pontosSelecionados.push(extrairPonto(selecting[i]));
    }

    if(pontosSelecionados.length !== 0) {
      mostrarConta(pontosSelecionados);
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

  function cantoDireitoAbaixo(figura) {
    return figura.reduce((canto, ponto) => {
      return {
        x: canto.x > ponto.x ? canto.x : ponto.x,
        y: canto.y > ponto.y ? canto.y : ponto.y
      };
    }, {x: 0, y: 0});
  }

  function cantoEsquerdoAcima(figura) {
    return figura.reduce((canto, ponto) => {
      return {
        x: canto.x < ponto.x ? canto.x : ponto.x,
        y: canto.y < ponto.y ? canto.y : ponto.y
      };
    }, {x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY});
  }

  function mostrarConta(pontosSelecionados) {
    var menor = cantoEsquerdoAcima(pontosSelecionados);
    var maior = cantoDireitoAbaixo(pontosSelecionados);

    var x = maior.x - menor.x + 1;
    var y = maior.y - menor.y + 1;
    $('#conta').text(x + " x " + y + " = " + x * y);
  }

  function selecionarFago(fago) {
    fagoSelecionado = fago;
    $('.fagos li').removeClass('selecionado');
    $(fago).addClass('selecionado');
    $('#grid').selectable('enable');
  }

  function realizarJogada(event) {
    if(!fagoSelecionado) {
      return;
    }

    $('#conta').text("");
    var quadradosSelecionados = $('.ui-selected');
    var produtoSelecionado = $(fagoSelecionado).text();
    if(!(produtoSelecionado == quadradosSelecionados.size())
      || quadradosSelecionados.hasClass('ocupado')) {
      $('#grid li').removeClass('ui-selected');
      return;
    };

    $(fagoSelecionado).slideUp();
    criarFago(jogadorAtivo);

    var pontoInicial = preencherQuadradosOcupados(jogadorAtivo);
    var grid = montarGrid();
    fagocitar(jogadorAtivo, grid, pontoInicial);
    contarPontos(grid);

    jogadorAtivo = jogadorAtivo === 'j1' ? 'j2' : 'j1';
    limparJogada();
  }

  function contarPontos(grid) {
    var placarJ1 = 0;
    var placarJ2 = 0;

    for (var y = 0; y < lado + 1; y++) {
      for (var x = 0; x < lado + 1; x++) {
        if(grid[y][x].jogador === "j1") {
          placarJ1++;
        } else if(grid[y][x].jogador === "j2") {
          placarJ2++;
        }
      }
    }

    $('#placar-j1').text(placarJ1);
    $('#placar-j2').text(placarJ2);
  }

  function preencherQuadradosOcupados(jogador) {
    var selecionados = $('#grid .ui-selected');

    selecionados.addClass('ocupado');
    selecionados.addClass('ocupado' + jogador);

    var pontoInicial = extrairPonto(selecionados[0]);

    return pontoInicial;
  }

  function fagocitar(jogador, grid, pontoInicial) {
    function pontosAoRedor(ponto) {
      var pontos = [];

      if(ponto.x > 1) {
        pontos.push({x: ponto.x - 1, y: ponto.y});
      }
      if(ponto.x < lado) {
        pontos.push({x: ponto.x + 1, y: ponto.y});
      }
      if(ponto.y > 1) {
        pontos.push({x: ponto.x, y: ponto.y - 1});
      }
      if(ponto.y < lado) {
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
          $('#q' + grid[y][x].id).removeClass('ocupadoj1');
          $('#q' + grid[y][x].id).removeClass('ocupadoj2');
          $('#q' + grid[y][x].id).addClass('ocupado' + jogador);
        }
      }
    }
  }

  function montarGrid() {
    var grid = [];

    for (var y = 0; y < lado + 1; y++) {
      grid.push([]);
      for (var x = 0; x < lado + 1; x++) {
        grid[y][x] = "";
      }
    }

    var selecionados = $('#grid .ocupado');

    for (var i = 0; i < selecionados.length; i++) {
      var posicao = extrairPosicao(selecionados[i]);
      var ponto = extrairPonto(selecionados[i]);
      var jogador = $(selecionados[i]).hasClass("ocupadoj1") ? "j1" : "j2";
      grid[ponto.y][ponto.x] = {id: posicao, jogador: jogador};
    }

    return grid;
  }

  function limparJogada() {
    fagoSelecionado = undefined;
    $('#grid li').removeClass('ui-selected');
    $('#grid').selectable('disable');
  }

  function obterFagoAleatorio() {
    return fabricaFagos[obterNumeroAleatorio(0, fabricaFagos.length - 1)].fago;
  }

  function obterNumeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
})();
