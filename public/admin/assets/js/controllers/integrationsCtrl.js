'use strict';
/*global app, moment, angular, window, L*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('IntegrationsCtrl', ["$scope", "SocialConfigService", "userConstant", "SweetAlert", "ipCookie", "toaster", function ($scope, SocialConfigService, userConstant, SweetAlert, ipCookie, toaster) {

    console.log('cookie ', ipCookie("socialAccount"));
    var completedIntegration = ipCookie("socialAccount");
    if (completedIntegration) {
      $scope.minRequirements = true;
      toaster.pop('success', "Integrated Successfully", ipCookie("socialAccount") + ' has been added.');
      ipCookie.remove("socialAccount", {
        path: "/"
      });
    }

    /*
     * Global Variables
     * - credentialTypes: constant for social network names
     */

    $scope.credentialTypes = userConstant.credential_types;

    /*
     * @getAllSocialConfig
     * get the social accounts
     */

    SocialConfigService.getAllSocialConfig(function (data) {

      _.each(data.socialAccounts, function (socialAccount) {
        //get profile/page info
        if (socialAccount.type === 'fb') {
          SocialConfigService.getFBProfile(socialAccount.id, function (profile) {
            socialAccount.profile = profile;
          });
        }
      });

      $scope.socialAccounts = data.socialAccounts;
    });

    /*
     * @socialFilter
     * filter the social account to only get the parent accounts
     */

    $scope.socialFilter = function (item) {
      return item.accountType !== 'adminpage';
    };

    /*
     * @disconnectSocial
     * disconnect the social account 
     */

    $scope.disconnectSocial = function (sa) {
      console.log('disconnectSocial >>>');
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to disconnect this social network?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, disconnect it!",
        cancelButtonText: "No, do not disconnect it!",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          sa.loading = true;
          SocialConfigService.deleteSocialConfigEntry(sa.id, function () {
            SocialConfigService.getAllSocialConfig(function (data) {
              $scope.socialAccounts = data.socialAccounts;
            });
          });
        }
      });
    };

    /*
     * @socailRedirect
     * redirect users to social network and setting up a temporary cookie
     */

    $scope.currentHost = window.location.host;
    $scope.redirectUrl = '/admin/account/integrations';

    $scope.socailRedirect = function (socialAccount) {
      var account_cookie = ipCookie("socialAccount");
      //Set the amount of time a socialAccount should last.
      var expireTime = new Date();
      expireTime.setMinutes(expireTime.getMinutes() + 10);
      if (account_cookie === undefined) {
        ipCookie("socialAccount", socialAccount, {
          expires: expireTime,
          path: "/"
        });
      } else {
        //If it does exist, delete it and set a new one with new expiration time
        ipCookie.remove("socialAccount", {
          path: "/"
        });
        ipCookie("socialAccount", socialAccount, {
          expires: expireTime,
          path: "/"
        });
      }
      window.location = '/redirect/?next=' + $scope.currentHost + '/socialconfig/' + socialAccount.toLowerCase() + '?redirectTo=' + $scope.redirectUrl + '&socialNetwork=' + socialAccount;
    };

  }]);
}(angular));
