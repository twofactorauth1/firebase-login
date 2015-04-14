'use strict';
/** 
 * controller for integrations
 */
(function(angular) {
    app.controller('IntegrationsCtrl', ["$scope", "SocialConfigService", function($scope, SocialConfigService) {
        console.log('IntegrationsCtrl >>> ');

        $scope.socialFilter = function(item) {
            return item.accountType !== 'adminpage'
        };

        SocialConfigService.getAllSocialConfig(function(data) {
            console.log('data >>> ', data);
            $scope.socialAccounts = data.socialAccounts;
        });

        $scope.credentialTypes = $$.constants.user.credential_types;

    }]);
})(angular);
