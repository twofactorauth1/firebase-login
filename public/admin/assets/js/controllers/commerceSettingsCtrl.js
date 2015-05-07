'use strict';
/** 
 * controller for personal business page
 */
(function (angular) {
  app.controller('CommerceSettingsCtrl', ["$scope", "$modal", "$timeout", "toaster", "$stateParams", "UserService", "CommonService", "hoursConstant", function ($scope, $modal, $timeout, toaster, $stateParams, UserService, CommonService, hoursConstant) {
    console.log('commercesettings >>> ');

    $scope.calculateTaxOptions = [
      {
        name: 'Customer Shipping Address',
        value: 'customer_shipping'
      }, {
        name: 'Customer Billing Address',
        value: 'customer_billing'
      }, {
        name: 'Business Location',
        value: 'business_location'
      }
    ];

  }]);
})(angular);
