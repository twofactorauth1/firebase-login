'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('DashboardService', DashboardService);

	DashboardService.$inject = ['$http', '$q', '$timeout', 'AccountService'];
	/* @ngInject */
	function DashboardService($http, $q, $timeout, AccountService) {

        var dashboardService = {};
        var baseWorkstreamsAPIUrl = '/api/2.0/dashboard/workstreams';

        dashboardService.getWorkstreams = getWorkstreams;
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
                dashboardService.workstreams = data;
            }

            function error(error) {
                console.error('DashboardService getWorkstreams error: ' + error);
            }

            return dashRequest($http.get(baseWorkstreamsAPIUrl).success(success).error(error));
        }




		(function init() {

            dashboardService.getWorkstreams();


		})();


		return dashboardService;
	}

})();
