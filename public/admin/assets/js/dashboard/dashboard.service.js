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
        dashboardService.doPolling = true;

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

        dashboardService.imageGallery = [
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_1.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_2.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_3.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_4.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_5.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_6.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_7.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_8.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_9.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_10.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_11.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_12.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_13.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_14.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_15.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_16.jpg",
            "//s3-us-west-2.amazonaws.com/indigenous-admin/dohy_background_17.jpg"
        ],

        dashboardService.getWorkstreams = getWorkstreams;
        dashboardService.getWorkstream = getWorkstream;
        dashboardService.unlockWorkstream = unlockWorkstream;
        dashboardService.updateAccount = updateAccount;
        dashboardService.setAwayFromDashboard = setAwayFromDashboard;
        dashboardService.getAnalytics = getAnalytics;
        dashboardService.getAccount = getAccount;


		function dashRequest(fn) {
            dashboardService.loading.value = dashboardService.loading.value + 1;
            // console.info('dashService | loading +1 : ' + dashboardService.loading.value);
            fn.finally(function() {
                dashboardService.loading.value = dashboardService.loading.value - 1;
                // console.info('dashService | loading -1 : ' + dashboardService.loading.value);
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

            }

            function error(error) {
                console.error('DashboardService getWorkstreams error: ', JSON.stringify(error));
            }

            return dashRequest($http.get(baseWorkstreamsAPIUrl).success(success).error(error));
        }

        function getWorkstream(id) {

            function success(data) {
                console.info('DashboardService getWorkstream:', data);
            }

            function error(error) {
                console.error('DashboardService getWorkstream:', JSON.stringify(error));
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
                console.error('DashboardService unlockWorkstream:', JSON.stringify(error));
            }

            return dashRequest($http.post(baseWorkstreamsAPIUrl + '/' + id + '/unlock').success(success).error(error));

        }

        function getAnalytics() {

            function success(data) {
                console.log('DashboardService getAnalytics: ', JSON.stringify(data));
                dashboardService.state.analytics = data;
            }

            function error(error) {
                console.error('DashboardService getAnalytics error: ', JSON.stringify(error));
            }

            return dashRequest($http.get(baseAnalyticsAPIUrl).success(success).error(error));

        }

        function getAccount(account) {

            function success(data) {
                console.info('DashboardService getAccount:', JSON.stringify(data));
                dashboardService.state.account = data;
                if(data.ui_preferences && data.ui_preferences.polling === false) {
                    dashboardService.doPolling = false;
                }
            }

            function error(error) {
                console.error('DashboardService getAccount:', JSON.stringify(error));
            }
            return (
                dashRequest($http.get(baseAccountAPIUrl + '?hash_id=' + Math.random()).success(success).error(error))
            );
        }

        function updateAccount(account) {

            function success(data) {
                console.info('DashboardService updateAccount:', data);
            }

            function error(error) {
                console.error('DashboardService updateAccount:', JSON.stringify(error));
            }
            return (
                dashRequest($http.put(baseAccountAPIUrl + [account._id].join('/'), account).success(success).error(error))
            );
        }

        function setAwayFromDashboard(away) {
            dashboardService.awayFromDashboard = away;

            dashboardService.polls = 0;
            dashboardService.numberPolling++;

            dashboardService.getAnalytics();
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
