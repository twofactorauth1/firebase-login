'use strict';

mainApp.controller('NotFoundCtrl', ['$scope', '$window', function ($scope, $window) {
  console.log('not found ctrl');
  $scope.onResizeFunction = function () {
    $scope.windowHeight = $window.innerHeight;
    $scope.windowWidth = $window.innerWidth;

    console.log($scope.windowHeight + "-" + $scope.windowWidth)
  };

  // Call to the function when the page is first loaded
  $scope.onResizeFunction();

  angular.element($window).bind('resize', function () {
    $scope.onResizeFunction();
    $scope.$apply();
  });
}]);
