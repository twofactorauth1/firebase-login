'use strict';
/**
 * controller for personal business page
 */
(function (angular) {
  app.controller('ProfilePersonalCtrl',
      ["$scope", "$modal", "$timeout", "toaster", "$stateParams", "UserService", "CommonService", "userConstant",
        function ($scope, $modal, $timeout, toaster, $stateParams, UserService, CommonService, userConstant) {
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

      // we don't show a real password since we don't respond with password data
      $scope.profileUser.password = userConstant.personal_profile.PASSWORD_PLACEHOLDER;
      $scope.profileUser.confirm = userConstant.personal_profile.PASSWORD_PLACEHOLDER;
      $scope.passwordNotSame = false; // useful for HTML display
    };

    $scope.refreshUser = function() {
       angular.copy($scope.profileUser, $scope.currentUser);
     };

    $scope.setProfileUser($scope.currentUser);

    $scope.passwordChanged = function() {
      console.log('------ checking for password change --------');
      var changed = false;

      // check to see if the user messed with either form input
      if(($scope.profileUser.password !== userConstant.personal_profile.PASSWORD_PLACEHOLDER)
      || ($scope.profileUser.confirm !== userConstant.personal_profile.PASSWORD_PLACEHOLDER)) {
        console.log('------ detected password change --------');
        changed = true;
      }

      return changed;
    };

    $scope.validatePasswords = function() {
      console.log('------- validating password --------------');

      // make sure they are the same, else flip the passwordNotSame flag
      if($scope.profileUser.password === $scope.profileUser.confirm) {
        $scope.passwordNotSame = false;
      }
      else {
        $scope.passwordNotSame = true;
      }

      // return true when validated
      // return false when INvalidated
      return !$scope.passwordNotSame;
    };

    $scope.profileSaveFn = function () {
      //$scope.currentUser = $scope.profileUser;
     
      if (!$scope.profileUser.email) {
        toaster.pop("error", "Email is required.");
        return;
      }
      UserService.putUser($scope.profileUser, function (user) {        
        $scope.refreshUser();
        toaster.pop('success', 'Profile Saved.');
      });

      // check if password needs to be changed
      if($scope.passwordChanged()) {
        if( $scope.validatePasswords() ) {
          UserService.setPassword($scope.profileUser, function(user) {
            console.log('---- changed password successfully -----');
            toaster.pop('success', 'Password changed.');
          });
        }
        else {
          console.log('passwords are not valid');
        }
      }
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
