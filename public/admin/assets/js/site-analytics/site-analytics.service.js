'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('SiteAnalyticsService', SiteAnalyticsService);

    SiteAnalyticsService.$inject = ['$rootScope', '$compile', '$http', '$q', '$timeout', 'AccountService'];
    /* @ngInject */
    function SiteAnalyticsService($rootScope, $compile, $http, $q, $timeout, AccountService) {
        var saService = {};
        var baseAnalyticsAPIUrl = '/api/1.0/analytics/reports';
        var adminAnalyticsAPIUrl = '/api/1.0/analytics/admin/reports';
        saService.runReports = runReports;
        saService.runAdminReports = runAdminReports;
        saService.loading = {value:0};


        /**
         * A wrapper around API requests
         * @param {function} fn - callback
         *
         * @returns {function} fn - callback
         *
         */
        function saRequest(fn) {
            saService.loading.value = saService.loading.value + 1;
            console.info('service | loading +1 : ' + saService.loading.value);
            fn.finally(function() {
                saService.loading.value = saService.loading.value - 1;
                console.info('service | loading -1 : ' + saService.loading.value);
            });
            return fn;
        }

        /**
         * Runs the analytics reports needed for the site analytics page
         * @returns {Function}
         */
        function runReports(startDate, endDate, fn) {
            function success(data) {
                saService.reports = data;
                fn(data);
            }

            function error(error) {
                console.error('SiteAnalyticsService runReports error:', JSON.stringify(error));
            }
            var startDateString = moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
            return saRequest($http.get(baseAnalyticsAPIUrl + '/all?start=' + startDateString + '&end=' + endDateString).success(success).error(error));
        }

        function runAdminReports(startDate, endDate, fn) {
            function success(data) {
                saService.reports = data;
                fn(data);
            }

            function error(error) {
                console.error('SiteAnalyticsService runReports error:', JSON.stringify(error));
            }
            var startDateString = moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
            return saRequest($http.get(adminAnalyticsAPIUrl + '/all?start=' + startDateString + '&end=' + endDateString).success(success).error(error));
        }



        (function init() {

            AccountService.getAccount(function(data) {
                saService.account = data;
                //saService.runReports();
            });

        })();


        return saService;
    }

})();
