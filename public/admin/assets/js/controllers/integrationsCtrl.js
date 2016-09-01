'use strict';
/*global app, moment, angular, window, L*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('IntegrationsCtrl', ["$scope", "$rootScope", "SocialConfigService", "AccountService", "userConstant", "SweetAlert", "ipCookie", "toaster", "$location", "$state", "$window", "$timeout", function ($scope, $rootScope, SocialConfigService, AccountService, userConstant, SweetAlert, ipCookie, toaster, $location, $state, $window, $timeout) {

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
        $scope.account = account;
        var originalAccount = angular.copy(account);
        var stripe = _.find(originalAccount.credentials, function (cred) {
          return cred.type === 'stripe';
        });

        var isPaypalEnabled = account && account.commerceSettings && account.commerceSettings.paypal;
        $scope.socialAccounts = null;
        SocialConfigService.getAllSocialConfig(function (data) {
          if (stripe) {
            stripe.accountType = "account";
            stripe.id = Math.uuid(8);
            stripe.type = "st";
            //the stripe account is part of the social config
            //data.socialAccounts.push(stripe);
          }


          
          _.each(data.socialAccounts, function (socialAccount) {
            //get profile/page info
            if (socialAccount.type === 'fb') {
              SocialConfigService.getFBProfile(socialAccount.id, function (profile) {
                socialAccount.profile = profile;
              });
            } else if(socialAccount.type === 'stripe') {
                //change it to st?
                socialAccount.type = 'st';
            }
          });
          if(!_.find(data.socialAccounts, function(cred){return cred.type === 'st'})){
              //add the credential from the account.
              if(stripe)
                data.socialAccounts.push(stripe);
          }

          if (isPaypalEnabled) {
            var paypal = {};
            paypal.type = $scope.credentialTypes.PAYPAL;
            data.socialAccounts.push(paypal);
          }
          
          $timeout(function() {
            $scope.socialAccounts = data.socialAccounts;
            $scope.checkForIntegration();
          }, 0);
          
          console.log();
        });
      });
    };

    $scope.checkForIntegration = function()
    {
      var completedIntegration = ipCookie("socialAccount");
      if (completedIntegration) {
        if (completedIntegration.redirectTo !== '/account/integrations') {
          var redirectUrl = completedIntegration.redirectTo;
          $location.path(redirectUrl);
        } else {
          var _filteredAccount = _.where($scope.socialAccounts, {
            type: completedIntegration.type
          });
          var _count = _filteredAccount.length;
          if(completedIntegration.accountsCount != _filteredAccount.length)
          {
           $scope.minRequirements = true;
           toaster.pop('success', "Integrated Successfully", completedIntegration.socialAccount + ' has been added.');
          }
        }
      }
      ipCookie.remove("socialAccount", {
        path: "/"
      });
    };

    $scope.getAccount();

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

    $scope.disconnectSocial = function (sa, index) {
      var displayText = "Do you want to disconnect this social network?";
      if(sa.type === $scope.credentialTypes.PAYPAL){
          displayText = "Do you want to disconnect Paypal?";
      }
      console.log('disconnectSocial >>>');
      SweetAlert.swal({
        title: "Are you sure?",
        text: displayText,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, disconnect it!",
        cancelButtonText: "No, do not disconnect it!",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          console.log('sa ', sa, index);
          sa.loading = true;
          if (sa.type === $scope.credentialTypes.STRIPE) {
            $scope.account.credentials = _.without($scope.account.credentials, _.findWhere($scope.account.credentials, {
              accessToken: sa.accessToken
            }));
            AccountService.updateAccount($scope.account, function (account) {
              $scope.socialAccounts.splice(index, 1);
              $scope.account = account;
            });
          }
          else if(sa.type === $scope.credentialTypes.PAYPAL) {
            if(!$scope.account.commerceSettings){
              $scope.account.commerceSettings = {};
            }
            $scope.account.commerceSettings.paypal = false;
            AccountService.updateAccount($scope.account, function (account) {
              $scope.socialAccounts.splice(index, 1);
              $scope.account = account;
            });
          }
          else {
            SocialConfigService.deleteSocialConfigEntry(sa.id, function () {
              SocialConfigService.getAllSocialConfig(function (data) {
                $scope.socialAccounts.splice(index, 1);
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

    $scope.currentHost = $window.location.host;
    $scope.redirectUrl = '/admin/account/integrations';

    $scope.socailRedirect = function (socialAccount, type) {
      //var _count =  $scope.socialAccounts[0].type
      var _filteredAccount = _.where($scope.socialAccounts, {
        type: type
      });

      var _count = _filteredAccount.length;

      var account_cookie = ipCookie("socialAccount");
      //Set the amount of time a socialAccount should last.
      var expireTime = new Date();
      expireTime.setMinutes(expireTime.getMinutes() + 10);
      if (account_cookie === undefined) {
        var cookieValue = {
          "socialAccount": socialAccount,
          "redirectTo": '/account/integrations',
          "accountsCount": _count,
          "type": type
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
          "accountsCount": _count,
          "type": type
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

      if (socialAccount === 'Paypal') {
        //$state.go('app.support.helptopics');
        //return;
          _redirectUrl = '/admin/#/support/help-topics?title=adding-paypal-as-an-payment-option'
      }
      $window.location = _redirectUrl;
    };

    $rootScope.$on('$refreshSocialAccounts', function (event, args) {
       $scope.getAccount();
    });

  }]);
}(angular));
