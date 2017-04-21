'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('usersCtrl', ['$scope', '$http', "toaster", "$filter", "$modal", "$timeout", "AccountService","UserService", "userConstant", "SweetAlert", function ($scope, $http, toaster, $filter, $modal, $timeout, AccountService,UserService, userConstant, SweetAlert) {

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
                vm.uiState.isAdminUser =  vm.state.account.ownerUser == $scope.currentUser._id || $scope.currentUser.username == vm.state.adminUserName;             
            });
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
                    /*
                     * Not sure if this is helpful or not... but you can set the roleAry and cardCodes in the params object
                     * and it will be passed to the API:
                     *
                     * params.roleAry = ['vendor'];
                     * params.cardCodes = ['C111111', 'C111112']
                     * etc
                     */
                    var params = {
                        roleAry:['vendor'],
                        cardCodes:['C111111', 'C111112']
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

        $scope.openEditUserCardModal = function(userId) {
            $scope.currentUserId = userId;
            $scope.editUser = null;
            // UserService.getUser(function(user){
            //     var userAccount = _.find(user.accounts, function(account){
            //         return vm.state.account._id == account.accountId
            //     })
            //     if(userAccount){
            //         $scope.permissions = userAccount.permissions;
            //         $scope.userIsAdmin = $scope.permissions.include
            //     }
            // })
            $scope.editUser = _.find(vm.state.users, function(user){
                return user._id == userId
            })
            $scope.isAdmin = true;
            vm.openSimpleModal('edit-user-card-modal');
        };
        $scope.closeUserCardModal = function() {
            $scope.currentUserId = null;
            $scope.closeModal();
        };

        $scope.updateUser = function(){
            UserService.editUser($scope.editUser, $scope.currentUserId, function(){
                $scope.closeUserCardModal();
            })
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




        (function init() {

        })();

    }]);
}(angular));
