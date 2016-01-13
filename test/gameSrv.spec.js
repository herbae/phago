'use strict';

var expect = require('chai').expect;
var srv = require('../services/gameSrv');

describe('GameService', function() {
  describe('Simple Moves', function() {
    var grid;

    beforeEach('Set up grid', function() {
      //phago 2x2 grid - positions (0,0), (0,1), (1,0) are discarded
      grid = [,
        [,{},{}],
        [,{},{}]
      ];
    });

    it('should fill the grid with a simple 1x1 move', function () {
      var player = 'p1';
      var move = [{x:1, y:1}];

      srv.move(player, move, grid);
      expect(grid[1][1]).to.deep.equal({player: 'p1'});
    });

    it('should allow player 2 to make a simple move as well', function () {
      var player = 'p2';
      var move = [{x:1, y:1}];

      srv.move(player, move, grid);
      expect(grid[1][1]).to.deep.equal({player: 'p2'});
    });

    it('should let a 2x2 move fill the grid smoothly', function () {
      var player = 'p1';
      var move = [{x:1, y:1}, {x:1, y:2}, {x:2, y:1}, {x:2, y:2}];

      srv.move(player, move, grid);

      var p = {player: 'p1'};
      expect(grid).to.deep.equal([,
        [,p,p],
        [,p,p]
      ]);
    });

    it('should not allow player to fill y position outside the grid', function () {
      var player = 'p1';
      var move = [{x:1, y:3}];

      expect(srv.move.bind(srv, player, move, grid)).to.throw('Invalid move');
    });

    it('should not allow player to fill x position outside the grid', function () {
      var player = 'p1';
      var move = [{x:4, y:2}];

      expect(srv.move.bind(srv, player, move, grid)).to.throw('Invalid move');
    });

  });
});
