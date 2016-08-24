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
    // FIXME: update this code to current context
    // var blob = new Blob([d3.csv.format(_output)], {type: "text/csv; charset=UTF-8"})
    // saveAs(blob, 'output.csv')
  }

}]);
