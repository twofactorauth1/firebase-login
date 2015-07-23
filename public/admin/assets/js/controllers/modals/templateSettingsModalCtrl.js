'use strict';
/*global app*/
app.controller('TemplateSettingsModalCtrl', ['$scope', '$document', '$modalInstance', '$timeout', 'WebsiteService', 'toaster', 'components', 'clickedIndex', function ($scope, $document, $modalInstance, $timeout, WebsiteService, toaster, components, clickedIndex) {

  //passed in components from parent ctrl
  $scope.components = components;
  //passed in clickedIndex from parent ctrl
  $scope.clickedIndex = clickedIndex;
  //save loading var to
  $scope.saveLoading = false;

  $scope.addBackground = function () {
    $scope.$parent.showInsert = true;
    $scope.openParentModal('media-modal', 'MediaModalCtrl', null, 'lg');
  };

}]);
