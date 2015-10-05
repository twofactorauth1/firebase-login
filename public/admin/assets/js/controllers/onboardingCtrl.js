'use strict';
/*global app, angular*/
(function (angular) {
    app.controller('OnboardingCtrl', ["$scope", "$window", "toaster", "CustomerService", function ($scope, $window, toaster, CustomerService) {
        console.log('onboarding');
        console.log('$scope.currentUser ', $scope.currentUser);
        // Someday, we may do some awesome things here to collect or detect traits of the user; f/e their pictures
        // and profile details from social networks, associations from the same, geography, business details from
        // email addresses and existing sites, etc. For now, we'll play them a video.
        initialize();
    }]);
}(angular));