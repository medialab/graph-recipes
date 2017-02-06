'use strict';

// Declare app level module which depends on views, and components
angular.module('graphrecipes', [
  'ngRoute',
  'ngMaterial',
  'graphrecipes.view_upload',
  'graphrecipes.view_board'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/upload'});
}])

// Filters
.filter('number', function() {
  return function(d) {
    return +d
  }
})
.filter('percent', function() {
  return function(d) {
    return Math.round(+d*100)+'%'
  }
})

// Directives
.directive('lcd', function ($timeout, $interval) {
  return {
    restrict: 'A',
    scope: {
      animStatus: '='
    },
    templateUrl: 'lcd.html',
    link: function(scope, element, attrs, ctrl) {
      var obj = element.find('object')
      var sprites = [
        "wait",
        "smokesmall",
        "smokebig",
        "splash",
        "casserole",
        "flyingfoodbit",
        "cookoven",
        "cooktop1",
        "cooktop2",
        "cooklegs",
        "cookarmknife1",
        "cookarmknife2",
        "cookarmknife3",
        "foodcut",
        "foodbits",
        "foodstackbottom",
        "foodstackmiddle",
        "foodstacktop",
        "cooksleeping",
        "zzz",
        "ovenfood",
        "closedovendoor",
        "openovendoor",
        "closeddoor",
        "opendoor",
        "cookstanding",
        "cookarmnote",
        "pen3",
        "pen2",
        "pen1",
        "cookserving",
        "cookbubble",
        "clientbubble",
        "menu",
        "spoon",
        "dish",
        "clientarm1",
        "clientarm2",
        "flyingdishpiece1",
        "flyingdishpiece2",
        "clienthead1",
        "clienthead2",
        "clienthead3",
        "thinkbubble",
        "background"
      ]
      var animIntervals = []

      // obj.removeClass("ng-hide");

      $timeout(function(){
        sprites.forEach(hideSprite)
        scope.$watch('animStatus', applyStatus)
      }, 100)
      
      function hideSprite(s) {
        obj[0].contentDocument.getElementById(s).style.display = "none"
      }
      
      function showSprite(s) {
        obj[0].contentDocument.getElementById(s).style.display = "inline"
      }

      function applyStatus(e, os, ns) {
        if (os != ns) {
          animIntervals.forEach(function(interval){
            interval.cancel()
          })
          switch (scope.animStatus) {
            case 'off':
              sprites.forEach(hideSprite)
              break;

            case 'choose-recipe':
              sprites.forEach(hideSprite)
              showSprite('background')
              showSprite('closeddoor')
              showSprite('closedovendoor')
              showSprite('cooksleeping')
              addAnimInterval([
                {'zzz': true}, {'zzz': false}
              ], 600)
              addAnimInterval([
                {'clienthead3': true , 'thinkbubble': true , 'clienthead1': false, 'clientarm1': false, 'menu': false},
                {'clienthead3': false, 'thinkbubble': false, 'clienthead1': true , 'clientarm1': true , 'menu': true}
              ], 2000)
              break;

            default:
              sprites.forEach(hideSprite)
              break;
          }
        }
      }

      function addAnimInterval(sequence, delay) {
        var sprite
        for(sprite in sequence[0]) {
          if (sequence[0][sprite]) {
            showSprite(sprite)
          } else {
            hideSprite(sprite)
          }
        }

        var count = 1
        var interval = $interval(function(){
          count = (count + 1)%sequence.length
          
          for(sprite in sequence[count]) {
            if (sequence[count][sprite]) {
              showSprite(sprite)
            } else {
              hideSprite(sprite)
            }
          }
        }, delay || 500)
        animIntervals.push(interval)
      }
    }
  }
})