'use strict';

(function () {
  var jogador = "j1";
  var fagoSelecionado;

  $(window).load(() => {
    inicializarGrid();
    inicializarFagos();

    $('#grid').selectable({
      delay: 150,
      stop: aoSelecionar,
      disabled: true
    });

    $('.fagos').click((evento) => {
      var elemento = evento.toElement;
      if($(elemento).hasClass(jogador)) {
        selecionarFago(elemento);
      };
      // $(evento.toElement).slideUp();
    });
  });

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
    for (let i = 1; i <= 400; i++) {
      $('#grid').append('<li class="noselect opcao-grid" id=quadrado"' + i + '"></li>');
    }
  }

  function inicializarFagos() {
    $('#player1').append('<li class="j1 noselect">' + 12 + '</li>');
    $('#player1').append('<li class="j1 noselect">' + 8 + '</li>');
    $('#player1').append('<li class="j1 noselect">' + 6 + '</li>');
    $('#player2').append('<li class="j2 noselect">' + 8 + '</li>');
    $('#player2').append('<li class="j2 noselect">' + 6 + '</li>');
    $('#player2').append('<li class="j2 noselect">' + 12 + '</li>');
  }

  function obterNumeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
})();
