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
  
  // Init
  window.g = store.get('graph')
  if (g) {
    json_graph_api.buildIndexes(g)
  } else {
    $timeout(function(){
      $location.url('/upload')
    }, 0)
  }

  $scope.downloadOutput = function () {

    var blob = new Blob(json_graph_api.buildGEXF(window.g), {'type':'text/gexf+xml;charset=utf-8'});
    saveAs(blob, store.get('graphname') + " (edited).gexf");

  }

}]);
