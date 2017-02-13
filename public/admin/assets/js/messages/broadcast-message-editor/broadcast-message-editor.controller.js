'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('broadcastMessageEditorCtrl', ['$scope', "$location", "toaster", "BroadcastMessagesService", function ($scope, $location, toaster, BroadcastMessagesService) {

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
            if(!vm.state.message.startDate || !vm.state.message.endDate) {
                vm.uiState.saveLoading = false;
                toaster.pop('warn', 'Missing Message Dates.', 'Please enter start and end dates for the broadcast message.');
                return;
            }


            if(vm.state.message.endDate){                
                var _date = new Date(vm.state.message.endDate);
                // Setting time of the selected day to maximum
                _date.setHours(23);
                _date.setMinutes(59);
                _date.setSeconds(59);
                vm.state.message.endDate = _date;
            }

            if(vm.state.message && !vm.state.message._id){
                return BroadcastMessagesService.createMessage(vm.state.message).then(function(message) {
                    console.log('message created');
                    toaster.pop('success', 'Message created', 'The message was created successfully.');
                }).catch(function(error) {
                    console.log(error);
                }).finally(function() {
                    vm.uiState.saveLoading = false;
                });
            }
            else if(vm.state.message && vm.state.message._id){
                return BroadcastMessagesService.updateMessage(vm.state.message, vm.state.message._id).then(function(message) {
                    console.log('message updated');
                    toaster.pop('success', 'Message saved', 'The message was saved successfully.');
                }).catch(function(error) {
                    console.log(error);
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