'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('messagesCtrl', ['$scope', "$location", "BroadcastMessagesService", function ($scope, $location, BroadcastMessagesService) {

        var vm = this;

        vm.state = {
        };

        vm.uiState = {
            loading: true
        };

        vm.editMessage = editMessage;
        vm.deleteMessage = deleteMessage;
        function editMessage(id){
            if(!id)
                id = "new";
            var message_url = '/customer/messages/' + id;
            $location.url(message_url);
        }


        function deleteMessage(message) {        
            vm.uiState.saveLoading = true;
            
            return BroadcastMessagesService.deleteMessage(message).then(function(message) {
                console.log('message deleted');                
            }).catch(function(error) {
                console.log(error)
            }).finally(function() {
                vm.uiState.saveLoading = false;
            });
        }
        
        var unbindMessageWatcher = $scope.$watch(function() { return BroadcastMessagesService.messages }, function(messages) {          
            if(angular.isDefined(messages)){
                vm.state.messages = messages
                vm.uiState.loading = false;
            }
          
        }, true);

        (function init() {

        })();

    }]);
}(angular));