'use strict';

var gexf = require('graphology-gexf');
var isNumeric = require('../utils.js').isNumeric;

angular.module('graphrecipes.view_board', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/board', {
    templateUrl: 'view_board/board.html',
    controller: 'BoardCtrl'
  });
}])

.controller('BoardCtrl', ['$scope', '$timeout',  'store', '$location', 'recipesList', '$http'
  ,function(               $scope ,  $timeout ,   store ,  $location,   recipesList ,  $http) {

  // Scope variables
  $scope.filename
  $scope.originalGraph
  $scope.nodesCount
  $scope.edgesCount
  $scope.recipes = recipesList
  $scope.recipe = undefined
  $scope.lcdStatus = 'choose-recipe'
  $scope.status = 'list' // list | edit | run | end

  // Scope functions
  $scope.refreshGraph = function () {
    window.g = $scope.originalGraph
    if (window.g) {
      $scope.nodesCount = g.order
      $scope.edgesCount = g.size

      $scope.description = g.multi ? 'Multi ' : 'Simple '
      $scope.description += g.type + ' graph'
    } else {
      $timeout(function(){
        $location.url('/upload')
      }, 0)
    }
  }

  $scope.downloadOutput = function () {
    var xml = gexf.write(g);

    var blob = new Blob([xml], {'type':'text/gexf+xml;charset=utf-8'});
    saveAs(blob, store.get('graphname') + " via Graph Recipes.gexf");
  }

  $scope.pickRecipe = function(r) {
    $scope.lcdStatus = 'edit-script'
    $scope.recipe = r
    $scope.status = 'edit'
    $scope.remindRecipe = false
  }

   $scope.backToRecipe = function() {
    $scope.lcdStatus = 'edit-script'
    $scope.status = 'edit'
    $scope.remindRecipe = true
  }

  $scope.closeRecipe = function() {
    $scope.recipe = undefined
    $scope.lcdStatus = 'choose-recipe'
    $scope.status = 'list'
  }

  $scope.executeScript = function() {
    $scope.lcdStatus = 'cooking'
    $scope.status = 'run'
    $timeout(function(){
      document.querySelector('#playground').innerHTML = ''
      var code = window.editor.getValue()
      try {
        eval(';(function(){'+code+'})();')
        $scope.lcdStatus = 'service'
        $scope.status = 'end'

        // Stop after a while
        $timeout(function(){
          if ($scope.lcdStatus == 'service')
            $scope.lcdStatus = 'choose-recipe'
        }, 4000)
      } catch(e) {
        $scope.lcdStatus = 'error'
        console.error('[Script error]', e)
        $timeout(function(){
          alert('Merde :(\nThere is an issue with this script:\n\n' + e)
          $scope.backToRecipe()
        })
      }
    }, 4000)
  }

  // Init
  $scope.filename = store.get('graphname')
  $scope.originalGraph = store.get('graph')
  $scope.refreshGraph()

  // Processing

}]);
