'use strict';

(function () {
  var player;
  var selectedPhago;
  var connection;
  var game;
  var myId;

  $(window).load(() => {
    connection = new WebSocket(websocketHost())
    connection.onopen = function () {
      console.log('Websocket connected');
    }
    connection.onmessage = function (e) {
      resolve(JSON.parse(e.data));
    }

    function websocketHost() {
      if(window.location.protocol === 'https:') {
        return 'wss://' + window.location.host;
      } else {
        return 'ws://' + window.location.host;
      }
    }
  });

  function resolve(payload) {
    switch(payload.topic) {
      case 'your-id':
        console.log('my id is', payload.data);
        myId = payload.data;
        break;
      case 'new-game':
        console.log('starting new game', payload.data);
        initializeGame(payload.data);
        break;
      default:
        console.log('unexpected data received', payload)
        break;
    }
  }

  function initializeGame(newGame) {
    game = newGame;
    if(game.p1.id === myId) {
      player = 'p1';
    } else {
      player = 'p2';
    }
    console.log('i am', player);
    $('#name-' + player).addClass('active');
    $('#name-p1').text(game.p1.name);
    $('#name-' + player).text(game[player].name);

    initializePanel();
    initializePhagoFactory();
  }

  function initializePanel() {
    for (var i = 1; i <= (game.sideSize * game.sideSize); i++) {
      $('#painel').append('<li class="noselect" id="q' + i + '"></li>');
    }
    $('#painel').css('width', (game.sideSize * 2) + 'em');

    $('#painel').selectable({
      delay: 150,
      stop: realizarJogada,
      selecting: calcularTamanhoRetangulo,
      unselecting: calcularTamanhoRetangulo,
      disabled: true
    });
  }

  function initializePhagoFactory() {
    $('.phagos').click((evento) => {
      var elemento = evento.target;
      if(elemento.parentNode.id === player) {
        selectPhago(elemento);
      };
    });

    pushInitialPhagos('p1');
    pushInitialPhagos('p2');

    function pushInitialPhagos(jogador) {
      var phagos = game.initialPhagos[jogador];
      for(var i = 0; i < phagos.length; i++) {
        pushPhago(jogador, phagos[i]);
      }
    }
  }

  function pushPhago(jogador, phago) {
    var elemento = $('<li class="noselect">' + phago + '</li>');
    $('#' + jogador).append(elemento);
    elemento.slideDown();
  }

  function pushRandomPhago(jogador) {
    $.get('/api/game/randomPhago').done((phago) => {
      pushPhago(jogador, phago);
    });
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
    var x = (posicao % game.sideSize) + 1;
    var y = Math.floor(posicao / game.sideSize) + 1;
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
    $('#conta').show();
  }

  function selectPhago(phago) {
    selectedPhago = phago;
    $('.phagos li').removeClass('selecionado');
    $(phago).addClass('selecionado');
    $('#painel').selectable('enable');
  }

  function realizarJogada(event) {
    if(!selectedPhago) {
      return;
    }

    $('#conta').fadeOut(2000);
    var quadradosSelecionados = $('.ui-selected');
    var produtoSelecionado = $(selectedPhago).text();
    if(!(produtoSelecionado == quadradosSelecionados.size())
      || quadradosSelecionados.hasClass('ocupado')) {
      $('#painel li').removeClass('ui-selected');
      return;
    };

    $(selectedPhago).slideUp();
    pushRandomPhago(player);

    $('#painel li').addClass('color-transition');

    var selecionados = $('#painel .ui-selected');

    selecionados.addClass('ocupado');
    selecionados.addClass('ocupado' + player);

    var pontoInicial = extrairPonto(selecionados[0]);

    var pontos = [];
    for (var i = 0; i < selecionados.length; i++) {
      pontos.push(extrairPonto(selecionados[i]));
    }

    play(pontos);

    var grid = montarGrid();
    fagocitar(player, grid, pontoInicial);
    contarPontos(grid);

    player = player === 'p1' ? 'p2' : 'p1';
    limparJogada();
  }

  function play(points) {
    $.ajax({
      type: 'POST',
      data: JSON.stringify(points),
      contentType: 'application/json',
      url: '/api/game/play'
    });
  }

  function contarPontos(grid) {
    var placarP1 = 0;
    var placarP2 = 0;

    for (var y = 0; y < game.sideSize + 1; y++) {
      for (var x = 0; x < game.sideSize + 1; x++) {
        if(grid[y][x].jogador === "p1") {
          placarP1++;
        } else if(grid[y][x].jogador === "p2") {
          placarP2++;
        }
      }
    }

    $('#placar-p1').text(placarP1);
    $('#placar-p2').text(placarP2);
  }

  function fagocitar(jogador, grid, pontoInicial) {
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
  }

  function montarGrid() {
    var grid = [];

    for (var y = 0; y < game.sideSize + 1; y++) {
      grid.push([]);
      for (var x = 0; x < game.sideSize + 1; x++) {
        grid[y][x] = "";
      }
    }

    var selecionados = $('#painel .ocupado');

    for (var i = 0; i < selecionados.length; i++) {
      var posicao = extrairPosicao(selecionados[i]);
      var ponto = extrairPonto(selecionados[i]);
      var jogador = $(selecionados[i]).hasClass("ocupadop1") ? "p1" : "p2";
      grid[ponto.y][ponto.x] = {id: posicao, jogador: jogador};
    }

    return grid;
  }

  function limparJogada() {
    selectedPhago = undefined;
    $('#painel li').removeClass('ui-selected');
    $('#painel').selectable('disable');
    $('painel li').removeClass('color-transition');
  }
})();
