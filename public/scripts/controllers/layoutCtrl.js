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
      checkIntercom(data);
      setTimeout(function () {
        var locId = $location.$$hash;
        if (locId) {
          var element = document.getElementById(locId);
          if (element) {
            $document.scrollToElementAnimated(element, 175, 1000);
          }
        }
      }, 1000);
    }
  });
}]);
