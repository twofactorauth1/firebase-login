define(['app', 'userService', 'underscore', 'commonutils', 'adminValidationDirective', 'ngProgress', 'mediaDirective', 'ngOnboarding', 'toaster'], function(app) {
  app.register.controller('AccountEditCtrl', ['$scope', '$stateParams', 'UserService', 'ngProgress', '$location', 'toaster', function($scope, $stateParams, UserService, ngProgress, $location, toaster) {
    ngProgress.start();
    var phoneCharLimit = 4;
    if ($stateParams.focus)
      $('[name="' + $stateParams.focus + '"]').focus();
    //back button click function
    $scope.$back = function() {
      window.history.back();
    };

    $scope.beginOnboarding = function(type) {
        if (type == 'basic-info') {
            $scope.stepIndex = 0
            $scope.showOnboarding = true;
            $scope.onboardingSteps = [
              {
                overlay: true,
                title: 'Task: Enter Basic Info',
                description: "Enter in your basic information. With your business address we can get more information about your local competitors. We will automatically add your logo to your website and emails. Tell us more about yourself so we can customize your experience.",
                position: 'centered'
              }
              // {
              //   attachTo: '.btn-view-themes',
              //   position: 'bottom',
              //   overlay: false,
              //   title: 'Themes Tab',
              //   width: 400,
              //   description: "This is the theme tab where you can change or modify your theme after you choose one."
              // },
              // {
              //   attachTo: '.themes',
              //   position: 'top',
              //   overlay: false,
              //   title: 'Select A Theme',
              //   description: 'Choose one of the themes from below by clicking the switch button.'
              // }
            ];
        }
    };

    if ($location.$$search['onboarding']) {
        console.log('onboarding');
        $scope.beginOnboarding($location.$$search['onboarding']);
    }

    //business phone watch setup
    $scope.businessPhoneWatchFn = function(index) {
      $scope.$watch('account.business.phones[' + index + ']', function(newValue, oldValue) {
        if (newValue && newValue.number.length > phoneCharLimit) {
          // UserService.putAccount($scope.account, function(account) {
          //   //$scope.account = account;
          // });
        }
      }, true);
    };

    $scope.userPhoneWatchFn = function(index) {
      $scope.$watch('user.details[0].phones[' + index + ']', function(newValue, oldValue) {
        if (newValue && newValue.number.length > phoneCharLimit) {
          // UserService.putUser($scope.user, function(account) {
          //   //$scope.account = account;
          // });
        }
      }, true);
    };

    //user API call for object population
    UserService.getUser(function(user) {
      $scope.user = user;
      $scope.fullName = [user.first, user.middle, user.last].join(' ');
      if (!$scope.user.details[0].phones.length)
        $scope.user.details[0].phones.push({
          _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
          number: '',
          default: false,
          type: 'm'
        });
      $scope.user.details[0].phones.forEach(function(value, index) {
        $scope.userPhoneWatchFn(index);
      });
      if (!$scope.user.details[0].addresses.length)
        $scope.user.details[0].addresses.push({
          _id: $$.u.idutils.generateUniqueAlphaNumericShort()
        });
    });

    //account API call for object population
    UserService.getAccount(function(account) {
      $scope.account = account;
      ngProgress.complete();
      if (!$scope.account.business.phones.length)
        $scope.account.business.phones.push({
          _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
          number: '',
          default: false
        });
      $scope.account.business.phones.forEach(function(value, index) {
        $scope.businessPhoneWatchFn(index);
      });

      if (!$scope.account.business.addresses.length)
        $scope.account.business.addresses.push({
          _id: $$.u.idutils.generateUniqueAlphaNumericShort()
        });
    });

    //business phone field add
    $scope.addBusinessContactFn = function() {
      $scope.account.business.phones.push({
        _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
        number: '',
        default: false
      });
      $scope.businessPhoneWatchFn($scope.account.business.phones.length - 1);
    };

    //user fullname PUT call
    $scope.$watch('fullName', function(newValue, oldValue) {
      if (newValue) {
        var nameSplit = newValue.split(' ');
        if (nameSplit.length >= 3) {
          $scope.user.first = nameSplit[0];
          $scope.user.middle = nameSplit[1];
          $scope.user.last = nameSplit[2];
        } else if (nameSplit.length == 2) {
          $scope.user.first = nameSplit[0];
          $scope.user.middle = '';
          $scope.user.last = nameSplit[1];
        } else if (nameSplit.length == 1) {
          $scope.user.first = nameSplit[0];
          $scope.user.middle = '';
          $scope.user.last = '';
        } else {
          $scope.user.first = '';
          $scope.user.middle = '';
          $scope.user.last = '';
        }
        // UserService.putUser($scope.user, function(user) {
        //   //$scope.user = user;
        // });
      }
    });

    ['user.email'].forEach(function(value) {
      // $scope.$watch(value, function(newValue, oldValue) {
      //   if (newValue) {
      //     UserService.putUser($scope.user, function(user) {
      //       //$scope.user = user;
      //     });
      //   }
      // });
    });

    $scope.$watch('account.business.size', function(newValue, oldValue) {
      if ($scope.account && $scope.account.business.size !== parseInt($scope.account.business.size))
        $scope.account.business.size = parseInt($scope.account.business.size);
      // UserService.putAccount($scope.account, function(account) {
      //   //$scope.account = account;
      // });
    });

    $scope.$watch('account.business.type', function(newValue, oldValue) {
      if ($scope.account && $scope.account.business.type !== parseInt($scope.account.business.type))
        $scope.account.business.type = parseInt($scope.account.business.type);
      // UserService.putAccount($scope.account, function(account) {
      //   // $scope.account = account;
      // });
    });


    // ['account.business.name',
    //   'account.business.description',
    //   'account.business.category'
    // ].forEach(function(value) {
    //   // $scope.$watch(value, function(newValue, oldValue) {
    //   //   UserService.putAccount($scope.account, function(account) {
    //   //     //$scope.account = account;
    //   //   });
    //   // });
    // });

      // $scope.$watch('account.business.nonProfit', function(newValue, oldValue) {
      //   if (angular.isDefined(newValue)) {
      //     UserService.putAccount($scope.account, function(account) {
      //       //$scope.account = account;
      //     });
      //   }
      // });

    $scope.userPhoneTypeSaveFn = function(index, type) {
      var typeLabel = null;
      if (type == 'm')
        typeLabel = 'mobile';
      if (type == 'h')
        typeLabel = 'home';
      if (type == 'w')
        typeLabel = 'work';
      $('#user-phone-type-' + index).html(typeLabel);
      $scope.user.details[0].phones[index].type = type;
    };

    //business phone field add
    $scope.addUserContactFn = function() {
      $scope.user.details[0].phones.push({
        _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
        number: '',
        default: false,
        type: 'm'
      });
      $scope.userPhoneWatchFn($scope.user.details[0].phones.length - 1);
    };

    $scope.insertMedia = function(asset) {
      if($scope.logo)
      {
        $scope.account.business.logo = asset.url;
        $("#media-manager-modal").modal('hide');
      }
      else
      {
        $scope.user.profilePhotos[0] = asset.url;
      }
    };

    $scope.userSaveFn = function(value) {
      if (value.length % 4 === 0) {
        // UserService.putUser($scope.user, function(user) {
        //   //$scope.user = user;
        // });
      }
    };

    $scope.accountSaveFn = function(value) {
      if (value.length % 4 === 0) {
        // UserService.putAccount($scope.account, function(account) {

        // });
      }
    };

    $scope.addBusinessAddressFn = function() {
      $scope.account.business.addresses.push({
        _id: $$.u.idutils.generateUniqueAlphaNumericShort()
      });
    };

    $scope.saveAccount = function() {
      console.log('saving account');
      UserService.putUser($scope.user, function(user) {
        console.log('user saved');
          UserService.putAccount($scope.account, function(account) {
            console.log('account saved');
            toaster.pop('success', "Account Saved", "All account information has been saved.");
          });
      });
    };

  }]);
});
