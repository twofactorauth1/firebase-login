'use strict';
/**
 * controller for personal business page
 */
(function (angular) {
  app.controller('ProfilePersonalCtrl',
      ["$scope", "$modal", "$timeout", "toaster", "$stateParams", "UserService", "PaymentService", "CommonService", "userConstant", "formValidations",
        function ($scope, $modal, $timeout, toaster, $stateParams, UserService, PaymentService, CommonService, userConstant, formValidations) {
    console.log('profile personal >>> ');

    //account API call for object population
    //account API call for object population
    // Add remove photo

    $scope.formValidations = formValidations;
    $scope.auth = {
      password: '',
      confirm: '',
    };
    $scope.invoices = [];
    $scope.profileUser = {};
    UserService.getUserActivity(function (activities) {
      $scope.activities = activities;
    });

    $scope.getSubscription = function(){
      PaymentService.getInvoicesForAccount(function (invoices) {
            var invoices = invoices;            
            if(invoices.data.length && invoices.data[0].lines && invoices.data[0].lines.data.length == 2)
            {
              $scope.invoices = invoices.data[0].lines.data[1].plan;
            }
            else if(invoices.data.length && invoices.data[0].lines && invoices.data[0].lines.data.length == 1)
            {
               $scope.invoices = invoices.data[0].lines.data[0].plan;
            }
            console.log("Invoices: ", $scope.invoices);
          });
    };
    $scope.getSubscription();

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
        keyboard: false,
        backdrop: 'static',
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
      $scope.originalprofileUser = angular.copy($scope.profileUser);

      // we don't show a real password since we don't respond with password data
      $scope.auth.password = userConstant.personal_profile.PASSWORD_PLACEHOLDER;
      $scope.auth.confirm = userConstant.personal_profile.PASSWORD_PLACEHOLDER;
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
      if(($scope.auth.password !== userConstant.personal_profile.PASSWORD_PLACEHOLDER)
      || ($scope.auth.confirm !== userConstant.personal_profile.PASSWORD_PLACEHOLDER)) {
        console.log('------ detected password change --------');
        changed = true;
      }

      return changed;
    };

    $scope.validatePasswords = function() {
      console.log('------- validating password --------------');

      // make sure they are the same, else flip the passwordNotSame flag
      if($scope.auth.password === $scope.auth.confirm) {
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
     // simpleForm.$setPristine(true);
      angular.copy($scope.profileUser, $scope.originalprofileUser);
      if (!$scope.profileUser.email) {
        toaster.pop("error", "Email is required.");
        return;
      }
      if($scope.profileUser.email)
        $scope.profileUser.username = $scope.profileUser.email;
      UserService.putUser($scope.profileUser, function (user) {        
        $scope.refreshUser();
        toaster.pop('success', 'Profile Saved.');
        angular.copy($scope.profileUser, $scope.originalprofileUser);
      });

      // check if password needs to be changed
      if($scope.passwordChanged()) {
        if( $scope.validatePasswords() ) {
          UserService.setPassword($scope.auth.password, function(user) {
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
    $scope.checkIfDirty = function(){
      var isDirty = false;      
      if($scope.originalprofileUser && !angular.equals($scope.originalprofileUser, $scope.profileUser))
        isDirty = true;
      return isDirty;
    }
    $scope.resetDirty = function(){
      $scope.originalprofileUser = null;
      $scope.profileUser = null;
    }
  }]);
})(angular);
