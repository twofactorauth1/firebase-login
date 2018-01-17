'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
/**
 * controller for angular-aside
 * Off canvas side menu to use with ui-bootstrap. Extends ui-bootstrap's $modal provider.
 */
app.controller('AsideCtrl', ["$scope", "$aside", function ($scope, $aside) {
  $scope.openAside = function (position) {
    $aside.open({
      templateUrl: '/admin/assets/var/newplatform/views/partials/settings.html',
      placement: position,
      size: 'lg',
      backdrop: true,
      controller: function ($scope, $modalInstance) {
        $scope.ok = function (e) {
          $modalInstance.close();
          e.stopPropagation();
        };
        $scope.cancel = function (e) {
          $modalInstance.dismiss();
          e.stopPropagation();
        };
      }
    });
  };
}]);
