'use strict';

exports.getRandom = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.getRandomName = function() {
  var names = ['João', 'Enzo', 'Theo', 'Vitor', 'Gui', 'Iury', 'Van', 'Rafa'];
  return names[exports.getRandom(1, names.length) - 1];
}