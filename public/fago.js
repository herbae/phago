'use strict';

(function () {
  var player = 1;

  $(window).load(() => {
    inicializarGrid();
    inicializarFagos();

      console.log($("#player1 li").hasClass("p1"));

    $('#grid').selectable({
      delay: 150,
      stop: aoSelecionar
    });

    $('.fagos').click((evento) => {
      var elemento = evento.toElement;
      if($(elemento).hasClass("p" + player)) {
        selecionarFago(elemento);
      };
      // $(evento.toElement).slideUp();
    });
  });

  function selecionarFago(fago) {
    $('.p' + player).css('background', 'blue');
    $('.p' + player).css('color', 'white');
    $(fago).css('background', 'rgba(0, 0, 255, 0.1)');
    $(fago).css('color', 'rgba(0, 0, 0, 0.1)');
  }

  function aoSelecionar(event) {
    if(player === 1) {
      player = 2;
      $('#grid .ui-selected').css('background', 'rgba(0, 0, 255, 0.8)');
    } else {
      player = 1;
      $('#grid .ui-selected').css('background', 'rgba(255, 0, 0, 0.8)');
    }
  }

  function inicializarGrid() {
    for (let i = 1; i <= 400; i++) {
      $('#grid').append('<li class="noselect opcao-grid" id=quadrado"' + i + '"></li>');
    }
  }

  function inicializarFagos() {
    $('#player1').append('<li class="p1 noselect">' + 12 + '</li>');
    $('#player1').append('<li class="p1 noselect">' + 8 + '</li>');
    $('#player1').append('<li class="p1 noselect">' + 6 + '</li>');
    $('#player2').append('<li class="p2 noselect">' + 8 + '</li>');
    $('#player2').append('<li class="p2 noselect">' + 6 + '</li>');
    $('#player2').append('<li class="p2 noselect">' + 12 + '</li>');
  }

  function obterNumeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
})();
