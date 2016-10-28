'use strict';
/**
 * controller for products
 */
(function (angular) {
  app.controller('CampaignsCtrl', ["$scope", "$timeout", "$location", "toaster", "$filter", "$modal", "CampaignService", "$window", '$state', 'AccountService', 'EmailCampaignService', 'WebsiteService', function ($scope, $timeout, $location, toaster, $filter, $modal, CampaignService, $window, $state, AccountService, EmailCampaignService, WebsiteService) {

    $scope.Math = $window.Math;
    $scope.newCampaign = {};
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
    };

    fetchCampaigns();

    $scope.tableView = 'list';

    AccountService.getAccount(function (_account) {
      $scope.account = _account;
    });

    WebsiteService.getEmails(null, function (data) {
      $scope.emails = data;
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

    $scope.openCampaignModal = function (size) {
        $scope.modalInstance = $modal.open({
            templateUrl: 'new-campaign-modal',
            size: size,
            keyboard: false,
            backdrop: 'static',
            scope: $scope
        });
    };


    $scope.createCampaignFn =function(newCampaign) {
        $scope.saveLoading = true;
        var selectedEmail = _.findWhere($scope.emails, {
            _id: newCampaign.emailId
        });
        var campaign = {
            "name": newCampaign.name,
            "type": "onetime",
            "status": "DRAFT",
            "visibility": 1,
            "startDate": "",
            "emailSettings": {
                "emailId": selectedEmail._id,
                "offset": "",
                "fromEmail": selectedEmail.fromEmail,
                "fromName": selectedEmail.fromName,
                "replyTo": selectedEmail.replyTo,
                "bcc": selectedEmail.bcc,
                "subject": selectedEmail.subject,
                "vars": [],
                "sendAt": {}
            },
            "searchTags": {
                "operation": "set",
                "tags": []
            },
            "contactTags": []
        };
        EmailCampaignService.checkIfDuplicateCampaign(null, campaign.name).then(function (response) {
          if(response.data){
              toaster.pop('warning', 'Campaign name already exists');
              $scope.saveLoading = false;
              return;
          }
          else{
            EmailCampaignService.createCampaign(campaign).then(function(res) {
                $scope.cancel();
                console.log('EmailCampaignService.createCampaign created', res.data.name);
                $location.path('/emails/campaigns/' + res.data._id);
            }).catch(function(err) {
                $scope.saveLoading = false;
                console.error('EmailCampaignService.createCampaign error', JSON.stringify(err));
            });
          }
      });
    };


    $scope.cancel = function () {
      $scope.modalInstance.close();
    };

  }]);
})(angular);
