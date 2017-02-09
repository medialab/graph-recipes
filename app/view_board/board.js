'use strict';

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
    } else {
      $timeout(function(){
        $location.url('/upload')
      }, 0)
    }
  }

  $scope.downloadOutput = function () {
    // Look at the attributes
    var attname

    var nAttributes = {}
    g.nodes().forEach(function(nid){
      var attributesObject = g.getNodeAttributes(nid)
      for (attname in attributesObject) {
        if (['x', 'y', 'color', 'label', 'size'].indexOf(attname) < 0) {
          var attvalue = attributesObject[attname]
          var atttype = nAttributes[attname]
          if (attvalue === true || attvalue === false) {
            attvalue = attvalue.toString()
          }
          if (isNumeric(+attvalue)) {
            if (Number.isInteger(+attvalue)) {
              // value is integer
              if (nAttributes[attname] != 'float' && nAttributes[attname] != 'string') {
                nAttributes[attname] = 'integer'
              }
            } else {
              // value is float
              if (nAttributes[attname] != 'string') {
                nAttributes[attname] = 'float'
              }
            }

          } else {
            nAttributes[attname] = 'string'
          }
        }
      }
    })

    var eAttributes = {}
    g.edges().forEach(function(eid){
      var attributesObject = g.getEdgeAttributes(eid)
      for (attname in attributesObject) {
        var attvalue = attributesObject[attname]
        var atttype = eAttributes[attname]
        if (attvalue === true || attvalue === false) {
          attvalue = attvalue.toString()
        }
        if (isNumeric(+attvalue)) {
          if (Number.isInteger(+attvalue)) {
            // value is integer
            if (eAttributes[attname] != 'float' && eAttributes[attname] != 'string') {
              eAttributes[attname] = 'integer'
            }
          } else {
            // value is float
            if (eAttributes[attname] != 'string') {
              eAttributes[attname] = 'float'
            }
          }

        } else {
          eAttributes[attname] = 'string'
        }
      }
    })

    // Build the attributes model
    var model = {node:[], edge:[]}
    var k
    var count = 0
    for (k in nAttributes) {
      count++
      var id = k.toLowerCase().replace(/[^a-z]/g, '') + '-' + count
      model.node.push({
        id: id,
        label: k,
        type: nAttributes[k]
      })
      nAttributes[k] = id
    }
    count = 0
    for (k in eAttributes) {
      count++
      var id = k.toLowerCase().replace(/[^a-z]/g, '') + '-' + count
      model.edge.push({
        id: id,
        label: k,
        type: eAttributes[k]
      })
      eAttributes[k] = id
    }

    // Write the GEXF
    // FIXME: register the type of network (oriented...)
    var myGexf = gexf.create({model:model})
    g.nodes().forEach(function(nid){
      var attributesObject = g.getNodeAttributes(nid)
      var n = {
        id: nid,
        viz: {
          position: {}
        }
      }

      if (attributesObject.hasOwnProperty('label')) {
        n.label = attributesObject.label
        delete attributesObject.label
      }

      if (attributesObject.hasOwnProperty('x')) {
        n.viz.position.x = attributesObject.x
        delete attributesObject.x
      }

      if (attributesObject.hasOwnProperty('y')) {
        n.viz.position.y = attributesObject.y
        delete attributesObject.y
      }

      if (attributesObject.hasOwnProperty('color')) {
        n.viz.color = attributesObject.color
        delete attributesObject.color
      }

      if (attributesObject.hasOwnProperty('size')) {
        n.size = attributesObject.size
        delete attributesObject.size
      }

      n.attributes = {}
      var k
      for (k in attributesObject) {
        n.attributes[nAttributes[k]] = attributesObject[k]
      }

      myGexf.addNode(n)
    });

    g.edges().forEach(function(eid){
      var attributesObject = g.getEdgeAttributes(eid)
      var e = {
        id: eid,
        source: g.source(eid),
        target: g.target(eid),
        viz: {
          position: {}
        }
      }

      e.attributes = {}
      var k
      for (k in attributesObject) {
        e.attributes[eAttributes[k]] = attributesObject[k]
      }
      myGexf.addEdge(e);
    })

    var blob = new Blob([myGexf.serialize()], {'type':'text/gexf+xml;charset=utf-8'});
    saveAs(blob, store.get('graphname') + " via Graph Recipes.gexf");
  }

  $scope.pickRecipe = function(r) {
    $scope.lcdStatus = 'edit-script'
    $scope.recipe = r
    $scope.status = 'edit'
  }

  $scope.closeRecipe = function() {
    $scope.recipe = undefined
    $scope.lcdStatus = 'choose-recipe'
    $scope.status = 'list'
  }

  $scope.codeKeyPress = function(e){
    if((e.which == 13 || e.which == 10) && (e.ctrlKey || e.shiftKey)){
      $scope.executeScript()
    }
  }

  $scope.executeScript = function() {
    $scope.lcdStatus = 'cooking'
    $scope.status = 'run'
    $timeout(function(){
      var code = window.editor.getValue()
      eval(';(function(){'+code+'})();')
      $scope.lcdStatus = 'service'
      $scope.status = 'end'
    }, 4000)
  }

  // Init
  $scope.filename = store.get('graphname')
  $scope.originalGraph = store.get('graph')
  $scope.refreshGraph()

  // Processing

}]);
