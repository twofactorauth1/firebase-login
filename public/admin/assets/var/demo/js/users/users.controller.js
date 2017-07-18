'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('usersCtrl', ['$scope', '$state', '$http', "toaster", "$filter", "$modal", "$timeout", "AccountService","UserService", "userConstant", "formValidations", "SweetAlert", "pagingConstant", "UtilService", function ($scope, $state, $http, toaster, $filter, $modal, $timeout, AccountService,UserService, userConstant, formValidations, SweetAlert, pagingConstant, UtilService) {

        var vm = this;

        vm.state = {
            adminUserName: userConstant.admin_user.userName,
            adminUserEmailFilter: userConstant.admin_user.emailDomain,
            cardCodes: null,
            isAdmin: false
        };

        vm.uiState = {
            loading: true
        };

        vm.showFilteredRecords = showFilteredRecords;

        vm.openSimpleModal = openSimpleModal;
        //vm.addNewUser = addNewUser;
        vm.removeUserFromAccount = removeUserFromAccount;

        vm.pagingConstant = pagingConstant;
        vm.validateUserDetails = validateUserDetails;
        vm.setDefaults = setDefaults;

        $scope.$watch("$parent.orgCardAndPermissions", function(orgCardAndPermissions){
            if(orgCardAndPermissions){
              if(_.contains(orgCardAndPermissions.userPermissions.vendorRestrictedStates, $state.current.name)){
                $state.go(orgCardAndPermissions.dashboardState);
              }
              else{
                AccountService.getUpdatedAccount(function (account) {
                    vm.state.account = account;
                    loadAccountUsers();
                });
              }
            }
        })

        function loadAccountUsers(){
            UserService.getAccountUsers(function(users){
                // We should not list global admin user
                users = _.reject(users, function(user){ return user.username == vm.state.adminUserName });
                vm.state.users = users;
                vm.uiState.loading = false;
                vm.uiState.isAdminUser =  vm.state.account.ownerUser == $scope.currentUser._id || $scope.currentUser.username == vm.state.adminUserName || checkIfAdminUser();
            });
        }

        function checkIfAdminUser(){
            var _isAdmin = false;
            var _userAccount = _.find($scope.currentUser.accounts, function(account){
                return account.accountId == vm.state.account._id
            })

            if(_userAccount && _userAccount.permissions){
                if(_.contains(_userAccount.permissions, "admin")){
                    _isAdmin = true;
                }
            }
            return _isAdmin;
        }

        $scope.$watch('vm.state.users', function (users) {
            if(users){
                vm.state.filterUsers = _.filter(users, function(user){
                    return user.username.indexOf(vm.state.adminUserEmailFilter) === -1
                });
                setUserForUsers();
            }
        }, true)

        function setUserForUsers(){
            _.each(vm.state.users, function(user){
                user.userInfo = getFliteredName(user);
            })
        }

        function getFliteredName(user) {
            var _userName = "";
            if(user.first || user.last){
                _userName = user.first + " " + user.last;
            }
            else{
                _userName = user.username;
            }
            return _userName.trim();
        }

        // $scope.$watch('vm.state.userType', function (type) {
        //     if(type){
        //         if(type !== 'vendor'){
        //             vm.state.cardCodes = [];
        //         }
        //         if(type !== 'vendor-restricted'){
        //             vm.state.vendorName = "";
        //         }
        //     }
        // }, true)

        function openSimpleModal(modal){
            var _modal = {
                templateUrl: modal,
                scope: $scope,
                keyboard: false,
                backdrop: 'static'
            };
            $scope.modalInstance = $modal.open(_modal);
            $scope.modalInstance.result.then(null, function () {
                angular.element('.sp-container').addClass('sp-hidden');
            });
        }

        $scope.addNewUser = function() {
            console.log('Adding the following:', $scope.newuser);
            //find by username
            UserService.findUserByUsername($scope.newuser.username,
            function(err,exitinguser){
                if(err){
                   toaster.pop('warning', err.message);
                }else if(exitinguser){
                    //copy exiting
                    AccountService.copyExitingUser(exitinguser._id, function(err, user){
                        if(err) {
                            toaster.pop('warning', err.message);
                        } else {
                            $timeout(function() {
                                vm.state.users.push(user);
                            }, 0);
                            $scope.closeModal();
                        }
                    });
                }else{
                    //add new
                    /*
                     * Not sure if this is helpful or not... but you can set the roleAry and cardCodes in the params object
                     * and it will be passed to the API:
                     *
                     * params.roleAry = ['vendor'];
                     * params.cardCodes = ['C111111', 'C111112']
                     * etc
                     */
                    var roleAry = getUserPermissions();

                    var params = {
                        roleAry: roleAry,
                        orgConfig: setNewOrgConfig()
                    };
                    AccountService.addNewUserWithParams(vm.state.account._id, $scope.newuser.username, $scope.newuser.password, params, function(err, newuser){
                        if(err) {
                            toaster.pop('warning', err.message);
                        } else {
                            $timeout(function() {
                                vm.state.users.push(newuser);
                            }, 0);
                            $scope.closeModal();
                        }
                    });
                }
                setDefaults();
            });
        };


        function setDefaults(){
            $scope.newuser = null;
            vm.state.userType = null;
            vm.vendorName = null;
        }

        function validateUserDetails(){
            var _isValid = true;
            if(!vm.state.userType){
                _isValid = false;
            }
            if(vm.state.userType === 'vendor-restricted' && !vm.state.vendorName){
                _isValid = false;
            }
            if(vm.state.userType === 'vendor'){
                var _cardCodes = vm.state.cardCodes || [];
                if(!_cardCodes.length){
                    _isValid = false;
                }
            }
            return _isValid;
        }

        function setNewOrgConfig(){
            var orgConfig = [{
                orgId: vm.state.account.orgId
            }]
            switch (vm.state.userType) {
                case 'vendor':
                    orgConfig[0].cardCodes = vm.state.cardCodes;
                    break;
                case 'vendor-restricted':
                    orgConfig[0].vendorName = vm.state.vendorName;
                    orgConfig[0].modules = {
                        dashboard: false,
                        inventory: true,
                        ledger: false,
                        purchaseorders: false
                    };
                    orgConfig[0].inventoryFilter = {
                        _shortVendorName: vm.state.vendorName
                    }
                    break;
                default:
            }
            return orgConfig;
        }

        $scope.closeModal = function () {
            $scope.modalInstance.close();
        };

        $scope.openEditUserModal = function(userId) {
            $scope.currentUserId = userId;
            vm.openSimpleModal('edit-password-modal');
        };
        $scope.closeEditUserModal = function() {
            $scope.currentUserId = null;
            $scope.closeModal();
        };

        $scope.openEditUserCardModal = function(userId) {
            $scope.currentUserId = userId;

            $scope.editUser = null;
            $scope.editUser = _.find(vm.state.users, function(user){
                return user._id == userId
            })

            var _userAccount = _.find($scope.editUser.accounts, function(account){
                return account.accountId == vm.state.account._id
            })

            if(_userAccount && _userAccount.permissions){
                if(_.contains(_userAccount.permissions, "admin")){
                    vm.state.userType = 'admin';
                }
                else if(_.contains(_userAccount.permissions, "vendor")){
                    vm.state.userType = 'vendor';
                }
                else if(_.contains(_userAccount.permissions, "vendor-restricted")){
                    vm.state.userType = 'vendor-restricted';
                }
                else if(_.contains(_userAccount.permissions, "securematics")){
                    vm.state.userType = 'securematics';
                }
            }

            getOrgConfig(vm.state.account.orgId);

            vm.openSimpleModal('edit-user-card-modal');
        };
        $scope.closeUserCardModal = function() {
            $scope.currentUserId = null;
            $scope.closeModal();
        };

        $scope.updateUser = function(){
            setOrgConfig(vm.state.account.orgId);
            var _permissions = getUserPermissions();
            UserService.editUser($scope.editUser, $scope.currentUserId, function(){
                UserService.updateUserPermisions($scope.currentUserId, _permissions, function(user){
                    updateUserPermissions(user, $scope.currentUserId);
                    toaster.pop('info', 'Successfully updated');
                    $scope.closeUserCardModal();
                })
            })
        };

        $scope.checkPasswordLength = function() {
            $scope.passwordInValid = false;
            if ($scope.edituser && $scope.edituser.password1 && $scope.edituser.password1.length < 6) {
                $scope.passwordInValid = true;
            } else if ($scope.newuser && $scope.newuser.password.length<6){
                $scope.passwordInValid = true;
            } else {
                $scope.passwordInValid = false;
            }
        };


        $scope.setUserPassword = function(userId) {
            $scope.checkPasswordLength();
            if($scope.passwordInValid){
                return;
            }
            AccountService.setUserPassword(userId, $scope.edituser.password1, function(err, data){
                if(err) {
                    toaster.pop('warning', err.message);
                } else {
                    toaster.pop('info', 'Successfully changed password');
                    $scope.closeEditUserModal();
                }
            });
        };

        function removeUserFromAccount(userId) {
            SweetAlert.swal({
              title: "Are you sure?",
              text: "You want to delete this user.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes",
              cancelButtonText: "No",
              closeOnConfirm: true,
              closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    AccountService.removeUserFromAccount(userId, function(err, data){
                        if(err) {
                            toaster.pop('warning', err.message);
                        } else {
                            vm.state.users = _.filter(vm.state.users, function(user){
                                if(user._id !== userId) {
                                    return true;
                                }
                            });
                        }
                    });
                }
            });
        };

        function getOrgConfig(orgId){
            var orgConfigAry = $scope.editUser.orgConfig || [];

            var orgConfig = _.find(orgConfigAry, function(config){
                return config.orgId == orgId
            });
            if(orgConfig){
                vm.state.cardCodes = orgConfig.cardCodes;
                vm.state.vendorName = orgConfig.vendorName;
            } else{
                vm.state.cardCodes = null;
            }
        };

        function setOrgConfig(orgId){
            var orgConfigAry = $scope.editUser.orgConfig || [];

            var orgConfig = _.find(orgConfigAry, function(config){
                return config.orgId == orgId
            });
            if(orgConfig){
                // orgConfig.cardCodes = vm.state.cardCodes;
                // orgConfig.vendorName = vm.state.vendorName;
            } else {
                orgConfigAry.push({
                    orgId: orgId
                })
            }

            if(!orgConfigAry[0].modules){
                orgConfigAry[0].modules = {};
            }

            switch (vm.state.userType) {
                case 'vendor':
                    orgConfigAry[0].cardCodes = vm.state.cardCodes;
                    delete orgConfigAry[0].vendorName;
                    delete orgConfigAry[0].inventoryFilter;
                    break;
                case 'vendor-restricted':
                    delete orgConfigAry[0].cardCodes;
                    orgConfigAry[0].vendorName = vm.state.vendorName;
                    orgConfigAry[0].modules.ledger = false;
                    orgConfigAry[0].modules.purchaseorders = false;
                    orgConfigAry[0].inventoryFilter = {
                        _shortVendorName: vm.state.vendorName
                    }
                    break;
                default:
                    delete orgConfigAry[0].cardCodes;
                    delete orgConfigAry[0].vendorName;
                    delete orgConfigAry[0].inventoryFilter;
            }

        };

        function getUserPermissions(){
            var permissions = [];
            if(vm.state.userType === 'admin'){
                permissions = ["super", "admin", "member"]
            }
            else{
                permissions = [vm.state.userType]
            }
            return permissions;
        }

        function updateUserPermissions(user, userId){
            var editUser = _.find(vm.state.users, function(user){
                return user._id == userId
            })

            var _editUserAccount = _.find(editUser.accounts, function(account){
                return account.accountId == vm.state.account._id
            })

            var _updatedUserAccount = _.find(user.accounts, function(account){
                return account.accountId == vm.state.account._id
            })

            if(_editUserAccount && _updatedUserAccount){
                _editUserAccount.permissions = angular.copy(_updatedUserAccount.permissions);
            }

        }

        $scope.checkIfValidUserName = function(userName){
            var regex = formValidations.email;
            return regex.test(userName);
        };

        vm.getters = {
            name: function (value) {
                return value.first || '' + value.last || '';
            },
            ip: function (value) {
                return value.lastLoginIP || "";
            },
            loginDate: function (value) {
                return value.lastLoginDate || "";
            }
        };

        function showFilteredRecords(){
            return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
        }

        (function init() {
            UserService.getVendors(function(data){
                vm.state.vendors = data;
            })
        })();

    }]);
}(angular));
