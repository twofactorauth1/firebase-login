'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('JobsService', JobsService);

    JobsService.$inject = ['$http', '$q', '$timeout'];
    /* @ngInject */
    function JobsService($http, $q, $timeout) {

        var jobsService = {
        };

        var baseAPIUrl = '/api/1.0/admin/jobs';
        var baseJobsUrl = baseAPIUrl + '/scheduled';
        jobsService.loading = {value:0};

        jobsService.listJobs = listJobs;
        jobsService.rescheduleJob = rescheduleJob;

        function jobsRequest(fn) {
            jobsService.loading.value = jobsService.loading.value + 1;
            fn.finally(function() {
                jobsService.loading.value = jobsService.loading.value - 1;
            });
            return fn;
        }

        function listJobs(cb) {
            function success(data) {
                //console.log('jobsService listJobs: ', JSON.stringify(data));
                jobsService.jobs = data;
                cb(data);
            }
            function error(error) {
                console.error('jobsService listJobs error: ', JSON.stringify(error));
            }

            return jobsRequest($http.get(baseJobsUrl).success(success).error(error));
        }

        function rescheduleJob(jobId) {
            var url = [baseAPIUrl, jobId, 'reschedule'].join('/');
            function success(data) {
                console.log('successfully rescheduled');
            }
            function error(error) {
                console.error('jobsService listJobs error: ', JSON.stringify(error));
            }

            return jobsRequest($http.post(url).success(success).error(error));
        }



        (function init() {


        })();


        return jobsService;
    }

})();
