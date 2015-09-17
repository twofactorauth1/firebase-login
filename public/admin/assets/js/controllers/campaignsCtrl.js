'use strict';
/**
 * controller for products
 */
(function (angular) {
  app.controller('CampaignsCtrl', ["$scope", "$timeout", "$location", "toaster", "$filter", "$modal", "CampaignService", function ($scope, $timeout, $location, toaster, $filter, $modal, CampaignService) {

    /*
     * @getCampaigns
     * get all campaigns
     */

    CampaignService.getCampaigns(function (campaigns) {
      console.log('campaigns >>> ', campaigns);
      $timeout(function() {
        $scope.$apply(function() {
          $scope.campaigns = campaigns;
        });
      });
    });

    $scope.tableView = 'list';

    $scope.viewSingle = function (campaign) {
      // var tableState = $scope.getSortOrder();
      // $state.current.sort = tableState.sort;
      window.location = '/admin/#/marketing/campaigns/' + campaign._id;
    };

  }]);
})(angular);
