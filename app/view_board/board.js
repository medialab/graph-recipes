'use strict';

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

  $scope.pickRecipe = function(r) {
    $scope.recipe = r
    $http.get('recipes/'+r.file).then(function (data) {
      $timeout(function(){
        // INITIALIZATION
        if(data.data){
          document.querySelector('#js-editor').textContent = data.data
        }
        // Init Ace JS editor panel
        // Note: we keep editor in global scope to be able to edit settings from the console
        window.editor = ace.edit("js-editor");
        window.editor.setTheme("ace/theme/chrome");
        window.editor.setFontSize(14)
        window.editor.getSession().setMode("ace/mode/javascript");
      })
    })
  }

  $scope.closeRecipe = function() {
    $scope.recipe = undefined
  }

  // Init
  $scope.filename = store.get('graphname')
  $scope.originalGraph = store.get('graph')
  $scope.refreshGraph()

  // Processing

}]);
