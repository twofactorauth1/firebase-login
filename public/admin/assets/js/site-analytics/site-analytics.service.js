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

        saService.runReports = runReports;
        saService.runAdminReports = runAdminReports;
        saService.runCustomerReports = runCustomerReports;
        saService.runPlatformTraffic = runPlatformTraffic;
        saService.runSiteAnlyticsTraffic = runSiteAnlyticsTraffic;
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

        function runCustomerReports(startDate, endDate, accountId, fn) {
            function success(data) {
                saService.reports = data;
                fn(data);
            }

            function error(error) {
                console.error('SiteAnalyticsService runReports error:', JSON.stringify(error));
            }
            var startDateString = moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
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
            var startDateString = moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss');
            var endDateString = moment(endDate).format('YYYY-MM-DD[T]HH:mm:ss');
            return saRequest($http.get(adminAnalyticsAPIUrl + '/all?start=' + startDateString + '&end=' + endDateString).success(success).error(error));
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
