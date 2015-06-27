'use strict';
/**
 * controller for editor
 */
(function (angular) {
  app.controller('EditorCtrl', ["$scope", "$rootScope", "$interval", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", function ($scope, $rootScope, $interval, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant) {

    $scope.retrievePage = function (_handle) {
      WebsiteService.getSinglePage(_handle, function (data) {
        $scope.components = data.components;
      });
    };

    if ($location.$$search['pagehandle']) {
      console.log('Page: ', $location.$$search['pagehandle']);
      $scope.retrievePage($location.$$search['pagehandle']);
    }

    $scope.demoObj = {

      panels: [{
          id: 'unique_id_1',
          type: 'nested-directive',
          data: {
            test: 'test 1'
          }
        }, {
          id: 'unique_id_2',
          type: 'nested-directive',
          data: {
            test: 'test 2'
          }
        }, {
          id: 'unique_id_3',
          type: 'nested-directive',
          data: {
            test: 'test 3'
          }
        }

      ]
    };

  }]);
})(angular);
