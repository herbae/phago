'use strict';

var expect = require('chai').expect;
var srv = require('../services/gameSrv');

describe('GameService', function() {
  describe('Simple Moves', function() {
    var grid;

    beforeEach('Set up grid', function() {
      grid = [, [, {}]]; //phago 1x1 grid - 0 positions are discarded
    });

    it('should fill the grid with a simple 1x1 move', function () {
      var player = 'p1';
      var move = [{x: 1, y: 1}];

      srv.move(player, move, grid);
      expect(grid[1][1]).to.deep.equal({player: 'p1'});
    });
  });
});
