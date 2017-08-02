'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('jobsCtrl', ['$scope', "JobsService", function ($scope, JobsService) {

        var vm = this;

        vm.state = {
        };

        vm.uiState = {
            loading: true
        };


        (function init() {
            JobsService.listJobs(function(data){
                vm.state.jobs = data;
                console.log('vm.state.jobs:', vm.state.jobs);
            });
        })();

    }]);
}(angular));