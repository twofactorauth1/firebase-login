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
        var customerAnalyticsAPIUrl = '/api/1.0/analytics/customer/reports';
        var platformTrafficAPIUrl = '/api/1.0/analytics/admin/live';
        var baseLiveTrafficAPIUrl = '/api/1.0/analytics/live';

        var frontrunnerSitesPageviewsAPIUrl = '/api/1.0/analytics/admin/pageViewPerformance';
        saService.runReports = runReports;
        saService.runAdminReports = runAdminReports;
        saService.runCustomerReports = runCustomerReports;
        saService.runPlatformTraffic = runPlatformTraffic;
        saService.runSiteAnlyticsTraffic = runSiteAnlyticsTraffic;
        saService.getFrontrunnerSitesPageviews = getFrontrunnerSitesPageviews;
        saService.runIndividualReports = runIndividualReports;
        saService.getPageviews = getPageviews;
        saService.getUsers = getUsers;
        saService.getSessions = getSessions;
        saService.getDailyActiveUsers = getDailyActiveUsers;
        saService.getFourOFours= getFourOFours;
        saService.getPageAnalytics = getPageAnalytics;
        saService.getVisitorLocations = getVisitorLocations;
        saService.getVisitorLocationsByCountry = getVisitorLocationsByCountry;
        saService.getVisitorDevices = getVisitorDevices;
        saService.getSessionLength = getSessionLength;
        saService.getTrafficSources = getTrafficSources;
        saService.getNewVsReturning = getNewVsReturning;
        saService.getUserAgents = getUserAgents;
        saService.getRevenue = getRevenue;
        saService.getOS = getOS;
        saService.getEmails = getEmails;
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

        function getPageviews(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'pageviews', fn);
        }

        function getUsers(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'users', fn);
        }

        function getSessions(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'sessions', fn);
        }

        function getDailyActiveUsers(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'dau', fn);
        }
        function getFourOFours(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'daily404s', fn);
        }
        function getPageAnalytics(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'pageAnalytics', fn);
        }

        function getVisitorLocations(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'visitorLocations', fn);
        }

        function getVisitorLocationsByCountry(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'visitorLocationsByCountry', fn);
        }

        function getVisitorDevices(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'visitorDevices', fn);
        }

        function getSessionLength(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'sessionLength', fn);
        }

        function getTrafficSources(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'trafficSources', fn);
        }

        function getNewVsReturning(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'newVsReturning', fn);
        }
        function getUserAgents(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'userAgents', fn);
        }
        function getRevenue(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'revenue', fn);
        }
        function getOS(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'os', fn);
        }
        function getEmails(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            return runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, 'emails', fn);
        }

        function runSingleReport(startDate, endDate, accountId, isAdmin, isCustomer, reportName, fn) {
            function error(error) {
                console.error('SiteAnalyticsService ' + reportName + ' error:', JSON.stringify(error));
            }
            function success(data) {
                saService.reports = saService.reports || {};
                saService.reports[reportName] = data;
                fn(data);
            }
            var startDateString = moment.utc(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment.utc(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var path = '/' + reportName + '?start=' + startDateString + '&end=' + endDateString;
            if(isAdmin) {
                path = adminAnalyticsAPIUrl + path;
            } else if(isCustomer){
                path = customerAnalyticsAPIUrl + path + '&accountId=' + accountId;
            } else {
                path = baseAnalyticsAPIUrl + path;
            }
            return saRequest($http.get(path).success(success).error(error));
        }

        function runIndividualReports(startDate, endDate, accountId, isAdmin, isCustomer, fn) {
            var endpointAry = ['users', 'pageviews', 'sessions', 'visitors', 'visitorLocations', 'visitorLocationsByCountry',
                'visitorDevices', 'sessionLength', 'trafficSources', 'newVsReturning', 'pageAnalytics', 'userAgents', 'revenue','daily404s','404s'];

            //users, pageviews, dau, sessions
            var adminEndpointAry = ['pageviews', 'users','sessions', 'dau'];

            var delayedAdminEndpointAry = ['pageAnalytics', 'visitorLocations',
                'visitorLocationsByCountry', 'visitorDevices', 'sessionLength', 'trafficSources', 'newVsReturning',
                 'userAgents', 'revenue', 'os', 'emails'];

            function error(error) {
                console.error('SiteAnalyticsService runReports error:', JSON.stringify(error));
            }

            var startDateString = moment.utc(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment.utc(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
            saService.reports = {};

            if(isAdmin === true) {
                _.each(adminEndpointAry, function(endpoint){
                    var path = adminAnalyticsAPIUrl + '/' + endpoint + '?start=' + startDateString + '&end=' + endDateString;
                    saRequest($http.get(path).success(function(data){saService.reports[endpoint] = data;fn(saService.reports);}).error(error));
                });
                _.delay(function(){
                    _.each(delayedAdminEndpointAry, function(endpoint){
                        var path = adminAnalyticsAPIUrl + '/' + endpoint + '?start=' + startDateString + '&end=' + endDateString;
                        saRequest($http.get(path).success(function(data){saService.reports[endpoint] = data;fn(saService.reports);}).error(error));
                    });
                }, 6000);
            } else if(isCustomer === true) {
                runCustomerReports(startDate, endDate, accountId, fn);
            } else {
                _.each(endpointAry, function(endpoint){
                    var path = baseAnalyticsAPIUrl + '/' + endpoint + '?start=' + startDateString + '&end=' + endDateString;
                    saRequest($http.get(path).success(function(data){saService.reports[endpoint] = data;fn(saService.reports);}).error(error));
                });
            }
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
            var startDateString = moment.utc(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment.utc(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
            return saRequest($http.get(baseAnalyticsAPIUrl + '/all?start=' + startDateString + '&end=' + endDateString).success(success).error(error));
        }

        function runCustomerReports(startDate, endDate, accountId, fn) {
            function success(data) {
                saService.reports = data;
                fn(data);
            }

            function error(error) {
                console.error('SiteAnalyticsService runReports error:', JSON.stringify(error));
            }
            var startDateString = moment.utc(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment.utc(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
            return saRequest($http.get(customerAnalyticsAPIUrl + '/all?accountId='+ accountId +'&start=' + startDateString + '&end=' + endDateString).success(success).error(error));
        }


        function runAdminReports(startDate, endDate, fn) {
            function success(data) {
                saService.reports = data;
                fn(data);
            }

            function error(error) {
                console.error('SiteAnalyticsService runReports error:', JSON.stringify(error));
            }
            var startDateString = moment.utc(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment.utc(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
            return saRequest($http.get(adminAnalyticsAPIUrl + '/all?start=' + startDateString + '&end=' + endDateString).success(success).error(error));
        }

        function getFrontrunnerSitesPageviews(startDate, endDate, accountIdArray, fn) {
            function success(data) {
                //saService.reports = data;
                fn(data);
            }

            function error(error) {
                console.error('SiteAnalyticsService getFrontrunnerSitesPageviews error:', JSON.stringify(error));
            }
            var startDateString = moment.utc(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment.utc(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var accountIdsString = accountIdArray.join(",");
            return saRequest($http.get(frontrunnerSitesPageviewsAPIUrl + '?accountIds='+ accountIdsString +'&start=' + startDateString + '&end=' + endDateString).success(success).error(error));
            
        }

        function runPlatformTraffic(fn) {
            function success(data) {
                fn(data);
            }

            function error(err) {
                console.error('SiteAnalyticsService runPlatformTraffic error:', JSON.stringify(err));
            }
            return saRequest($http.get(platformTrafficAPIUrl).success(success).error(error));
        }


        function runSiteAnlyticsTraffic(fn) {
            function success(data) {
                fn(data);
            }

            function error(err) {
                console.error('SiteAnalyticsService runSiteAnlyticsTraffic error:', JSON.stringify(err));
            }
            return saRequest($http.get(baseLiveTrafficAPIUrl).success(success).error(error));
        }

        this.userAgentChart = function (userAgents, fn) {
            var userAgentChartConfig = {
                options: {
                    chart: {
                        height: 300
                    },
                    colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                    title: {
                        text: ''
                    },
                    legend: {
                        enabled: true
                    },
                    exporting: {
                        enabled: false
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: 'User Agents',
                        data: userAgents
                    }
                ],
                yAxis: {
                    title: {
                        text: 'Visitors'
                    }
                },
                credits: {
                    enabled: false
                }
            };

            fn(userAgentChartConfig);
        };

        this.osChart = function (osData, fn) {
            var osChartConfig = {
                options: {
                    chart: {
                        height: 300
                    },
                    colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                    title: {
                        text: ''
                    },
                    legend: {
                        enabled: true
                    },
                    exporting: {
                        enabled: false
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: 'OS',
                        data: osData
                    }
                ],
                yAxis: {
                    title: {
                        text: 'Visitors'
                    }
                },
                credits: {
                    enabled: false
                }
            };

            fn(osChartConfig);
        };

        this.revenueOverview = function (ordersData, fn) {
            var revenueConfig = {
                options: {
                    chart: {
                        spacing: [25, 25, 25, 25]
                    },
                    colors: ['#41b0c7', '#fcb252', '#993300', '#f8cc49', '#f8d949'],
                    title: {
                        text: null
                    },
                    subtitle: {
                        text: ''
                    },
                    tooltip: {
                        headerFormat: '<b>{point.x:%b %d}</b><br>',
                        pointFormat: '<b class="text-center">{point.y}</b>'
                    },
                    legend: {
                        enabled: true
                    },
                    exporting: {
                        enabled: false
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: true,
                                radius: 3
                            }
                        }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: "{value:%b %d}"
                    },
                    categories: ordersData.xData
                },
                yAxis: [{
                    labels: {
                        format: '{value}'

                    },
                    title: {
                        text: 'Number Orders'
                    },
                    opposite: true
                },
                    {
                        title: {
                            text: 'Revenue'
                        },
                        labels: {
                            format: '${value} USD'
                        }
                    }],
                series: [
                    {
                        name: 'Orders',
                        type: 'bar',
                        yAxis: 0,
                        data: ordersData.orderData,
                        tooltip: {
                            valueSuffix: ' orders'
                        }

                    },
                    {
                        name: 'Revenue',
                        type: 'spline',
                        yAxis: 1,
                        data: ordersData.amountData,
                        tooltip: {
                            valueSuffix: ' usd',
                            valuePrefix: '$'
                        }
                    }
                ],
                credits: {
                    enabled: false
                }
                /*
                 func: function (chart) {

                 }
                 */
            };

            fn(revenueConfig);
        };

        (function init() {

            AccountService.getAccount(function(data) {
                saService.account = data;
                //saService.runReports();
            });

        })();


        return saService;
    }

})();
