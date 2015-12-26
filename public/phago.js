'use strict';

(function () {
  var PING_INTERVAL = 10 * 1000;
  var FADE_OUT_TIME = 2 * 1000;

  var thisPlayer;
  var selectedPhago;
  var connection;
  var game;
  var myId;

  $(window).load(() => {
    $('#start').click(() => {
      connect($('#name').val());
      $('#start').html('Waiting for opponent...').prop('disabled', true);
    });

    $('#over').dialog({modal: true, dialogClass: "no-close"});
  });

  function connect(username) {
    connection = new WebSocket(websocketHost())
    connection.onopen = function () {
      console.log('Websocket connected');

      connection.send(JSON.stringify({topic: 'join-game', data: {name: username}}));

      keepAlive();
      function keepAlive() {
        setTimeout(() => {
          connection.send(JSON.stringify({topic: 'ping'}));
          keepAlive();
        }, PING_INTERVAL);
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
  }

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
      case 'move':
        renderMove(payload.data.player, payload.data.move);
        break;
      case 'new-phago':
        pushPhago(payload.data.player, payload.data.phago);
        break;
      case 'remove-phago':
        removePhago(payload.data);
        break;
      case 'score':
        updateScore(payload.data);
        break;
      default:
        console.log('unexpected data received', payload)
        break;
    }
  }

  function updateScore(score) {
    $('#score-p1').text(score.p1);
    $('#score-p2').text(score.p2);
  }

  function removePhago(phagoId) {
    $('#' + phagoId).slideUp();
  }

  function initializeGame(newGame) {
    game = newGame;
    if(game.p1.id === myId) {
      thisPlayer = 'p1';
    } else {
      thisPlayer = 'p2';
    }
    console.log('i am', thisPlayer);
    $('#name-' + game.activePlayer).addClass('active');
    $('#name-p1').text(game.p1.name);
    $('#name-p2').text(game.p2.name);

    initializePanel();
    initializePhagos();

    $("#over").dialog("close");
  }

  function initializePanel() {
    for (var i = 1; i <= (game.sideSize * game.sideSize); i++) {
      $('#panel').append('<li class="noselect" id="q' + i + '"></li>');
    }
    $('#panel').css('width', (game.sideSize * 2) + 'em');
    $('#panel li').addClass('image-transition');
    $('#panel').selectable({
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
      if(element.parentNode.id === 'phagos-' + thisPlayer) {
        selectPhago(element);
      };
    });

    pushInitialPhagos('p1');
    pushInitialPhagos('p2');

    function pushInitialPhagos(player) {
      var phagos = game[player].initialPhagos;
      for(var i = 0; i < phagos.length; i++) {
        pushPhago(player, phagos[i]);
      }
    }
  }

  function pushPhago(player, phago) {
    var element = $('<li id="' + phago.id + '" class="noselect">' + phago.phago + '</li>');
    $('#phagos-' + player).append(element);
    element.slideDown();
  }

  function calcularTamanhoRetangulo() {
    var selecting = $('.ui-selecting');
    var upperLeft = {x: game.sideSize + 1, y: game.sideSize + 1};
    var lowerRight = {x: 0, y: 0};
    for(var i = 0; i < selecting.length; i++) {
      var point = extrairPonto(selecting[i]);
      if(point.x < upperLeft.x) {upperLeft.x = point.x};
      if(point.x > lowerRight.x) {lowerRight.x = point.x};
      if(point.y < upperLeft.y) {upperLeft.y = point.y};
      if(point.y > lowerRight.y) {lowerRight.y = point.y};
    }

    var x = lowerRight.x - upperLeft.x + 1;
    var y = lowerRight.y - upperLeft.y + 1;

    $('#helper').text(x + " x " + y + " = " + x * y);
    $('#helper').show();
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

  function selectPhago(phago) {
    selectedPhago = phago;
    $('.phagos li').removeClass('selected');
    $(phago).addClass('selected');
    $('#panel').selectable('enable');
  }

  function realizarJogada(event) {
    if(!selectedPhago) {
      return;
    }

    $('#helper').fadeOut(FADE_OUT_TIME);
    var quadradosSelecionados = $('.ui-selected');
    var produtoSelecionado = $(selectedPhago).text();
    if(!(produtoSelecionado == quadradosSelecionados.size())
      || quadradosSelecionados.hasClass('taken')) {
      $('#panel li').removeClass('ui-selected');
      return;
    };

    var selecionados = $('#panel .ui-selected');

    var move = [];
    for (var i = 0; i < selecionados.length; i++) {
      move.push(extrairPonto(selecionados[i]));
    }

    var phagoId = $(selectedPhago)[0].id;

    connection.send(JSON.stringify({topic: 'move', data: {phagoId: phagoId, move: move}}));

    limparJogada();
  }

  function renderMove(player, move) {
    for (var i = 0; i < move.length; i++) {
      var element = '#q' + move[i].position;
      $(element).removeClass('takenp1');
      $(element).removeClass('takenp2');
      $(element).addClass('taken');
      $(element).addClass('taken' + player);
    }

    $('#name-' + game.activePlayer).removeClass('active');
    game.activePlayer = player === 'p1' ? 'p2' : 'p1';
    $('#name-' + game.activePlayer).addClass('active');
  }

  function limparJogada() {
    selectedPhago = undefined;
    $('#panel li').removeClass('ui-selected');
    $('#panel').selectable('disable');
  }
})();
