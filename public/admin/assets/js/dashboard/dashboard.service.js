'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('DashboardService', DashboardService);

	DashboardService.$inject = ['$http', '$q', '$rootScope', '$timeout', 'dashboardBackgrounds'];
	/* @ngInject */
	function DashboardService($http, $q, $rootScope, $timeout, dashboardBackgrounds) {

        var dashboardService = {
            state: {
                workstreams:[],
                reports:{}
            }
        };
        var baseWorkstreamsAPIUrl = '/api/2.0/dashboard/workstreams';
        var baseAnalyticsAPIUrl = '/api/2.0/dashboard/analytics';
        var baseAccountAPIUrl = '/api/1.0/account/';
        var baseLiveTrafficAPIUrl = '/api/1.0/analytics/live';
        var basePlatformLiveTrafficAPIUrl = '/api/1.0/analytics/admin/live';
        var baseBroadcastMessagesAPIUrl = '/api/2.0/insights/messages/';
        var baseLiveVisitorDetailsAPIUrl = '/api/1.0/analytics/liveDetails';

        var defaultLookBackInMinutesInterval = 60;

        dashboardService.getActiveMessages = getActiveMessages;
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

        dashboardService.imageGallery = dashboardBackgrounds.urls;

        dashboardService.liveTraffic = [];
        dashboardService.platformLiveTraffic = [];

        dashboardService.getWorkstreams = getWorkstreams;
        dashboardService.getWorkstream = getWorkstream;
        dashboardService.unlockWorkstream = unlockWorkstream;
        dashboardService.updateAccount = updateAccount;
        dashboardService.setAwayFromDashboard = setAwayFromDashboard;
        dashboardService.getAnalytics = getAnalytics;
        dashboardService.getAccount = getAccount;
        dashboardService.getLiveTraffic = getLiveTraffic;
        dashboardService.getLiveVisitorDetails = getLiveVisitorDetails;
        dashboardService.getPlatformLiveTraffic = getPlatformLiveTraffic;


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

        function getLiveTraffic() {
            function success(data) {
                dashboardService.liveTraffic = data;
            }
            function error(err) {
                console.error('Dashboard Service getLiveTraffic error: ', JSON.stringify(err));
            }
            return dashRequest($http.get(baseLiveTrafficAPIUrl).success(success).error(error));
        }

        function getPlatformLiveTraffic() {
            function success(data) {
                dashboardService.platformLiveTraffic = data;
            }
            function error(err) {
                console.error('Dashboard Service getPlatformLiveTraffic error: ', JSON.stringify(err));
            }
            return dashRequest($http.get(basePlatformLiveTrafficAPIUrl).success(success).error(error));
        }


        function getLiveVisitorDetails() {
            function success(data) {
                dashboardService.liveVisitorDetails = data;
            }
            function error(err) {
                console.error('Dashboard Service getLiveVisitorDetails error: ', JSON.stringify(err));
            }
            return dashRequest($http.get(baseLiveVisitorDetailsAPIUrl + "?lookBackInMinutes="+ defaultLookBackInMinutesInterval).success(success).error(error));
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
            //dashboardService.polls = 0;
            //dashboardService.numberPolling++;
            //dashboardService.getAnalytics();
            //dashboardService.getWorkstreams();
            //dashboardService.getAccount();
            //dashboardService.getActiveMessages();
            //if (away) {
            //    console.log(away);
            //}

        }

        function getActiveMessages() {

            function success(data) {
                console.log(data);
                dashboardService.broadcastMessages = data;
            }

            function error(error) {
                console.error('dashRequest getActiveMessages error: ', JSON.stringify(error));
            }

            return dashRequest($http.get(baseBroadcastMessagesAPIUrl + "active").success(success).error(error));

        }


        $rootScope.$on('$ssbAccountUpdated', function(event, account) {
            dashboardService.getAccount();
        });



		(function init() {

            dashboardService.getAccount();
            dashboardService.getAnalytics();
            dashboardService.getWorkstreams();
            dashboardService.getLiveTraffic();
            dashboardService.getLiveVisitorDetails();
            dashboardService.getActiveMessages();
            dashboardService.numberPolling++;
		})();


		return dashboardService;
	}

})();
