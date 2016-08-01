'use strict';
/**
 * controller for products
 */
(function (angular) {
  app.controller('CampaignsCtrl', ["$scope", "$timeout", "$location", "toaster", "$filter", "$modal", "CampaignService", "$window", '$state', 'AccountService', function ($scope, $timeout, $location, toaster, $filter, $modal, CampaignService, $window, $state, AccountService) {

    $scope.Math = $window.Math;
    // $route.reload();

    /*
     * @getCampaigns
     * get all campaigns
     */
    var fetchCampaigns = function() {
      CampaignService.getCampaigns(function (campaigns) {
        console.log('campaigns >>> ', campaigns);
        $timeout(function() {
          $scope.$apply(function() {
            $scope.campaigns = campaigns;
            $timeout(fetchCampaigns, 10000);
          });
        });
      });
    }

    fetchCampaigns();

    $scope.tableView = 'list';

    AccountService.getAccount(function (_account) {
      $scope.account = _account;
    });

    $scope.viewSingle = function (campaign) {
      // var tableState = $scope.getSortOrder();
      // $state.current.sort = tableState.sort;
      if ($scope.account.showhide.ssbEmail) {
        $state.go('app.emailCampaign', {id: campaign._id});
      } else {
        $location.path('/marketing/campaigns/' + campaign._id);
      }
    };

    $scope.percentCalFn = function (x, y) {
        var ret = Math.round(((x/y)*100) * 100) / 100;
        if (isNaN(ret)) {
            return 0;
        } else {
            return ret;
        }
    };

  }]);
})(angular);
