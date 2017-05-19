'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('usersCtrl', ['$scope', "toaster", "$filter", "$modal", "$timeout", "AccountService","UserService", "userConstant", "formValidations", "SweetAlert", function ($scope, toaster, $filter, $modal, $timeout, AccountService,UserService, userConstant, formValidations, SweetAlert) {

        var vm = this;

        vm.state = {
            adminUserName: userConstant.admin_user.userName,
            adminUserEmailFilter: userConstant.admin_user.emailDomain
        };

        vm.uiState = {
            loading: true
        };

        vm.openSimpleModal = openSimpleModal;
        //vm.addNewUser = addNewUser;
        vm.removeUserFromAccount = removeUserFromAccount;

        AccountService.getUpdatedAccount(function (account) {
            vm.state.account = account;
            loadAccountUsers();
        });

        function loadAccountUsers(){
            AccountService.getUsersByAccount(vm.state.account._id, function(users){
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
            }
        }, true)

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
                    AccountService.addNewUser(vm.state.account._id, $scope.newuser.username, $scope.newuser.password, function(err, newuser){
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
                $scope.newuser = null;
            });
        };

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

        $scope.checkPasswordLength = function() {
            $scope.passwordInValid = false;
            if ($scope.edituser && $scope.edituser.password1 && $scope.edituser.password1.length < 6) {
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

        $scope.checkIfValidUserName = function(userName){
            var regex = formValidations.email;
            return regex.test(userName);
        };

        (function init() {

        })();

    }]);
}(angular));
