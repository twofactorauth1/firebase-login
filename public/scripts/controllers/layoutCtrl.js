'use strict';
/*global mainApp*/
mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', '$window', '$location', '$document', '$timeout', function ($scope, pagesService, $window, $location, $document, $timeout) {
  $scope.isEditing = false;

  function checkIntercom(data) {
    if (data.hideIntercom) {
      $scope.$parent.hideIntercom = true;
    }
  }

  pagesService($scope.websiteId, function (err, data) {
    if (err) {
      console.warn('no page found');
      $window.location.href = '/404';
    } else {
      $scope.page = data;
      $scope.components = data.components;
      $scope.components.forEach(function (value, index) {
        if (value && value.type === 'masthead') {
          if (index != 0 && $scope.components[index - 1].type == "navigation") {
            $scope.allowUndernav = true;              
          } else
            $scope.allowUndernav = false;
        }
      })
      checkIntercom(data);
      angular.element(document).ready(function () {
        setTimeout(function () {
          var locId = $location.$$hash;
          if (locId) {
            var element = document.getElementById(locId);
            if (element) {
              $document.scrollToElementAnimated(element, 10, 1000);
            }
          }
        }, 2000);
      })
    }
  });
}]);
