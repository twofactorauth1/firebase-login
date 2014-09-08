/*
 * Parallax Directive
 * */

'use strict';

mainApp.controller('MyCtrl', ['$scope', 'parallaxHelper', function ($scope, parallaxHelper) {

    $scope.background = parallaxHelper.createAnimator(-0.3, 150, -150);

}]);