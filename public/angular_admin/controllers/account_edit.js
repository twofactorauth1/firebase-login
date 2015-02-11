define(['app', 'userService', 'underscore', 'commonutils', 'adminValidationDirective', 'ngProgress', 'mediaDirective', 'toaster', 'powertour', 'ngSweetAlert'], function(app) {
    app.register.controller('AccountEditCtrl', ['$scope', '$stateParams', 'UserService', 'ngProgress', '$location', 'toaster', 'SweetAlert', function($scope, $stateParams, UserService, ngProgress, $location, toaster, SweetAlert) {
        ngProgress.start();
        var phoneCharLimit = 4;
        if ($stateParams.focus)
            $('[name="' + $stateParams.focus + '"]').focus();
        //back button click function

        $scope.isFormDirty = false;

        $scope.$back = function() {
            if ($scope.isFormDirty) {
                SweetAlert.swal({
                    title: "Are you sure?",
                    text: "You want to lose unsaved data?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, I want to go back!",
                    cancelButtonText: "No, I do not want to leave!",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function(isConfirm) {
                    console.log(isConfirm);
                    if (isConfirm) {
                        window.history.back();
                    }
                });
            } else {
                window.history.back();
            }
        };

        $scope.setFormDirtyFn = function() {
            $scope.isFormDirty = true;
        };

        $scope.saveLoading = false;
        UserService.getUserPreferences(function(preferences) {
            $scope.preferences = preferences;
        });

        // $('.accountEdit').powerTour({
        //   tours : [
        //       {
        //               trigger            : '',
        //               startWith          : 1,
        //               easyCancel         : false,
        //               escKeyCancel       : false,
        //               scrollHorizontal   : false,
        //               keyboardNavigation : true,
        //               loopTour           : false,
        //               onStartTour        : function(ui){ },
        //               onEndTour          : function(){

        //                   // animate back to the top
        //                   $('html, body').animate({scrollTop:0}, 1000, 'swing');
        //                   //$('html, body').animate({scrollLeft:0}, 1000, 'swing');
        //               },
        //               onProgress : function(ui){ },
        //               steps:[
        //                       {
        //                           hookTo          : '#owner_info',//not needed
        //                           content         : '#step-one-account',
        //                           width           : 400,
        //                           position        : 'rt',
        //                           offsetY         : 0,
        //                           offsetX         : 30,
        //                           fxIn            : 'fadeIn',
        //                           fxOut           : 'bounceOutUp',
        //                           showStepDelay   : 500,
        //                           center          : 'step',
        //                           scrollSpeed     : 400,
        //                           scrollEasing    : 'swing',
        //                           scrollDelay     : 0,
        //                           timer           : '00:00',
        //                           highlight       : true,
        //                           keepHighlighted : false,
        //                           onShowStep      : function(ui){ },
        //                           onHideStep      : function(ui){ }
        //                       },
        //                       {
        //                           hookTo          : '#business_info',//not needed
        //                           content         : '#step-two-account',
        //                           width           : 400,
        //                           position        : 'lt',
        //                           offsetY         : 0,
        //                           offsetX         : 50,
        //                           fxIn            : 'fadeIn',
        //                           fxOut           : 'bounceOutUp',
        //                           showStepDelay   : 500,
        //                           center          : 'step',
        //                           scrollSpeed     : 400,
        //                           scrollEasing    : 'swing',
        //                           scrollDelay     : 0,
        //                           timer           : '00:00',
        //                           highlight       : true,
        //                           keepHighlighted : false,
        //                           onShowStep      : function(ui){ },
        //                           onHideStep      : function(ui){ }
        //                       },
        //                       {
        //                           hookTo          : '#saveAccount',//not needed
        //                           content         : '#step-three-account',
        //                           width           : 200,
        //                           position        : 'bl',
        //                           offsetY         : 325,
        //                           offsetX         : 50,
        //                           fxIn            : 'fadeIn',
        //                           fxOut           : 'fadeOut',
        //                           showStepDelay   : 500,
        //                           center          : 'step',
        //                           scrollSpeed     : 400,
        //                           scrollEasing    : 'swing',
        //                           scrollDelay     : 0,
        //                           timer           : '00:00',
        //                           highlight       : true,
        //                           keepHighlighted : false,
        //                           onShowStep      : function(ui){
        //                           },
        //                           onHideStep      : function(ui){ }
        //                       }
        //               ],
        //               stepDefaults:[
        //                       {
        //                           width           : 500,
        //                           position        : 'tr',
        //                           offsetY         : 0,
        //                           offsetX         : 0,
        //                           fxIn            : '',
        //                           fxOut           : '',
        //                           showStepDelay   : 0,
        //                           center          : 'step',
        //                           scrollSpeed     : 200,
        //                           scrollEasing    : 'swing',
        //                           scrollDelay     : 0,
        //                           timer           : '00:00',
        //                           highlight       : true,
        //                           keepHighlighted : false,
        //                           onShowStep      : function(){ },
        //                           onHideStep      : function(){ }
        //                       }
        //               ]
        //           }
        //       ]
        // });

        $scope.beginOnboarding = function(type) {
            // if (type == 'basic-info') {
            //   $('.accountEdit').powerTour('run',0);
            // }
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

        //account API call for object population
        UserService.getAccount(function(account) {
            $scope.account = account;

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

        //user API call for object population
        UserService.getUser(function(user) {
            $scope.user = user;
            $scope.fullName = [user.first, user.middle, user.last].join(' ');
            if (!$scope.user.details[0]) {
                $scope.user.details[0] = [];
            }
            if (!$scope.user.details[0].phones) {
                $scope.user.details[0].phones = [];
            }
            if (!$scope.user.details[0].addresses) {
                $scope.user.details[0].addresses = [];
            }
            if ($scope.user.details[0].phones.length == 0)
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
                    ngProgress.complete();
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

        $scope.deleteBusinessContactFn = function(index) {
            $scope.account.business.phones.splice(index, 1);
            if ($scope.account.business.phones.length === 0) {
                $scope.account.business.phones.push({
                    _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                    number: '',
                    default: false
                });
            }
            $scope.businessPhoneWatchFn($scope.account.business.phones.length - 1);
        };

        //user fullname PUT call
        $scope.$watch('fullName', function(newValue, oldValue) {
            if (newValue) {
                var nameSplit = newValue.match(/\S+/g);
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

        $scope.deleteUserContactFn = function(index) {
            $scope.user.details[0].phones.splice(index, 1);
            if ($scope.user.details[0].phones.length === 0) {
                $scope.user.details[0].phones.push({
                    _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                    number: '',
                    default: false,
                    type: 'm'
                });
            }
            $scope.userPhoneWatchFn($scope.user.details[0].phones.length - 1);
        };

        $scope.insertMedia = function(asset) {
            if ($scope.logo) {
                $scope.account.business.logo = asset.url;
                $("#media-manager-modal").modal('hide');
            } else {
                $scope.user.profilePhotos[0] = asset.url;
            }
        };

        $scope.userSaveFn = function(value) {
            $scope.isFormDirty = true;
            if (value.length % 4 === 0) {
                // UserService.putUser($scope.user, function(user) {
                //   //$scope.user = user;
                // });
            }
        };

        $scope.accountSaveFn = function(value) {
            $scope.isFormDirty = true;
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

        $scope.deleteBusinessAddressFn = function(index) {
            $scope.account.business.addresses.splice(index, 1);
            if ($scope.account.business.addresses.length === 0) {
                $scope.account.business.addresses.push({
                    _id: $$.u.idutils.generateUniqueAlphaNumericShort()
                });
            }
        };

        $scope.toasterOptions = {
            'close-button': true
        };

        $scope.saveAccount = function() {
            $scope.isFormDirty = false;
            $scope.saveLoading = true;
            UserService.putUser($scope.user, function(user) {
                UserService.putAccount($scope.account, function(account) {
                    $scope.saveLoading = false;
                    toaster.pop('success', "Account Saved", "All account information has been saved.");
                    //if theme doesn;t exist, set task complete
                    if (!$scope.preferences.tasks) {
                        $scope.preferences.tasks = {
                            basic_info: false
                        };
                    }
                    if (!$scope.preferences.tasks.basic_info || $scope.preferences.tasks.basic_info == false) {
                        $scope.preferences.tasks.basic_info = true;
                        UserService.updateUserPreferences($scope.preferences, false, function() {
                            toaster.pop('success', "You completed the Basic Info Task!", '<div class="mb15"></div><a href="/admin#/website?onboarding=select-theme" class="btn btn-primary">Next Step: Select A Theme</a>', 0, 'trustedHtml');
                        });
                    };
                });
            });
        };

    }]);
});
