'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('usersCtrl', ['$scope', "toaster", "$filter", "$modal", "$timeout", "UserService", "AccountService", "userConstant", "CustomerService", function ($scope, toaster, $filter, $modal, $timeout, UserService, AccountService, userConstant, customerService) {

        var vm = this;

        vm.state = {       
            adminUserName: userConstant.admin_user.userName
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
            UserService.getUsersByAccount(vm.state.account._id, function(users){ 
                // We should not list global admin user
                users = _.reject(users, function(user){ return user.username == vm.state.adminUserName });               
                vm.state.users = users;
                vm.uiState.loading = false;  
                vm.uiState.isAdminUser =  vm.state.account.ownerUser == $scope.currentUser._id || $scope.currentUser.username == vm.state.adminUserName;             
            });
        }

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
            customerService.addNewUser(vm.state.account._id, $scope.newuser.username, $scope.newuser.password, function(err, newuser){
                if(err) {
                    toaster.pop('warning', err.message);
                } else {
                    vm.state.users.push(newuser);
                    $scope.closeModal();
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

        $scope.setUserPassword = function(userId) {
            customerService.setUserPassword(userId, $scope.edituser.password1, function(err, data){
                if(err) {
                    toaster.pop('warning', err.message);
                } else {
                    toaster.pop('info', 'Successfully changed password');
                    $scope.closeEditUserModal();
                }
            });
        };

        function removeUserFromAccount(userId) {
            customerService.removeUserFromAccount(vm.state.account._id, userId, function(err, data){
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
        };

        (function init() {

        })();

    }]);
}(angular));
