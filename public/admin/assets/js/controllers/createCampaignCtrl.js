'use strict';
/**
 * controller for products
 */
(function (angular) {
  app.controller('CreateCampaignCtrl', ["$scope", "$timeout", "$location", "toaster", "$filter", "$modal", "CampaignService", function ($scope, $timeout, $location, toaster, $filter, $modal, CampaignService) {
    $scope.currentStep = 1;
    $scope.newCampaign = {
      type: 'onetime'
    };
    // Initial Value
    $scope.form = {

      next: function (form) {
        $scope.goingTo = 'next';
        $scope.toTheTop();
        nextStep();

        // if (form.$valid) {
        //   nextStep();
        // } else {
        //   var field = null,
        //     firstError = null;
        //   for (field in form) {
        //     if (field[0] != '$') {
        //       if (firstError === null && !form[field].$valid) {
        //         firstError = form[field].$name;
        //       }

        //       if (form[field].$pristine) {
        //         form[field].$dirty = true;
        //       }
        //     }
        //   }

        //   angular.element('.ng-invalid[name=' + firstError + ']').focus();
        //   errorMessage();
        // }
      },
      prev: function (form) {
        $scope.goingTo = 'prev';
        $scope.toTheTop();
        prevStep();
      },
      goTo: function (form, i) {
        if (parseInt($scope.currentStep) > parseInt(i)) {
          $scope.toTheTop();
          goToStep(i);

        } else {
          $scope.toTheTop();
            goToStep(i);
          // if (form.$valid) {
          //   $scope.toTheTop();
          //   goToStep(i);

          // } else
          //   errorMessage();
        }
      },
      submit: function () {

      },
      reset: function () {

      }
    };


    var nextStep = function () {
      $scope.currentStep++;
    };
    var prevStep = function () {
      $scope.currentStep--;
    };
    var goToStep = function (i) {
      $scope.currentStep = i;
    };
    var errorMessage = function (i) {
      toaster.pop('error', 'Error', 'please complete the form in this step before proceeding');
    };

  }]);
})(angular);
