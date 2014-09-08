/*
 * Parallax Directive
 * */

'use strict';

angular.module('mainApp', ['duParallax']).
  controller('MyCtrl', function($scope, parallaxHelper){
    $scope.background = parallaxHelper.createAnimator(-0.3, 150, -150);
  }
);