'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('broadcastMessageEditorCtrl', ['$scope', "$location", "BroadcastMessagesService", function ($scope, $location, BroadcastMessagesService) {

        var vm = this;

        vm.state = {
            
        };

        vm.uiState = {
            loading: true,
            saveLoading: false
        };

        vm.saveMessage = saveMessage;

        vm.backToMessages = backToMessages;

        function saveMessage() {        
            vm.uiState.saveLoading = true;
            if(vm.state.message && !vm.state.message._id){
                return BroadcastMessagesService.createMessage(vm.state.message).then(function(message) {
                    console.log('message created');
                    
                }).catch(function(error) {
                    console.log(error)
                }).finally(function() {
                    vm.uiState.saveLoading = false;
                });
            }
            else if(vm.state.message && vm.state.message._id){
                return BroadcastMessagesService.updateMessage(vm.state.message, vm.state.message._id).then(function(message) {
                    console.log('message updated');
                    
                }).catch(function(error) {
                    console.log(error)
                }).finally(function() {
                    vm.uiState.saveLoading = false;
                });
            }
                
        }

        function backToMessages()
        {
            $location.url("/customer/messages");
        }

        var unbindMessageWatcher = $scope.$watch(function() { return BroadcastMessagesService.message }, function(message) {          
          if(message){
            vm.state.message = message;
          }
        }, true);

        (function init() {
            
        })();

    }]);
}(angular));