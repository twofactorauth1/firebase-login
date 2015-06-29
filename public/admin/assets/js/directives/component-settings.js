/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/

app.directive('componentSettings', ['$modal', '$http', '$timeout', '$q', '$compile', '$filter', 'WebsiteService', 'CustomerService', 'toaster', function ($modal, $http, $timeout, $q, $compile, $filter, WebsiteService, CustomerService, toaster) {
  return {
    require: [],
    restrict: 'C',
    transclude: false,
    replace: false,
    scope: false,
    controller: function ($scope, WebsiteService, CustomerService, $compile, $timeout) {
      $scope.openModal = function (template, id) {
        $scope.changeComponentEditing(id);
        $scope.modalInstance = $modal.open({
          templateUrl: template,
          scope: $scope
        });
      };

      $scope.changeComponentEditing = function (id) {
        $scope.componentEditing = _.find($scope.components, function(component) {
          return component._id === id;
        });
      };

      $scope.closeModal = function () {
        $timeout(function () {
          $scope.$apply(function () {
            $scope.modalInstance.close();
            angular.element('.modal-backdrop').remove();
          });
        });
      };
    }
  };
}]);
