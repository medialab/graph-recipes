'use strict';

angular.module('graphrecipes.view_board', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/board', {
    templateUrl: 'view_board/board.html',
    controller: 'BoardCtrl'
  });
}])

.controller('BoardCtrl', ['$scope', '$timeout',  'store', '$location', 'recipesList'
  ,function(               $scope ,  $timeout ,   store ,  $location,   recipesList ) {
  
  // Scope variables
  $scope.filename
  $scope.originalGraph
  $scope.nodesCount
  $scope.edgesCount
  $scope.recipes = recipesList

  // Scope functions
  $scope.refreshGraph = function () {
    window.g = $scope.originalGraph
    if (window.g) {
      $scope.nodesCount = g.order
      $scope.edgesCount = g.size
    } else {
      $timeout(function(){
        $location.url('/upload')
      }, 0)
    }
  }

  $scope.downloadOutput = function () {
    var blob = new Blob(json_graph_api.buildGEXF(window.g), {'type':'text/gexf+xml;charset=utf-8'});
    saveAs(blob, store.get('graphname') + " (edited).gexf");
  }

  // Init
  $scope.filename = store.get('graphname')
  $scope.originalGraph = store.get('graph')
  $scope.refreshGraph()

  // Processing

}]);
