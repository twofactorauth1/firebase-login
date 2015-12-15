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
        var baseAnalyticsAPIUrl = '/api/2.0/dashboard/analytics';
        var baseAccountAPIUrl = '/api/1.0/account/';

        dashboardService.loading = { value:0 };
        dashboardService.updatedWorkstreams = false;
        dashboardService.lastWorkstreamSet = [];
        dashboardService.awayFromDashboard = false;
        dashboardService.polls = 0;
        dashboardService.numberPolling = 0;

        dashboardService.workstreamDisplayOrder = [
            'Build an Online Presence',
            'Manage Contacts',
            'Engage Customers',
            'Make Sales'
        ];

        dashboardService.analyticDisplayOrder = [
            'visitors',
            'contacts',
            'CampaignMetrics',
            'Revenue',
            'SocialMedia'
        ];


        dashboardService.getWorkstreams = getWorkstreams;
        dashboardService.getWorkstream = getWorkstream;
        dashboardService.unlockWorkstream = unlockWorkstream;
        dashboardService.updateAccount = updateAccount;
        dashboardService.setAwayFromDashboard = setAwayFromDashboard;
        dashboardService.getAnalytics = getAnalytics;
        dashboardService.getAccount = getAccount;


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
                 * - stop after ~10 minutes
                 * - dashboardService.polls can be reset on user navigation
                 * - only request when no other dashboard requests in flight
                 *
                 * TODO: should really be a server push w/ EventSource
                 * polyfill lib -> https://github.com/Yaffle/EventSource
                 */
                if(dashboardService.numberPolling <=1) {
                    dashboardService.numberPolling--;
                    (function poll() {

                        if (dashboardService.polls < 300 && dashboardService.loading.value === 0) {
                            $timeout(dashboardService.getWorkstreams, 3000);
                            dashboardService.numberPolling++;
                            dashboardService.polls++;
                            console.log('dashboardService.polls', dashboardService.polls);
                        } else {
                            $timeout(poll, 1000);
                        }

                    })();
                } else {
                    dashboardService.numberPolling--;
                    console.info('dashboardService skipping poll');
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
                console.debug('data.unlocked', data.unlocked);

            }

            function error(error) {
                console.error('DashboardService unlockWorkstream:', error);
            }

            return dashRequest($http.post(baseWorkstreamsAPIUrl + '/' + id + '/unlock').success(success).error(error));

        }

        function getAnalytics() {

            function success(data) {
                console.log('DashboardService getAnalytics: ', data);
                dashboardService.state.analytics = data;
            }

            function error(error) {
                console.error('DashboardService getAnalytics error: ' + error);
            }

            return dashRequest($http.get(baseAnalyticsAPIUrl).success(success).error(error));

        }

        function getAccount(account) {

            function success(data) {
                console.info('DashboardService getAccount:', data);
                dashboardService.state.account = data;
            }

            function error(error) {
                console.error('DashboardService getAccount:', error);
            }
            return (
                dashRequest($http.get(baseAccountAPIUrl).success(success).error(error))
            );
        }

        function updateAccount(account) {

            function success(data) {
                console.info('DashboardService updateAccount:', data);
            }

            function error(error) {
                console.error('DashboardService updateAccount:', error);
            }
            return (
                dashRequest($http.put(baseAccountAPIUrl + [account._id].join('/'), account).success(success).error(error))
            );
        }

        function setAwayFromDashboard(away) {
            dashboardService.awayFromDashboard = away;

            dashboardService.polls = 0;
            dashboardService.numberPolling++;

            dashboardService.getWorkstreams();
            dashboardService.getAccount();

            if (away) {
                console.log(away);
            }

        }

		(function init() {

            dashboardService.getAccount();
            dashboardService.getAnalytics();
            dashboardService.getWorkstreams();
            dashboardService.numberPolling++;

		})();


		return dashboardService;
	}

})();
