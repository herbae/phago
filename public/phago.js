'use strict';

(function () {
  var thisPlayer;
  var selectedPhago;
  var connection;
  var game;
  var myId;

  $(window).load(() => {
    connection = new WebSocket(websocketHost())
    connection.onopen = function () {
      console.log('Websocket connected');

      keepAlive();
      function keepAlive() {
        setTimeout(() => {
          connection.send(JSON.stringify({topic: 'ping'}));
          keepAlive();
        }, 10000);
      }
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
        console.log('my id is', payload.id);
        myId = payload.id;
        break;
      case 'new-game':
        console.log('starting new game', payload.data);
        initializeGame(payload.data);
        break;
      case 'move':
        renderMove(payload.player, payload.move, payload.phago);
        break;
      case 'new-phago':
        pushPhago(payload.player, payload.phago);
        break;
      default:
        console.log('unexpected data received', payload)
        break;
    }
  }

  function initializeGame(newGame) {
    game = newGame;
    if(game.p1.id === myId) {
      thisPlayer = 'p1';
    } else {
      thisPlayer = 'p2';
    }
    console.log('i am', thisPlayer);
    $('#name-' + thisPlayer).addClass('active');
    $('#name-p1').text(game.p1.name);
    $('#name-p2').text(game.p2.name);

    initializePanel();
    initializePhagos();
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

  function initializePhagos() {
    $('.phagos').click((event) => {
      if(thisPlayer !== game.activePlayer) {
        return;
      }
      var element = event.target;
      if(element.parentNode.id === thisPlayer) {
        selectPhago(element);
      };
    });

    pushInitialPhagos('p1');
    pushInitialPhagos('p2');

    function pushInitialPhagos(player) {
      var phagos = game.initialPhagos[player];
      for(var i = 0; i < phagos.length; i++) {
        pushPhago(player, phagos[i]);
      }
    }
  }

  function pushPhago(player, phago) {
    var element = $('<li class="noselect">' + phago + '</li>');
    $('#' + player).append(element);
    element.slideDown();
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

    $('#painel li').addClass('color-transition');

    var selecionados = $('#painel .ui-selected');

    var move = [];
    for (var i = 0; i < selecionados.length; i++) {
      move.push(extrairPonto(selecionados[i]));
    }

    connection.send(JSON.stringify({topic: 'move', data: move}));

    /*********** old code ******/

    var grid = montarGrid();
    contarPontos(grid);

    limparJogada();
  }

//FIXME this belongs in server
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

  function renderMove(player, move, phago) {
    for (var i = 0; i < move.length; i++) {
      var element = '#q' + move[i].position;
      $(element).removeClass('ocupadop1');
      $(element).removeClass('ocupadop2');
      $(element).addClass('ocupado' + player);
    }

    if(game.activePlayer !== thisPlayer) {
      var phagos = $('#' + game.activePlayer + ' li');
      for (var i = 0; i < phagos.length; i++) {
        if($(phagos[i]).text() == phago) {
          $(phagos[i]).slideUp();
          break;
        }
      }
    }
    game.activePlayer = player === 'p1' ? 'p2' : 'p1';
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
