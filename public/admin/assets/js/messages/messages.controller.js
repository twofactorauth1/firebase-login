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

        vm.createNewMessage = createNewMessage;

        function createNewMessage(){
            var message_url = '/customer/messages/new';
            $location.url(message_url);
        }
        
        var unbindPagesWatcher = $scope.$watch(function() { return BroadcastMessagesService.messages }, function(messages) {
          // To track duplicate pages
          vm.state.originalMessages = angular.copy(messages);
          vm.state.messages = angular.copy(messages);
          vm.uiState.loading = false;
        }, true);

        (function init() {

        })();

    }]);
}(angular));