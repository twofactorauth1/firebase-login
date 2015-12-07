'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('ProfileBusinessCtrl', ["$scope", "$modal", "$timeout", "toaster", "$stateParams", "UserService", "CommonService", "hoursConstant", "AccountService", "formValidations", function ($scope, $modal, $timeout, toaster, $stateParams, UserService, CommonService, hoursConstant, AccountService, formValidations) {

    $scope.isValid = true;
    $scope.hours = hoursConstant;
    $scope.formValidations = formValidations;
    //account API call for object population
    //account API call for object population
    AccountService.getAccount(function (account) {
      $scope.account = account;
      $scope.setDefaults();
      $scope.originalAccount = angular.copy($scope.account);
    });

    //user API call for object population
    UserService.getUser(function (user) {
      $scope.user = user;
      $scope.fullName = [user.first, user.middle, user.last].join(' ');
      if (!$scope.user.business) {
        $scope.user.business = [];
      }
      if (!$scope.user.business.phones) {
        $scope.user.business.phones = [];
      }
      if (!$scope.user.business.addresses) {
        $scope.user.business.addresses = [];
      }
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

    // Add remove photo
    $scope.insertPhoto = function (asset) {
      $scope.account.business.logo = asset.url;
    };

    $scope.removePhoto = function (asset) {
      $scope.account.business.logo = null;
    };

    // Add/Remove email adresses
    $scope.accountAddEmailFn = function () {
      $scope.account.business.emails.push({
        _id: CommonService.generateUniqueAlphaNumericShort(),
        email: ''
      });
    };
    $scope.removeEmail = function (index) {
      $scope.account.business.emails.splice(index, 1);
    };

    $scope.showAddEmail = function (email) {
      return email._id === $scope.account.business.emails[0]._id;
    };

    // Add/Remove phone numbers        
    $scope.accountAddPhoneFn = function () {
      $scope.account.business.phones.push({
        _id: CommonService.generateUniqueAlphaNumericShort(),
        number: '',
        extension: ''
      });
    };
    $scope.removePhone = function (index) {
      $scope.account.business.phones.splice(index, 1);
    };

    $scope.showAddPhone = function (phone) {
      return phone._id === $scope.account.business.phones[0]._id;
    };

    // Add/Remove address
    $scope.removeAddress = function (index) {
      $scope.account.business.addresses.splice(index, 1);
    };

    $scope.showAddAddress = function (address) {
      return address._id === $scope.account.business.addresses[0]._id;
    };

    $scope.accountAddAddressFn = function () {
      $scope.account.business.addresses.push({
        _id: CommonService.generateUniqueAlphaNumericShort(),
        address: '',
        address2: '',
        state: '',
        zip: '',
        country: '',
        defaultShipping: false,
        defaultBilling: false,
        city: '',
        countryCode: '',
        displayName: '',
        lat: '',
        lon: ''
      });
    };

    $scope.accountAddHoursFn = function () {
      $scope.account.business.splitHours = false;
      $scope.account.business.hours = [{
        day: "Mon",
        start: "9:00 am",
        end: "5:00 pm",
        start2: "9:00 am",
        end2: "5:00 pm",
        closed: false,
        split: false
      }, {
        day: "Tue",
        start: "9:00 am",
        end: "5:00 pm",
        start2: "9:00 am",
        end2: "5:00 pm",
        closed: false,
        split: false
      }, {
        day: "Wed",
        start: "9:00 am",
        end: "5:00 pm",
        start2: "9:00 am",
        end2: "5:00 pm",
        closed: false,
        split: false
      }, {
        day: "Thu",
        start: "9:00 am",
        end: "5:00 pm",
        start2: "9:00 am",
        end2: "5:00 pm",
        closed: false,
        split: false
      }, {
        day: "Fri",
        start: "9:00 am",
        end: "5:00 pm",
        start2: "9:00 am",
        end2: "5:00 pm",
        closed: false,
        split: false
      }, {
        day: "Sat",
        start: "9:00 am",
        end: "5:00 pm",
        start2: "9:00 am",
        end2: "5:00 pm",
        closed: true,
        split: false
      }, {
        day: "Sun",
        start: "9:00 am",
        end: "5:00 pm",
        start2: "9:00 am",
        end2: "5:00 pm",
        closed: true,
        split: false
      }];
    };

    $scope.setDefaults = function () {
      if (!$scope.account.business.phones) {
        $scope.account.business.phones = [];
      }

      if (!$scope.account.business.emails) {
        $scope.account.business.emails = [];
      }
      if (!$scope.account.business.addresses) {
        $scope.account.business.addresses = [];
      }
      if (!$scope.account.business.phones.length) {
        $scope.accountAddPhoneFn();
      }
      if (!$scope.account.business.emails.length) {
        $scope.accountAddEmailFn();
      }
      if (!$scope.account.business.addresses.length) {
        $scope.accountAddAddressFn();
      }
      if (!$scope.account.business.hours || !$scope.account.business.hours.length) {
        $scope.accountAddHoursFn();
      }
      if ($scope.account.business.hours) {
        _.each($scope.account.business.hours, function (element, index) {
          if (element.day === "Sat" || element.day === "Sun") {
            if (element.start === "") {
              element.start = "9:00 am";
            }
            if (element.end === "") {
              element.end = "5:00 pm";
            }
            if (element.start2 === "") {
              element.start2 = "9:00 am";
            }
            if (element.end2 === "") {
              element.end2 = "9:00 am";
            }
          }
        });
      }
    };

    $scope.profileSaveFn = function () {
      console.log('profileSaveFn >>>');
      angular.copy($scope.account, $scope.originalAccount);
      $scope.validateBeforeSave();
      if (!$scope.isValid) {
        toaster.pop("error", "Business hours are not valid");
        return;
      }
      var email = _.filter($scope.account.business.emails, function (mail) {
        return mail.email && mail.email.length > 0;
      });

      if (email.length <= 0) {
        toaster.pop("error", "Email is required.");
        return;
      }
      UserService.putAccount($scope.account, function (account) {
        $scope.account = account;
        toaster.pop('success', 'Profile Saved.');
        $scope.minRequirements = true;
        $scope.setDefaults();
      });
    };

    $scope.checkProfileValidity = function () {
      var name = $scope.account.business.name;
      var email = _.filter($scope.account.business.emails, function (mail) {
        return mail.email !== "";
      });
      if (name !== "" && email.length > 0) {
        return true;
      }
    };

    $scope.validateBeforeSave = function () {
      $scope.isValid = true;
      _.each($scope.account.business.hours, function (element, index) {
        $scope.validateHours(element, index);
      });
    };

    $scope.validateHours = function (hours, index) {
      if (!hours.closed) {
        var startTime = hours.start;
        var endTime = hours.end;
        if (startTime && endTime) {
          startTime = (startTime.split(" ")[1] === 'pm' && startTime.split(":")[0] !== '12') || (startTime.split(" ")[1] === 'am' && startTime.split(":")[0] === '12') ? parseInt(startTime.split(":")[0], 10) + 12 : parseInt(startTime.split(":")[0], 10);
          endTime = (endTime.split(" ")[1] === 'pm' && endTime.split(":")[0] !== '12') || (endTime.split(" ")[1] === 'am' && endTime.split(":")[0] === '12') ? parseInt(endTime.split(":")[0], 10) + 12 : parseInt(endTime.split(":")[0], 10);
          startTime = parseInt(hours.start.split(":")[1], 10) === 30 ? startTime + 0.5 : startTime;
          endTime = parseInt(hours.end.split(":")[1], 10) === 30 ? endTime + 0.5 : endTime;

        }
        if (hours.split && $scope.account.business.splitHours) {
          angular.element("#business_hours_start_" + index + " .error").html("");
          angular.element("#business_hours_start_" + index).removeClass('has-error');
          angular.element("#business_hours_start2_" + index + " .error").html("");
          angular.element("#business_hours_start2_" + index).removeClass('has-error');
          angular.element("#business_hours_end_" + index + " .error").html("");
          angular.element("#business_hours_end_" + index).removeClass('has-error');
          var startTime2 = hours.start2;
          var endTime2 = hours.end2;
          if (startTime2 && endTime2) {
            startTime2 = (startTime2.split(" ")[1] === 'pm' && startTime2.split(":")[0] !== '12') || (startTime2.split(" ")[1] === 'am' && startTime2.split(":")[0] === '12') ? parseInt(startTime2.split(":")[0], 10) + 12 : parseInt(startTime2.split(":")[0], 10);
            endTime2 = (endTime2.split(" ")[1] === 'pm' && endTime2.split(":")[0] !== '12') || (endTime2.split(" ")[1] === 'am' && endTime2.split(":")[0] === '12') ? parseInt(endTime2.split(":")[0], 10) + 12 : parseInt(endTime2.split(":")[0], 10);
            startTime2 = parseInt(hours.start2.split(":")[1], 10) === 30 ? startTime2 + 0.5 : startTime2;
            endTime2 = parseInt(hours.end2.split(":")[1], 10) === 30 ? endTime2 + 0.5 : endTime2;
          }
          var msg = "";
          if (startTime > endTime || startTime > startTime2 || startTime > endTime2) {
            $scope.isValid = false;
            if (startTime > endTime) {
              msg = "Start time 1 can not be greater than end time 1";
              angular.element("#business_hours_start_" + index + " .error").html(msg);
              angular.element("#business_hours_start_" + index).addClass('has-error');
            } else if (startTime > startTime2) {
              msg = "Start time 1 can not be greater than start time 2";
              angular.element("#business_hours_start_" + index + " .error").html(msg);
              angular.element("#business_hours_start_" + index).addClass('has-error');
            } else if (startTime > endTime2) {
              msg = "Start time 1 can not be greater than end time 2";
              angular.element("#business_hours_start_" + index + " .error").html(msg);
              angular.element("#business_hours_start_" + index).addClass('has-error');
            }
          }
          if (endTime > startTime2 || endTime > endTime2) {
            $scope.isValid = false;
            if (endTime > startTime2) {
              msg = "End time 1 can not be greater than start time 2";
              angular.element("#business_hours_end_" + index + " .error").html(msg);
              angular.element("#business_hours_end_" + index).addClass('has-error');
            } else if (endTime > endTime2) {
              msg = "End time 1 can not be greater than end time 2";
              angular.element("#business_hours_end_" + index + " .error").html(msg);
              angular.element("#business_hours_end_" + index).addClass('has-error');
            }
          }
          if (startTime2 > endTime2) {
            $scope.isValid = false;
            msg = "Start time 2 can not be greater than end time 2";
            angular.element("#business_hours_start2_" + index + " .error").html(msg);
            angular.element("#business_hours_start2_" + index).addClass('has-error');
          }

        } else if (!hours.wholeday) {
          angular.element("#business_hours_start_" + index + " .error").html("");
          angular.element("#business_hours_start_" + index).removeClass('has-error');
          if (startTime > endTime) {
            $scope.isValid = false;
            angular.element("#business_hours_start_" + index + " .error").html("Start time can not be greater than end time");
            angular.element("#business_hours_start_" + index).addClass('has-error');
          }
        }
      }
    };

    $scope.checkIfDirty = function(){
      var isDirty = false;      
      if($scope.originalAccount && !angular.equals($scope.originalAccount, $scope.account))
        isDirty = true;
      return isDirty;
    }
    $scope.resetDirty = function(){
      $scope.originalAccount = null;
      $scope.account = null;
    }

  }]);
}(angular));
