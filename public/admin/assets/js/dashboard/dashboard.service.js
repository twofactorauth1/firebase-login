'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('DashboardService', DashboardService);

	DashboardService.$inject = ['$http', '$q', '$timeout'];
	/* @ngInject */
	function DashboardService($http, $q, $timeout) {

        var dashboardService = {
            state: {
                workstreams:[],
                reports:{}
            }
        };
        var baseWorkstreamsAPIUrl = '/api/2.0/dashboard/workstreams';
        var baseReportsAPIUrl = '/api/2.0/dashboard/reports';
        var baseAccountAPIUrl = '/api/1.0/account/';

        dashboardService.loading = { value:0 };
        dashboardService.updatedWorkstreams = false;
        dashboardService.lastWorkstreamSet = [];
        dashboardService.awayFromDashboard = false;
        dashboardService.polls = 0;

        dashboardService.getWorkstreams = getWorkstreams;
        dashboardService.getWorkstream = getWorkstream;
        dashboardService.unlockWorkstream = unlockWorkstream;

        dashboardService.updateAccount = updateAccount;
        dashboardService.setAwayFromDashboard = setAwayFromDashboard;

        dashboardService.getContactsByDayReport = getContactsByDayReport;
        dashboardService.getPageViewsByDayReport = getPageViewsByDayReport;
        dashboardService.getNewVisitorsByDayReport = getNewVisitorsByDayReport;
        dashboardService.getRevenueByMonthReport = getRevenueByMonthReport;


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

            function success(newWorkstreamSet) {

                /*
                 * Server data always sets dashboard state
                 */
                dashboardService.state.workstreams = newWorkstreamSet;

                /*
                 * if we're on the dashboard
                 */
                if (!dashboardService.awayFromDashboard) {

                    /*
                     * save the last set from the server for comparison later
                     */
                    dashboardService.lastWorkstreamSet = angular.copy(newWorkstreamSet);

                    /*
                     * remove the ui-only props we dont want for the comparison
                     */
                    _.each(dashboardService.lastWorkstreamSet, function(ws) {
                        delete ws.completeRatio;
                        delete ws.completePercentage;
                    });

                } else {

                    /*
                     * we're on some other page, see if user is making things happen
                     */
                    if (!angular.equals(dashboardService.lastWorkstreamSet, newWorkstreamSet)) {

                        /*
                         * user has performed some steps, so flag that new data has come in
                         */
                        dashboardService.updatedWorkstreams = true;

                    } else {

                        /*
                         * user has not performed any workstream-related tasks, so no flag needed
                         */
                        dashboardService.updatedWorkstreams = false;
                    }

                }

                /*
                 * continuously poll for workstream updates
                 * - stop after 10 minutes
                 * - dashboardService.polls can be reset on user navigation
                 *
                 * TODO: should really be a server push w/ EventSource
                 * polyfill lib -> https://github.com/Yaffle/EventSource
                 */
                if (dashboardService.polls < 300) {
                    $timeout(dashboardService.getWorkstreams, 3000);
                    dashboardService.polls++;
                    console.log('dashboardService.polls', dashboardService.polls);
                }
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
                console.log('DashboardService getContactsByDayReport: ', data);
            }

            function error(error) {
                console.error('DashboardService getContactsByDayReport error: ' + error);
            }

            return dashRequest($http.get(baseReportsAPIUrl + '/contactsByDay').success(success).error(error));
        }

        function getPageViewsByDayReport() {
            function success(data) {
                console.log('DashboardService getPageViewsByDayReport: ', data);
            }

            function error(error) {
                console.error('DashboardService getPageViewsByDayReport error: ' + error);
            }

            return dashRequest($http.get(baseReportsAPIUrl + '/pageViewsByDay').success(success).error(error));
        }

        function getNewVisitorsByDayReport() {
            function success(data) {
                console.log('DashboardService getNewVisitorsByDayReport: ', data);
            }

            function error(error) {
                console.error('DashboardService getNewVisitorsByDayReport error: ' + error);
            }

            return dashRequest($http.get(baseReportsAPIUrl + '/newVisitorsByDay').success(success).error(error));
        }

        function getRevenueByMonthReport() {
            function success(data) {
                console.log('DashboardService getRevenueByMonthReport: ', data);
            }

            function error(error) {
                console.error('DashboardService getRevenueByMonthReport error: ' + error);
            }

            return dashRequest($http.get(baseReportsAPIUrl + '/revenueByMonth').success(success).error(error));
        }

        function updateAccount(account) {

            function success(data) {
                console.info('DashboardService updateAccount:', data);
            }

            function error(error) {
                console.error('DashboardService updateAccount:', error);
            }
            return (
                dashRequest($http.put(baseAccountAPIUrl + [account._id].join('/'), account)).success(success).error(error));
        }

        function setAwayFromDashboard(away) {
            dashboardService.awayFromDashboard = away;
            dashboardService.polls = 0;
            dashboardService.getWorkstreams();

            if (away) {
                console.log(away);
            }

        }

		(function init() {

            dashboardService.getWorkstreams();

		})();


		return dashboardService;
	}

})();
