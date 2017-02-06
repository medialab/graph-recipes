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
.directive('lcd', function ($timeout) {
  return {
    restrict: 'A',
    scope: {
      text: '=',
      direction: '='
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

      // obj.removeClass("ng-hide");

      $timeout(function(){
        sprites.forEach(hideSprite)
        showSprite('background')
        showSprite('closeddoor')
        showSprite('closedovendoor')
        showSprite('clienthead3')
        showSprite('cooksleeping')
      }, 100)
      
      function hideSprite(s) {
        obj[0].contentDocument.getElementById(s).style.display = "none"
      }
      function showSprite(s) {
        obj[0].contentDocument.getElementById(s).style.display = "inline"
      }
    }
  }
})