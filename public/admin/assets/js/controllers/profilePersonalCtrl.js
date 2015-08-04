'use strict';
/**
 * controller for personal business page
 */
(function (angular) {
  app.controller('ProfilePersonalCtrl', ["$scope", "$modal", "$timeout", "toaster", "$stateParams", "UserService", "CommonService", "$state", function ($scope, $modal, $timeout, toaster, $stateParams, UserService, CommonService) {
    console.log('profile personal >>> ');


    //account API call for object population
    //account API call for object population
    // Add remove photo


    
    $scope.profileUser = {};
    UserService.getUserActivity(function (activities) {
      $scope.activities = activities;
    });

    /*
     * @openMediaModal
     * -
     */

    $scope.openMediaModal = function () {
      $scope.showInsert = true;
      $scope.modalInstance = $modal.open({
        templateUrl: 'media-modal',
        controller: 'MediaModalCtrl',
        size: 'lg',
        resolve: {
          showInsert: function () {
            return $scope.showInsert;
          },
          insertMedia: function () {
            return $scope.insertPhoto;
          }
        }
      });
    };

    $scope.insertPhoto = function (asset) {
      $scope.profileUser.profilePhotos[0] = asset.url;
    };

    $scope.removePhoto = function (asset) {
      $scope.profileUser.profilePhotos[0] = null;
    };

    $scope.setProfileUser = function(user) {
      $scope.profileUser= angular.copy(user);
    };

    $scope.refreshUser = function() {
       angular.copy($scope.profileUser, $scope.currentUser);
     };

    $scope.setProfileUser($scope.currentUser);

    $scope.profileSaveFn = function () {
      //$scope.currentUser = $scope.profileUser;
      var email = _.filter($scope.profileUser.emails, function (mail) {
        return mail.email !== "";
      });
      if (email.length <= 0) {
        toaster.pop("error", "Email is required.");
        return;
      }
      UserService.putUser($scope.profileUser, function (user) {        
        $scope.refreshUser();
        toaster.pop('success', 'Profile Saved.');
      });
    };
    /**********PAGINATION RELATED **********/
    $scope.curPage = 0;
    $scope.pageSize = 100;
    $scope.numberOfPages = function () {
      if ($scope.activities)
        return Math.ceil($scope.activities.length / $scope.pageSize);
      else
        return 0;
    };
    $scope.changePage = function (page) {
      $scope.curPage = $scope.curPage + page;
    }
  }]);
})(angular);
