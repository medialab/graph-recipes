'use strict';

// Declare app level module which depends on views, and components
angular.module('graphrecipes', [
  'ngRoute',
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
