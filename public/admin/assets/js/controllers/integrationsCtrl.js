'use strict';
/**
 * controller for integrations
 */
(function(angular) {
    app.controller('IntegrationsCtrl', ["$scope", "SocialConfigService", "userConstant", "SweetAlert", "ipCookie", function($scope, SocialConfigService, userConstant, SweetAlert, ipCookie) {


        /*
         * Global Variables
         * - credentialTypes: constant for social network names
         */

        $scope.credentialTypes = userConstant.credential_types;

        /*
         * @getAllSocialConfig
         * get the social accounts
         */

        SocialConfigService.getAllSocialConfig(function(data) {

            _.each(data.socialAccounts, function(socialAccount) {
                //get profile/page info
                if (socialAccount.type == 'fb') {
                    SocialConfigService.getFBProfile(socialAccount.id, function(profile) {
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

        $scope.socialFilter = function(item) {
            return item.accountType !== 'adminpage'
        };

        /*
         * @disconnectSocial
         * disconnect the social account 
         */

        $scope.disconnectSocial = function(id) {
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
                },
                function(isConfirm) {
                    if (isConfirm) {
                        SocialConfigService.deleteSocialConfigEntry(id, function() {
                            SocialConfigService.getAllSocialConfig(function(data) {
                                $scope.socialAccounts = data.socialAccounts;
                            });
                        });
                    };
                });
        };

        /*
         * @socailRedirect
         * redirect users to social network and setting up a temporary cookie
         */

        $scope.currentHost = window.location.host;
        $scope.redirectUrl = '/admin/account/integrations';

        $scope.socailRedirect = function(socailAccount) {
            var account_cookie = ipCookie("socialAccount");
            //Set the amount of time a socailAccount should last.
            var expireTime = new Date();
            expireTime.setMinutes(expireTime.getMinutes() + 10);
            var msg = socailAccount + ' is integreted successfully.';
            if (account_cookie == undefined) {
                ipCookie("socialAccount", msg, {
                    expires: expireTime,
                    path: "/"
                });
            } else {
                //If it does exist, delete it and set a new one with new expiration time
                ipCookie.remove("socialAccount", {
                    path: "/"
                });
                ipCookie("socialAccount", msg, {
                    expires: expireTime,
                    path: "/"
                });
            }
            $scope.minRequirements = true;
            // ToasterService.setHtmlPending('success', socailAccount + ' is integreted successfully.', '<div class="mb15"></div><a href="/admin#/customer?onboarding=create-contact" class="btn btn-primary">Next Step: Import / Create Contacts</a>', 0, 'trustedHtml');
            window.location = '/redirect/?next=' + $scope.currentHost + '/socialconfig/' + socailAccount.toLowerCase() + '?redirectTo=' + $scope.redirectUrl + '&socialNetwork=' + socailAccount;
        };

    }]);
})(angular);
