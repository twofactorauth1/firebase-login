'use strict';
/*global app, moment, angular, window, L*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('IntegrationsCtrl', ["$scope", "SocialConfigService", "AccountService", "userConstant", "SweetAlert", "ipCookie", "toaster", "$location", function ($scope, SocialConfigService, AccountService, userConstant, SweetAlert, ipCookie, toaster, $location) {

    /*
     * Global Variables
     * - credentialTypes: constant for social network names
     */

    $scope.credentialTypes = userConstant.credential_types;

    /*
     * @getAllSocialConfig
     * get the social accounts
     */

    $scope.getAccount = function () {
      AccountService.getAccount(function (account) {
        console.log('account ', account.credentials);
        $scope.account = account;
        var stripe = _.find(account.credentials, function (cred) {
          return cred.type === 'stripe';
        });
        SocialConfigService.getAllSocialConfig(function (data) {
          if (stripe) {
            stripe.accountType = "account";
            stripe.id = Math.uuid(8);
            stripe.type = "st";
            data.socialAccounts.push(stripe);
          }
          _.each(data.socialAccounts, function (socialAccount) {
            //get profile/page info
            console.log('socialAccount ', socialAccount);
            if (socialAccount.type === 'fb') {
              SocialConfigService.getFBProfile(socialAccount.id, function (profile) {
                socialAccount.profile = profile;
              });
            }
          });

          $scope.socialAccounts = data.socialAccounts;
          console.log();
        });
      });
    };

    console.log('cookie ', ipCookie("socialAccount"));
    var completedIntegration = ipCookie("socialAccount");
    if (completedIntegration) {
      if (ipCookie("socialAccount").redirectTo !== '/account/integrations') {
        var redirectUrl = ipCookie("socialAccount").redirectTo;
        ipCookie.remove("socialAccount", {
          path: "/"
        });
        $location.path(redirectUrl);
      } else {
        $scope.minRequirements = true;
        toaster.pop('success', "Integrated Successfully", ipCookie("socialAccount").socialAccount + ' has been added.');
        ipCookie.remove("socialAccount", {
          path: "/"
        });
        $scope.getAccount();
      }
    } else {
      $scope.getAccount();
    }

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
          if (sa.type === $scope.credentialTypes.STRIPE) {
            $scope.account.credentials = _.without($scope.account.credentials, _.findWhere($scope.account.credentials, {
              accessToken: sa.accessToken
            }));
            AccountService.updateAccount($scope.account, function (account) {
              $scope.socialAccounts = _.without($scope.socialAccounts, _.findWhere($scope.socialAccounts, {
                accessToken: sa.accessToken
              }));
              $scope.account = account;
            });
          } else {
            SocialConfigService.deleteSocialConfigEntry(sa.id, function () {
              SocialConfigService.getAllSocialConfig(function (data) {
                $scope.socialAccounts = data.socialAccounts;
              });
            });
          }
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
        var cookieValue = {
          "socialAccount": socialAccount,
          "redirectTo": '/account/integrations',
        };
        ipCookie("socialAccount", cookieValue, {
          expires: expireTime,
          path: "/"
        });
      } else {
        //If it does exist, delete it and set a new one with new expiration time
        ipCookie.remove("socialAccount", {
          path: "/"
        });
        var cookieValue = {
          "socialAccount": socialAccount,
          "redirectTo": '/account/integrations',
        };
        ipCookie("socialAccount", cookieValue, {
          expires: expireTime,
          path: "/",
          redirectTo: "/account/integrations"
        });
      }

      var _redirectUrl = '/redirect/?next=' + $scope.currentHost + '/socialconfig/' + socialAccount.toLowerCase() + '?redirectTo=' + $scope.redirectUrl + '&socialNetwork=' + socialAccount;
      if (socialAccount === 'Stripe') {
        ///redirect/?next={{currentHost}}/stripe/connect&socialNetwork=stripe
        _redirectUrl = '/redirect/?next=' + $scope.currentHost + '/stripe/connect/';
      }
      window.location = _redirectUrl;
    };

  }]);
}(angular));
