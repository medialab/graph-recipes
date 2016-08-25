'use strict';

angular.module('gsurgery.view_board', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/board', {
    templateUrl: 'view_board/board.html',
    controller: 'BoardCtrl'
  });
}])

.controller('BoardCtrl', ['$scope', '$timeout',  'store', '$location'
  ,function(               $scope ,  $timeout ,   store ,  $location) {
  
  // Scope variables
  $scope.filename
  $scope.originalGraph
  $scope.nodesCount
  $scope.edgesCount

  // Scope functions
  $scope.refreshGraph = function () {
    window.g = $scope.originalGraph
    if (window.g) {
      json_graph_api.buildIndexes(g)
      $scope.nodesCount = g.nodes.length
      $scope.edgesCount = g.edges.length
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
