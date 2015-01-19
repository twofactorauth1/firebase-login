define(['app', 'campaignService', 'userService', 'mgo-angular-wizard'], function(app) {
    app.register.controller('CampaignDetailCtrl', ['$scope', 'UserService', 'CampaignService', '$stateParams', '$state', function($scope, UserService, CampaignService, $stateParams, $state) {
        $scope.$back = function() {
            console.log('$scope.lastState.state ', $scope.lastState.state);
            console.log('$scope.lastState.params ', $scope.lastState.params);
            if ($scope.lastState === undefined || $scope.lastState.state === '' || $state.is($scope.lastState.state, $scope.lastState.params)) {
                $state.go('marketing');
            } else {
                $state.go($scope.lastState.state, $scope.lastState.params);
            }
        };
        // $scope.campaigns = [];
        // $scope.feeds = [];
        $scope.campaignId = $stateParams.id;

        $scope.mytime = new Date();
        $scope.myDays = 0;

        $scope.hstep = 1;
        $scope.mstep = 15;

        $scope.wizardStep = 1;

        $scope.nextStep = function() {
            $scope.wizardStep += 1;
        };

        $scope.prevStep = function() {
            $scope.wizardStep -= 1;
        };

        $scope.goToStep = function(step) {
            $scope.wizardStep = step;
        };

        $scope.options = {
            hstep: [1, 2, 3],
            mstep: [1, 5, 10, 15, 25, 30]
        };

        $scope.incrementDays = function() {
            console.log('incrementDays');
            $scope.myDays += 1;
        };

        $scope.decrementDays = function() {
            console.log('decrementDays');
            $scope.myDays -= 1;
        };

        // $scope.$watch('activeTab', function(newValue, oldValue) {
        //     if ($scope.userPreferences) {
        //         $scope.userPreferences.indi_default_tab = newValue;
        //         $scope.savePreferencesFn();
        //     }
        // });

        // UserService.getUserPreferences(function(preferences) {
        //     $scope.userPreferences = preferences;
        //     $scope.activeTab = preferences.indi_default_tab || 'getting-started';
        //     $scope.initialWelcome = preferences.welcome_alert.initial;
        // });

        // $scope.savePreferencesFn = function() {
        //     UserService.updateUserPreferences($scope.userPreferences, false, function() {})
        // };

        CampaignService.getCampaign($scope.campaignId, function(campaign) {
            console.log('campaign ', campaign);
            $scope.campaign = campaign;
        });

        $scope.addEmailFn = function() {
            CampaignService.addCampaign($scope.newCampaign, function(campaign) {
                $scope.campaigns.push(campaign);
                $('#marketing-add-campaign').modal('hide');
            });
        };

  }]);
});
