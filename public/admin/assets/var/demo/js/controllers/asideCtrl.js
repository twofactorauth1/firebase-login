'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
/** 
 * controller for angular-aside
 * Off canvas side menu to use with ui-bootstrap. Extends ui-bootstrap's $modal provider.
 */
app.controller('AsideCtrl', ["$scope", "$modal", "$aside", "QuoteCartDetailsService", function ($scope, $modal, $aside, QuoteCartDetailsService) {
  $scope.openAside = function (position) {
    $aside.open({
      templateUrl: '/admin/assets/var/demo/views/partials/settings.html',
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

  $scope.openModal = openModal;
  $scope.closeModal = closeModal;

  function openModal(modal, controller, size){
      
      var _modal = {
          templateUrl: modal,
          keyboard: false,
          backdrop: 'static',
          size: 'lg',
          scope: $scope,
          resolve: {
              
          }
      };

      if (controller) {
          _modal.controller = controller;
      }


      $scope.modalInstance = $modal.open(_modal);

      $scope.modalInstance.result.then(null, function () {
          angular.element('.sp-container').addClass('sp-hidden');
      });
  }

  function closeModal() {
      if($scope.modalInstance)
          $scope.modalInstance.close();
  }


  $scope.$watch(function() { return QuoteCartDetailsService.items }, function(items) {
    if(angular.isDefined(items)){
        $scope.quotes = items;
    }
}, true);

}]);
