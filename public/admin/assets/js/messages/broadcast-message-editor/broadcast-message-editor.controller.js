'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('broadcastMessageEditorCtrl', ['$scope', "$location", "BroadcastMessagesService", function ($scope, $location, BroadcastMessagesService) {

        var vm = this;

        vm.state = {
            message: {
                message: ""
            }
        };

        vm.uiState = {
            loading: true
        };

        (function init() {

        })();

    }]);
}(angular));