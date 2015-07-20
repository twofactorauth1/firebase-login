'use strict';
/*global mainApp*/
mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', '$window', '$location', '$document', function ($scope, pagesService, $window, $location, $document) {
  $scope.isEditing = false;

  function checkIntercom(data) {
    if (data.hideIntercom) {
      angular.element('#intercom-container').hide();
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
          var element = $document.getElementById(locId);
          if (element) {
            $document.scrollToElementAnimated(element);
          }
        }
      }, 1000);
    }
  });
}]);
