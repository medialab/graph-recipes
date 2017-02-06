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
          sprites.forEach(hideSprite)
          switch (scope.animStatus) {
            case 'off':
              // Nothing to do, everything off by default
              break;

            case 'choose-recipe':
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
              ], 1500)
              break;

            case 'edit-script':
              showSprite('background')
              showSprite('opendoor')
              showSprite('closedovendoor')
              showSprite('clientarm1')
              showSprite('cookstanding')
              showSprite('menu')
              addAnimInterval([
                {
                  'clienthead1': false,
                  'clienthead2': true,
                  'clientbubble': true,
                  'cookbubble': false
                },
                {
                  'clienthead1': true,
                  'clienthead2': false,
                  'clientbubble': false,
                  'cookbubble': true
                }
              ], 9*75)
              addAnimInterval([
                {'cookarmnote': true, 'pen1': true},
                {'pen1': false, 'pen2': true},
                {'pen2': false, 'pen3': true},
                {'pen3': false, 'pen2': true},
                {'pen2': false, 'pen1': true},
                {'pen1': false, 'pen2': true},
                {'pen2': false, 'pen3': true},
                {'pen3': false, 'pen2': true},
                {'pen2': false, 'pen1': true},
                {'pen1': false, 'cookarmnote': false},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {}
              ], 75)
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

        var count = 0
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