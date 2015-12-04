'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('DashboardService', DashboardService);

	DashboardService.$inject = ['$http', '$q', '$timeout', 'AccountService'];
	/* @ngInject */
	function DashboardService($http, $q, $timeout, AccountService) {

        var dashboardService = {
            state: {
                workstreams:[],
                reports:{}
            }
        };
        var baseWorkstreamsAPIUrl = '/api/2.0/dashboard/workstreams';
        var baseReportsAPIUrl = '/api/2.0/dashboard/reports';

        dashboardService.getWorkstreams = getWorkstreams;
        dashboardService.getWorkstream = getWorkstream;
        dashboardService.unlockWorkstream = unlockWorkstream;
        dashboardService.getContactsByDayReport = getContactsByDayReport;
        dashboardService.loading = {value:0};

		function dashRequest(fn) {
            dashboardService.loading.value = dashboardService.loading.value + 1;
            console.info('dashService | loading +1 : ' + dashboardService.loading.value);
            fn.finally(function() {
                dashboardService.loading.value = dashboardService.loading.value - 1;
                console.info('dashService | loading -1 : ' + dashboardService.loading.value);
            });
            return fn;
		}

        function getWorkstreams() {

            function success(data) {
                dashboardService.state.workstreams = data;
            }

            function error(error) {
                console.error('DashboardService getWorkstreams error: ' + error);
            }

            return dashRequest($http.get(baseWorkstreamsAPIUrl).success(success).error(error));
        }

        function getWorkstream(id) {

            function success(data) {
                console.info('DashboardService getWorkstream:', data);
            }

            function error(error) {
                console.error('DashboardService getWorkstream:', error);
            }

            return dashRequest($http.get(baseWorkstreamsAPIUrl + '/' + id).success(success).error(error));
        }

        function unlockWorkstream(id) {

            function success(data) {

                console.info('DashboardService unlockWorkstream:', data);

                //replace updated workstream with server response
                _.extend(_.findWhere(dashboardService.state.workstreams, { _id: data._id }), data);

            }

            function error(error) {
                console.error('DashboardService unlockWorkstream:', error);
            }

            return dashRequest($http.post(baseWorkstreamsAPIUrl + '/' + id + '/unlock').success(success).error(error));

        }

        function getContactsByDayReport() {
            function success(data) {
                dashboardService.state.reports.contactsByDay = data;
            }

            function error(error) {
                console.error('DashboardService getContactsByDayReport error: ' + error);
            }

            return dashRequest($http.get(baseReportsAPIUrl + '/contactsByDay').success(success).error(error));
        }




		(function init() {

            dashboardService.getWorkstreams();


		})();


		return dashboardService;
	}

})();
