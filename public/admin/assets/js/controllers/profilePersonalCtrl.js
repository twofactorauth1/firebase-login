'use strict';
/**
 * controller for personal business page
 */
(function(angular) {
    app.controller('ProfilePersonalCtrl', ["$scope", "$modal", "$timeout", "toaster", "$stateParams", "UserService", "CommonService", function($scope, $modal, $timeout, toaster, $stateParams, UserService, CommonService) {
        console.log('profile personal >>> ');


        //account API call for object population
        //account API call for object population
        // Add remove photo


        UserService.getUserActivity(function(activities) {
          $scope.activities = activities;
        });

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
        /**********PAGINATION RELATED **********/
        $scope.curPage = 0;
        $scope.pageSize = 100;
        $scope.numberOfPages = function() {
            if ($scope.activities)
                return Math.ceil($scope.activities.length / $scope.pageSize);
            else
                return 0;
        };
        $scope.changePage = function(page)
        {
            $scope.curPage = $scope.curPage + page;
        }
    }]);
})(angular);
