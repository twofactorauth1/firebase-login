'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('jobsCtrl', ['$scope', "JobsService", 'toaster', function ($scope, JobsService, toaster) {

        var vm = this;

        vm.state = {
        };

        vm.uiState = {
            loading: true
        };
        vm.rescheduleJob = rescheduleJob;

        function rescheduleJob(jobId) {
            console.log('controller reschedule job');
            JobsService.rescheduleJob(jobId);
            toaster.pop('success', 'Job rescheduled.');
        };


        (function init() {
            JobsService.listJobs(function(data){
                vm.state.jobs = data;
                console.log('vm.state.jobs:', vm.state.jobs);
            });
        })();

    }]);
}(angular));