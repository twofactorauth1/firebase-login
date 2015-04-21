'use strict';
/** 
 * controller for personal business page
 */
(function(angular) {
    app.controller('ProfilePersonalCtrl', ["$scope", "$modal", "$timeout", "toaster", "$stateParams", "UserService", "CommonService", "hoursConstant", function($scope, $modal, $timeout, toaster, $stateParams, UserService, CommonService, hoursConstant) {
        console.log('profile personal >>> ');

        $scope.hours = hoursConstant;
        //account API call for object population
        //account API call for object population
        // Add remove photo

        $scope.insertPhoto = function(asset) {
            $scope.currentUser.profilePhotos[0] = asset.url;
        };

        $scope.removePhoto = function(asset) {
            $scope.currentUser.profilePhotos[0] = null;
        };

        $scope.profileSaveFn = function() {
            UserService.putUser($scope.currentUser, function(user) {
                $scope.currentUser = user;
                toaster.pop('success', 'Profile Saved.');
            });
        };
    }]);
})(angular);
