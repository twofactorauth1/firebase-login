'use strict';
/*global app, moment, angular, window, Highcharts, $$*/
/*jslint unparam: true*/
(function (angular) {
    app.service('ChartAnalyticsService', ['SiteAnalyticsService', '$q', function (SiteAnalyticsService, $q) {

        //common functions

        this.secToTime = function (duration) {
            var minutes = parseInt(Math.floor(duration / 60), 10);
            var seconds = parseInt(duration - minutes * 60, 10);

            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return minutes + ":" + seconds;
        };
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
        this.getHostName = function (account) {
            var hostname = '';
            var windowHostname = window.location.hostname;
            if (windowHostname.indexOf(".local") > -1) {
                hostname = account.subdomain + '.indigenous.local';
            } else if (windowHostname.indexOf(".test.") > -1) {
                hostname = windowHostname;
            } else {
                hostname = account.subdomain + '.indigenous.io';
            }
            if (account.domain) {
                hostname = account.domain;
            }
            if (account._id === 6 && windowHostname.indexOf(".local") <= 0 && windowHostname.indexOf(".test") <= 0) {
                hostname = 'indigenous.io';
            }
            return hostname;
        };

        this.getCommaSeparatedHostNames = function(account) {
            var hostname = '';
            var windowHostname = window.location.hostname;
            if (windowHostname.indexOf(".local") > -1) {
                hostname = account.subdomain + '.indigenous.local';
            } else if (windowHostname.indexOf(".test.") > -1) {
                hostname = windowHostname;
            } else {
                hostname = account.subdomain + '.indigenous.io';
            }
            if (account._id === 6 && windowHostname.indexOf(".local") <= 0 && windowHostname.indexOf(".test") <= 0) {
                hostname = 'indigenous.io,www.indigneous.io';
            }
            if(account.customDomain) {
                hostname += ',' + account.customDomain + ',www.' + account.customDomain;
            }
            if(account.alternateDomains) {
                _.each(account.alternateDomains, function(domain){
                    hostname += ',' + domain + ',www.' + domain;
                });
            }
            return hostname;
        };

        this.calculatePercentChange = function(oldval, newval) {
            //console.log('>> calculatePercentChange(' + oldval + ',' + newval + ')');
            oldval = parseInt(oldval, 10);
            newval = parseInt(newval, 10);
            if (oldval === 0 && newval === 0) {
                return 0;
            }
            if (oldval === 0) {
                return "(n/a)";
            }
            //percent change is new-old/old
            var result = ((newval - oldval) / oldval) * 100;
            return Math.round(result * 100) / 100;
        };

        this.calculatePercentage = function (oldval, newval) {
            console.log('>> calculatePercentage(' + oldval +',' + newval +')');
            var result;
            oldval = parseInt(oldval, 10);
            newval = parseInt(newval, 10);
            if (oldval === 0 && newval === 0) {
                return 0;
            }
            if (newval < oldval) {
                result = ((oldval - newval) / oldval) * 100;
            } else {
                result = ((newval - oldval) / newval) * 100;
            }

            if (newval === oldval) {
                result = 100;
            }
            return Math.round(result * 100) / 100;
        };

        this.countryToAbbr = function(strInput) {
            var arrCountries = [
                {
                    "name":"United States",
                    "abbreviation": "United States of America"
                }
            ];
            _.each(arrCountries, function(translatable){
                if(translatable.name.toLowerCase() === strInput.toLowerCase()) {
                    strInput = translatable.abbreviation;
                }
            });
            return strInput;

        };

        this.stateToAbbr = function (strInput) {
            var strOutput;
            if (strInput) {
                var arrStates = [
                    {
                        "name": "Alabama",
                        "abbreviation": "AL"
                    },
                    {
                        "name": "Alaska",
                        "abbreviation": "AK"
                    },
                    {
                        "name": "American Samoa",
                        "abbreviation": "AS"
                    },
                    {
                        "name": "Arizona",
                        "abbreviation": "AZ"
                    },
                    {
                        "name": "Arkansas",
                        "abbreviation": "AR"
                    },
                    {
                        "name": "California",
                        "abbreviation": "CA"
                    },
                    {
                        "name": "Colorado",
                        "abbreviation": "CO"
                    },
                    {
                        "name": "Connecticut",
                        "abbreviation": "CT"
                    },
                    {
                        "name": "Delaware",
                        "abbreviation": "DE"
                    },
                    {
                        "name": "District Of Columbia",
                        "abbreviation": "DC"
                    },
                    {
                        "name": "Federated States Of Micronesia",
                        "abbreviation": "FM"
                    },
                    {
                        "name": "Florida",
                        "abbreviation": "FL"
                    },
                    {
                        "name": "Georgia",
                        "abbreviation": "GA"
                    },
                    {
                        "name": "Guam",
                        "abbreviation": "GU"
                    },
                    {
                        "name": "Hawaii",
                        "abbreviation": "HI"
                    },
                    {
                        "name": "Idaho",
                        "abbreviation": "ID"
                    },
                    {
                        "name": "Illinois",
                        "abbreviation": "IL"
                    },
                    {
                        "name": "Indiana",
                        "abbreviation": "IN"
                    },
                    {
                        "name": "Iowa",
                        "abbreviation": "IA"
                    },
                    {
                        "name": "Kansas",
                        "abbreviation": "KS"
                    },
                    {
                        "name": "Kentucky",
                        "abbreviation": "KY"
                    },
                    {
                        "name": "Louisiana",
                        "abbreviation": "LA"
                    },
                    {
                        "name": "Maine",
                        "abbreviation": "ME"
                    },
                    {
                        "name": "Marshall Islands",
                        "abbreviation": "MH"
                    },
                    {
                        "name": "Maryland",
                        "abbreviation": "MD"
                    },
                    {
                        "name": "Massachusetts",
                        "abbreviation": "MA"
                    },
                    {
                        "name": "Michigan",
                        "abbreviation": "MI"
                    },
                    {
                        "name": "Minnesota",
                        "abbreviation": "MN"
                    },
                    {
                        "name": "Mississippi",
                        "abbreviation": "MS"
                    },
                    {
                        "name": "Missouri",
                        "abbreviation": "MO"
                    },
                    {
                        "name": "Montana",
                        "abbreviation": "MT"
                    },
                    {
                        "name": "Nebraska",
                        "abbreviation": "NE"
                    },
                    {
                        "name": "Nevada",
                        "abbreviation": "NV"
                    },
                    {
                        "name": "New Hampshire",
                        "abbreviation": "NH"
                    },
                    {
                        "name": "New Jersey",
                        "abbreviation": "NJ"
                    },
                    {
                        "name": "New Mexico",
                        "abbreviation": "NM"
                    },
                    {
                        "name": "New York",
                        "abbreviation": "NY"
                    },
                    {
                        "name": "North Carolina",
                        "abbreviation": "NC"
                    },
                    {
                        "name": "North Dakota",
                        "abbreviation": "ND"
                    },
                    {
                        "name": "Northern Mariana Islands",
                        "abbreviation": "MP"
                    },
                    {
                        "name": "Ohio",
                        "abbreviation": "OH"
                    },
                    {
                        "name": "Oklahoma",
                        "abbreviation": "OK"
                    },
                    {
                        "name": "Oregon",
                        "abbreviation": "OR"
                    },
                    {
                        "name": "Palau",
                        "abbreviation": "PW"
                    },
                    {
                        "name": "Pennsylvania",
                        "abbreviation": "PA"
                    },
                    {
                        "name": "Puerto Rico",
                        "abbreviation": "PR"
                    },
                    {
                        "name": "Rhode Island",
                        "abbreviation": "RI"
                    },
                    {
                        "name": "South Carolina",
                        "abbreviation": "SC"
                    },
                    {
                        "name": "South Dakota",
                        "abbreviation": "SD"
                    },
                    {
                        "name": "Tennessee",
                        "abbreviation": "TN"
                    },
                    {
                        "name": "Texas",
                        "abbreviation": "TX"
                    },
                    {
                        "name": "Utah",
                        "abbreviation": "UT"
                    },
                    {
                        "name": "Vermont",
                        "abbreviation": "VT"
                    },
                    {
                        "name": "Virgin Islands",
                        "abbreviation": "VI"
                    },
                    {
                        "name": "Virginia",
                        "abbreviation": "VA"
                    },
                    {
                        "name": "Washington",
                        "abbreviation": "WA"
                    },
                    {
                        "name": "West Virginia",
                        "abbreviation": "WV"
                    },
                    {
                        "name": "Wisconsin",
                        "abbreviation": "WI"
                    },
                    {
                        "name": "Wyoming",
                        "abbreviation": "WY"
                    }
                ];
                _.each(arrStates, function (state) {
                    if (state.name.toLowerCase() === strInput.toLowerCase()) {
                        strOutput = state.abbreviation;
                    }
                });
            }

            return strOutput || false;
        };

        this.mergeLiveTrafficData = function(trafficSourceData){
            var unfilterData = _.filter(trafficSourceData, function(data){ return (data["referrer.domain"] && data["referrer.domain"].indexOf("www.") === 0) });
            var filteredData = _.filter(trafficSourceData, function(data){ return (!data["referrer.domain"] || data["referrer.domain"].indexOf("www.") !== 0)});

            var trafficSourcesReportData = filteredData;
            _.each(unfilterData, function(result){
                var matchData = _.find(trafficSourcesReportData, function(data){ return data["referrer.domain"] == result["referrer.domain"].replace("www.", "") })
                if(matchData){
                    matchData.result += result.result;
                }
                else{
                    trafficSourcesReportData.push({
                        "referrer.domain": result["referrer.domain"],
                        "result": result.result
                    })
                }
            });
            return trafficSourcesReportData;
        };


        var timeframePreviousStart = moment().subtract(60, 'days').format();
        var timeframePreviousEnd = moment().subtract(30, 'days').format();
        var interval = "daily";

        this.setGraunularity = function(granularity) {
            this.granularity = 'days';
            if(granularity==='hours') {
                this.granularity = 'hours';
            }
        };

        //reports

        this.queryReports = function (date, _hostname, _hostnameAry) {
            var queryData = {};

            return queryData;
        };

        this.runIndividualMongoReports = function(date, account, fn) {
            SiteAnalyticsService.runIndividualReports(date.startDate, date.endDate, null, false, false, function(data){
                //console.log('data:', data);
                fn(data);
            });
        };

        this.runMongoReports = function(date, account, fn) {
            SiteAnalyticsService.runReports(date.startDate, date.endDate, function(data){
                //console.log('I got this:', data);
                fn(data);
            });
        };


        this.runCustomerReports = function(date, accountId, fn) {
            SiteAnalyticsService.runCustomerReports(date.startDate, date.endDate, accountId, function(data){
                //console.log('I got this:', data);
                fn(data);
            });
        };

        this.runIndividualAdminMongoReports = function(date, account, fn) {
            SiteAnalyticsService.runIndividualReports(date.startDate, date.endDate, null, true, false, function(data){
                console.log('data:', data);
                fn(data);
            });
        };

        this.runAdminMongoReports = function(date, account, fn) {
            SiteAnalyticsService.runAdminReports(date.startDate, date.endDate, function(data){
                fn(data);
            });
        };

        this.getFrontrunnerSitesPageviews = function(date, account, accountIdArray, fn) {
            SiteAnalyticsService.getFrontrunnerSitesPageviews(date.startDate, date.endDate, accountIdArray, function(data){
                fn(data);
            });
        };

        this.getPlatformTraffic = function(fn) {
            SiteAnalyticsService.runPlatformTraffic(fn);
        };

        this.getPlatformTrafficDetails = function(fn) {
            SiteAnalyticsService.runPlatformTrafficDetails(fn);
        };

        this.getSiteAnalyticsTraffic = function(fn) {
            SiteAnalyticsService.runSiteAnlyticsTraffic(fn);
        };

        this.runReports = function (date, account, fn) {
            var self = this;
            var hostname = this.getHostName(account);
            var hostnameAry = this.getCommaSeparatedHostNames(account);
            console.log('hostname ', hostname);
            console.log('date range ', date);
            console.log('hostnameAry', hostnameAry);

            fn({});
        };

        this.runPagedReports = function (date, account, fn) {
            var filters = [];
            var hostname = this.getHostName(account);
            var hostnameAry = this.getCommaSeparatedHostNames(account);
            filters.push({
                "property_name": "url.domain",
                "operator": "in",
                "property_value": hostnameAry.split(',')
            });


            var reportData = {};
            var params2 = {
                event_collection: 'page_data',
                analyses: {
                    "pageviews": {
                        "analysis_type": "count"
                    },
                    "uniquePageviews": {
                        "analysis_type": "count_unique",
                        "target_property": "session_id"
                    },
                    "timeOnPage": {
                        "analysis_type": "sum",
                        "target_property": "timeOnPage"
                    },
                    "avgTimeOnPage": {
                        "analysis_type": "average",
                        "target_property": "timeOnPage"
                    },
                    "entrances": {
                        "analysis_type": "count",
                        "target_property": "entrance"
                    },
                    "exits": {
                        "analysis_type": "count",
                        "target_property": "exit"
                    }
                },
                timeframe: {
                    "start": date.startDate,
                    "end": date.endDate
                },
                group_by: 'url.path',
                filters: filters
            };

            fn(reportData);
        };

        this.visitorsReport = function (date, account, fn) {
            var self = this;
            var _hostname = this.getHostName(account);
            fn({});

        };

        this.queryVisitorReports = function (date, _hostname) {
            var queryData = {};



            return queryData;
        };

        this.getDailyActiveUsers = function(account, start, end, fn){
            SiteAnalyticsService.getDailyActiveUsers(start, end, account, true, false, function(data){
                console.log('got dau:', data);
                fn(data);
            })
        }

        this.getUserTopSearches = function(account, start, end, fn){
            SiteAnalyticsService.getUserTopSearches(start, end, account, false, false, function(data){
                console.log('got topSearches:', data);
                fn(data);
            })
        }
        
        this.getMostActiveUsers = function(account, start, end, fn){
            SiteAnalyticsService.getMostActiveUsers(start, end, account, false, false, function(data){
                console.log('got mostActiveUsers:', data);
                fn(data);
            })
        }
        
        this.getVisitorOverviewChartData = function(date, account, isAdmin, isCustomer, fn) {
            var promises = [];
            var pageviews, users, sessions, dau,fourOfour;
            promises.push(SiteAnalyticsService.getPageviews(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                console.log('got pageviews:', data);
                pageviews = data;
            }));
            promises.push(SiteAnalyticsService.getUsers(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                console.log('got users:', data);
                users = data;
            }));
            promises.push(SiteAnalyticsService.getSessions(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                console.log('got sessions:', data);
                sessions = data;
            }));
            promises.push(SiteAnalyticsService.getDailyActiveUsers(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                console.log('got dau:', data);
                dau = data;
            }));
             promises.push(SiteAnalyticsService.getFourOFours(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                console.log('got 404s:', data);
                fourOfour = data;
            }));
            $q.all(promises).then(function(results){
                fn(null, pageviews, users, sessions, dau,fourOfour);
            });
        };

        this.getPageAnalyticsChartData = function(date, account, isAdmin, isCustomer, fn) {
            SiteAnalyticsService.getPageAnalytics(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                fn(data);
            });
        };

        this.getVisitorLocationsChartData = function(date, account, isAdmin, isCustomer, fn) {
            var promises = [];
            var visitorLocations, visitorLocationsByCountry;
            promises.push(SiteAnalyticsService.getVisitorLocations(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                visitorLocations = data;
            }));
            promises.push(SiteAnalyticsService.getVisitorLocationsByCountry(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                visitorLocationsByCountry = data;
            }));
            $q.all(promises).then(function(results){
                fn(null, visitorLocations, visitorLocationsByCountry);
            });
        };

        this.getContentInteractionAndTrafficeSourcesChartData = function(date, account, isAdmin, isCustomer, fn) {
            var promises = [];
            var sessionLength, trafficSources;
            promises.push(SiteAnalyticsService.getSessionLength(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                sessionLength = data;
            }));
            promises.push(SiteAnalyticsService.getTrafficSources(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                trafficSources = data;
            }));
            $q.all(promises).then(function(results){
                fn(null, sessionLength, trafficSources);
            });
        };

        this.getDeviceNewReturningChartData = function(date, account, isAdmin, isCustomer, fn) {
            var promises = [];
            var visitorDevices, newVsReturning;
            promises.push(SiteAnalyticsService.getVisitorDevices(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                visitorDevices = data;
            }));
            promises.push(SiteAnalyticsService.getNewVsReturning(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                newVsReturning = data;
            }));
            $q.all(promises).then(function(results){
                fn(null, visitorDevices, newVsReturning);
            });
        };

        this.getUserAgentsOSRevenueEmailsChartData = function(date, account, isAdmin, isCustomer, fn) {
            var promises = [];
            var userAgents, os, revenue, emails;
            promises.push(SiteAnalyticsService.getUserAgents(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                userAgents = data;
            }));
            promises.push(SiteAnalyticsService.getOS(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                os = data;
            }));
            promises.push(SiteAnalyticsService.getRevenue(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                revenue = data;
            }));
            promises.push(SiteAnalyticsService.getEmails(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                emails = data;
            }));
            $q.all(promises).then(function(results){
                fn(null, userAgents, os, revenue, emails);
            });
        };

        this.getUserAgentsAndOSChartData = function(date, account, isAdmin, isCustomer, fn) {
            var promises = [];
            var userAgents, os;
            promises.push(SiteAnalyticsService.getUserAgents(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                userAgents = data;
            }));
            promises.push(SiteAnalyticsService.getOS(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                os = data;
            }));
            $q.all(promises).then(function(results){
                fn(null, userAgents, os);
            });
        };

        this.getRevenueChartData = function(date, account, isAdmin, isCustomer, fn) {
            var promises = [];
            var revenue;

            promises.push(SiteAnalyticsService.getRevenue(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                revenue = data;
            }));

            $q.all(promises).then(function(results){
                fn(null, revenue);
            });
        };

        this.getEmailChartData = function(date, account, isAdmin, isCustomer, fn) {
            var promises = [];
            var emails;

            promises.push(SiteAnalyticsService.getEmails(date.startDate, date.endDate, account, isAdmin, isCustomer, function(data){
                emails = data;
            }));
            $q.all(promises).then(function(results){
                fn(null, emails);
            });
        };

        //charts

        this.pageDepth = function () {
            var pageDepthConfig = {
                options: {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: 0,
                        plotShadow: false,
                        spacing: [25, 25, 25, 25]
                    },
                    title: {
                        text: ''
                    },
                    tooltip: {
                        pointFormat: '{point.x}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                enabled: true,
                                distance: -50,
                                style: {
                                    fontWeight: 'bold',
                                    color: 'white',
                                    textShadow: '0px 1px 2px black'
                                }
                            },
                            colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                        }
                    },
                    exporting: {
                        enabled: false
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: 'Gender',
                        innerSize: '40%',
                        data: [
                            ['Male', 44.3],
                            ['Female', 55.7]
                        ]
                    }
                ],
                credits: {
                    enabled: false
                }
            };

            return pageDepthConfig;
        };

        this.analyticsOverview = function (readyPageviewsData, sessionsData, readyVisitorsData, dailyActiveUsersData,ready404Data, isVisibleLegend, setLegendVisibility, fn) {
            var _widgetName = "analytics";
            var analyticsOverviewConfig = {
                options: {
                    chart: {
                        spacing: [25, 25, 25, 25],
                        zoomType: 'x',
                        pinchType: 'x'
                    },
                    colors: ['#41b0c7', '#fcb252', '#993300'],
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
                            },
                            events: {
                                legendItemClick: function(event) {
                                    setLegendVisibility(_widgetName, this.name, !this.visible)
                                }
                            }
                        }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: "{value:%b %d}"
                    }
                },
                yAxis: {
                    min: 0,
                    // max: Math.max.apply(Math, lineData) + 100,
                    title: {
                        text: ''
                    }
                },
                series: [
                    {
                        name: 'Visitors',
                        data: readyVisitorsData,
                        visible: isVisibleLegend("Visitors", _widgetName)
                    },
                    {
                        name: 'Visits',
                        data: sessionsData,
                        visible: isVisibleLegend("Visits", _widgetName)
                    },
                    {
                        name: 'Pageviews',
                        data: readyPageviewsData,
                        visible: isVisibleLegend("Pageviews", _widgetName)
                    },
                    {
                        name: '404views',
                        data: ready404Data,
                        visible: isVisibleLegend("404views", _widgetName)
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
            if(dailyActiveUsersData) {
                analyticsOverviewConfig.series.push({name: 'Daily Active Users', data:dailyActiveUsersData, visible: isVisibleLegend("Daily Active Users", _widgetName)});
                analyticsOverviewConfig.options.colors.push('#f8cc49');
            }
            if(this.granularity === 'hours') {
                analyticsOverviewConfig.xAxis.labels.format = '{value:%b %d %H:%M}';
                analyticsOverviewConfig.options.tooltip.headerFormat = '<b>{point.x:%b %d %H:%M}</b><br>';
            }
            fn(analyticsOverviewConfig);
        };

        this.getActiveUserConfig = function (dailyActiveUsersData, fn) {
            
            var activeUserConfig = {
                options: {
                    chart: {
                        spacing: [25, 25, 25, 25],
                        zoomType: 'x',
                        pinchType: 'x'
                    },
                    colors: ['#41b0c7'],
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
                            },
                            events: {
                                legendItemClick: function(event) {
                                    //setLegendVisibility(_widgetName, this.name, !this.visible)
                                }
                            }
                        }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: "{value:%b %d}"
                    }
                },
                yAxis: {
                    min: 0,
                    // max: Math.max.apply(Math, lineData) + 100,
                    title: {
                        text: ''
                    }
                },
                series: [
                    {
                        name: 'Daily Active Users',
                        data: dailyActiveUsersData
                    }
                ],
                credits: {
                    enabled: false
                }
            };
            if(this.granularity === 'hours') {
                activeUserConfig.xAxis.labels.format = '{value:%b %d %H:%M}';
                activeUserConfig.options.tooltip.headerFormat = '<b>{point.x:%b %d %H:%M}</b><br>';
            }
            fn(activeUserConfig);
        };

        this.emailsOverview = function (emailsData, campaignsData, opensData, clicksData, fn) {
            var emailsOverviewConfig = {
                options: {
                    chart: {
                        spacing: [25, 25, 25, 25],
                        zoomType: 'x',
                        pinchType: 'x'
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
                    }
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    // max: Math.max.apply(Math, lineData) + 100,
                    title: {
                        text: ''
                    }
                },
                series: [
                    {
                        name: 'Emails',
                        data: emailsData
                    },
                    {
                        name: 'Opens',
                        data: opensData
                    },
                    {
                        name: 'Clicks',
                        data: clicksData
                    },
                    {
                        name: 'Campaigns',
                        data: campaignsData
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
            if(this.granularity === 'hours') {
                emailsOverviewConfig.xAxis.labels.format = '{value:%b %d %H:%M}';
                emailsOverviewConfig.options.tooltip.headerFormat = '<b>{point.x:%b %d %H:%M}</b><br>';
            }
            fn(emailsOverviewConfig);
        };

        this.frontrunnerSitesPageviews = function (pageViewData, seriesData, fn) {
            var frontrunnerSitesPageviewsConfig = {
                options: {
                    chart: {
                        spacing: [25, 25, 25, 25, 25],
                        zoomType: 'x',
                        pinchType: 'x'
                    },
                    colors: ['#41b0c7', '#fcb252', '#993300', '#f8cc49', '#008000'],
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
                    }
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    title: {
                        text: ''
                    }
                },
                series: seriesData,
                credits: {
                    enabled: false
                }
                /*
                 func: function (chart) {

                 }
                 */
            };
            if(this.granularity === 'hours') {
                frontrunnerSitesPageviewsConfig.xAxis.labels.format = '{value:%b %d %H:%M}';
                frontrunnerSitesPageviewsConfig.options.tooltip.headerFormat = '<b>{point.x:%b %d %H:%M}</b><br>';
            }
            fn(frontrunnerSitesPageviewsConfig);
        };

        this.timeOnSite = function (timeOnSiteData, bouncesData, fn) {
            var timeonSiteConfig = {
                options: {
                    chart: {
                        spacing: [25, 25, 25, 25],
                        height: 360,
                        zoomType: 'x',
                        pinchType: 'x'
                    },
                    colors: ['#41b0c7', '#fcb252'],
                    title: {
                        text: ''
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
                    }
                },
                yAxis: {
                    // min: 0,
                    // max: Math.max.apply(Math, lineData) + 100,
                    title: {
                        text: ''
                    }
                },
                series: [
                    {
                        name: 'Visitors',
                        data: timeOnSiteData
                    },
                    {
                        name: 'Bounces',
                        data: bouncesData
                    }
                ],
                credits: {
                    enabled: false
                }
            };
            if(this.granularity === 'hours') {
                timeonSiteConfig.xAxis.labels.format = '{value:%b %d %H:%M}';
                timeonSiteConfig.options.tooltip.headerFormat = '<b>{point.x:%b %d %H:%M}</b><br>';
            }
            fn(timeonSiteConfig);
        };

        this.trafficSources = function (trafficSourceData, fn) {
            var trafficSourcesConfig = {
                options: {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: 0,
                        plotShadow: false,
                        spacing: [25, 25, 25, 25],
                        height: 300
                    },
                    title: {
                        text: ''
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                enabled: true,
                                distance: -50,
                                style: {
                                    fontWeight: 'bold',
                                    color: 'white',
                                    textShadow: '0px 1px 2px black'
                                }
                            },
                            colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                        }
                    },
                    exporting: {
                        enabled: false
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: 'Traffic Source',
                        innerSize: '40%',
                        data: trafficSourceData
                    }
                ],
                credits: {
                    enabled: false
                }
            };
            fn(trafficSourcesConfig);
        };

        this.newVsReturning = function (newVsReturning, fn) {
            var newVsReturningConfig = {
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
                        name: 'Browser share',
                        data: newVsReturning
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

            fn(newVsReturningConfig);
        };

        this.visitorLocationsGlobal = function (locationData, highchartsData, countryData, countryMap) {
            console.log('>> visitorLocations', highchartsData);
            console.log('countryData:', countryData);
            console.log('countryMap:', countryMap);

            var worldSeries = {
                data: countryData,
                mapData: Highcharts.maps['custom/world'],
                joinBy: ['name', 'code'],
                animation: true,
                name: '# of Visitors',
                states: {
                    hover: {
                        color: '#BADA55'
                    }
                },
                tooltip: {
                    pointFormat: '{point.code}: {point.value}'
                }
            };

            if ($("#visitor_locations_global").length) {
                console.log('"#visitor_locations_global');
                var chart1 = new Highcharts.Map({
                    chart: {
                        renderTo: 'visitor_locations_global',
                        height: 360,
                        zoomType : false
                    },

                    title: {
                        text: ''
                    },

                    exporting: {
                        enabled: false
                    },

                    legend: {
                        enabled: false
                    },

                    mapNavigation: {
                        buttonOptions: {
                            align: 'right',
                            verticalAlign: 'bottom'
                        },
                        enableButtons: false,
                        //enableDoubleClickZoomTo: true,
                        enableDoubleClickZoom: false,
                        enableTouchZoom: false
                    },

                    colorAxis: {
                        min: 1,
                        type: 'logarithmic',
                        minColor: '#4cb0ca',
                        maxColor: '#224f5b'
                    },

                    series: [
                        worldSeries
                    ],
                    xAxis:{

                    },
                    credits: {
                        enabled: false
                    }
                });
            }
        };

        this.visitorLocations = function (locationData, highchartsData, countryData, countryMap) {
            console.log('>> visitorLocations', highchartsData);
            console.log('countryData:', countryData);
            console.log('countryMap:', countryMap);


            var usSeries = {
                animation: {
                    duration: 1000
                },
                data: locationData,
                mapData: highchartsData,
                joinBy: ['postal-code', 'code'],
                dataLabels: {
                    enabled: false
                },
                name: '# of Visitors',
                tooltip: {
                    pointFormat: '{point.code}: {point.value}'
                }
            };
            if ($("#visitor_locations").length) {
                console.log('"#visitor_locations');
                var chart1 = new Highcharts.Map({
                    chart: {
                        renderTo: 'visitor_locations',
                        height: 360,
                        zoomType : false
                    },

                    title: {
                        text: ''
                    },

                    exporting: {
                        enabled: false
                    },

                    legend: {
                        enabled: false
                    },

                    mapNavigation: {
                        buttonOptions: {
                            align: 'right',
                            verticalAlign: 'bottom'
                        },
                        enableButtons: false,
                        //enableDoubleClickZoomTo: true,
                        enableDoubleClickZoom: false,
                        enableTouchZoom: false
                    },

                    colorAxis: {
                        min: 1,
                        type: 'logarithmic',
                        minColor: '#4cb0ca',
                        maxColor: '#224f5b'
                    },

                    series: [
                        usSeries
                    ],
                    xAxis:{

                    },
                    credits: {
                        enabled: false
                    }
                });
            }
        };

        this.visitorLocationsPlatform = function (locationData) {
            var usSeries = {
                animation: {
                    duration: 0
                },
                data: locationData,
                mapData:  Highcharts.maps['countries/us/us-all'],
                joinBy: ['postal-code', 'code'],
                dataLabels: {
                    enabled: false
                },
                name: '# of Visitors',
                tooltip: {
                    pointFormat: '{point.code}: {point.value}'
                }
            };
            console.log('"BEFORE #live-platform-visitor-locations-us');

            if ($("#live-platform-visitor-locations-us").length) {
                console.log('"AFTER #live-platform-visitor-locations-us');
                var chart1 = new Highcharts.Map({
                    chart: {
                        renderTo: 'live-platform-visitor-locations-us',
                        height: 240,
                        zoomType : false,
                        backgroundColor:'rgba(255, 255, 255, 0.1)'
                    },

                    title: {
                        text: ''
                    },

                    exporting: {
                        enabled: false
                    },

                    legend: {
                        enabled: false
                    },

                    mapNavigation: {
                        enableButtons: false,
                        enableDoubleClickZoom: false,
                        enableTouchZoom: false
                    },

                    colorAxis: {
                        min: 1,
                        type: 'logarithmic',
                        minColor: '#7cb5ec',
                        maxColor: '#224f5b'
                    },

                    series: [
                        usSeries
                    ],
                    xAxis:{

                    },
                    credits: {
                        enabled: false
                    }
                });
            }
        };



        this.visitorLocationsWorldPlatform = function (countryData) {  
            var worldSeries = {
                data: countryData,
                mapData: Highcharts.maps['custom/world'],
                joinBy: ['name', 'code'],
                animation: true,
                name: '# of Visitors',
                states: {
                    hover: {
                        color: '#BADA55'
                    }
                },
                tooltip: {
                    pointFormat: '{point.code}: {point.value}'
                }
            };

            if ($("#live-platform-visitor-locations-world").length) {
                console.log('"#live-platform-visitor-locations-world');
                var chart1 = new Highcharts.Map({
                    chart: {
                        renderTo: 'live-platform-visitor-locations-world',
                        height: 240,
                        zoomType : false,
                        backgroundColor:'rgba(255, 255, 255, 0.1)'
                    },

                    title: {
                        text: ''
                    },

                    exporting: {
                        enabled: false
                    },

                    legend: {
                        enabled: false
                    },

                    mapNavigation: {
                        enableButtons: false,
                        enableDoubleClickZoom: false,
                        enableTouchZoom: false
                    },

                    colorAxis: {
                        min: 1,
                        type: 'logarithmic',
                        minColor: '#7cb5ec',
                        maxColor: '#224f5b'
                    },

                    series: [
                        worldSeries
                    ],
                    xAxis:{

                    },
                    credits: {
                        enabled: false
                    }
                });
            }
        };

        this.visitorLocationsDOHY = function (locationData, highchartsData, countryData, countryMap) {
            var usSeries = {
                animation: {
                    duration: 0
                },
                data: locationData,
                mapData: highchartsData,
                joinBy: ['postal-code', 'code'],
                dataLabels: {
                    enabled: false
                },
                name: '# of Visitors',
                tooltip: {
                    pointFormat: '{point.code}: {point.value}'
                }
            };
            if ($("#visitor_locations").length) {
                console.log('"#visitor_locations');
                var chart1 = new Highcharts.Map({
                    chart: {
                        renderTo: 'visitor_locations',
                        height: 240,
                        zoomType : false,
                        backgroundColor:'rgba(255, 255, 255, 0.1)'
                    },

                    title: {
                        text: ''
                    },

                    exporting: {
                        enabled: false
                    },

                    legend: {
                        enabled: false
                    },

                    mapNavigation: {
                        enableButtons: false,
                        enableDoubleClickZoom: false,
                        enableTouchZoom: false
                    },

                    colorAxis: {
                        min: 1,
                        type: 'logarithmic',
                        minColor: '#7cb5ec',
                        maxColor: '#224f5b'
                    },

                    series: [
                        usSeries
                    ],
                    xAxis:{

                    },
                    credits: {
                        enabled: false
                    }
                });
            }
        };

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
                        spacing: [25, 25, 25, 25],
                        zoomType: 'x',
                        pinchType: 'x'
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
                    minTickInterval: 4,
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
                            format: '${value:.2f} USD'
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
                            valueSuffix: ' USD',
                            valuePrefix: '$',
                            pointFormat: "${point.y:.2f} USD"
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
            if(this.granularity === 'hours') {
                revenueConfig.xAxis.labels.format = '{value:%b %d %H:%M}';
                revenueConfig.options.tooltip.headerFormat = '<b>{point.x:%b %d %H:%M}</b><br>';
            }
            fn(revenueConfig);
        };

        this.liveTraffic = function(data, categories) {
            var config = {
                options: {
                    chart: {
                        type: 'column',
                        backgroundColor:'rgba(255, 255, 255, 0.1)'
                    },
                    colors: ['#7cb5ec'],
                    title: {
                        text: ''
                    },
                    legend: {
                        enabled: false
                    },
                    exporting: {
                        enabled: false
                    },
                    tooltip: {
                        formatter: function() {
                            return '' +
                                moment(new Date()).subtract('minutes', (60-this.x)).format('hh:mma') +': ' +
                                '<b>' + this.y + '</b>'
                        }
                    }
                },
                xAxis:{
                    labels: {
                        enabled:false,
                        step:5,
                        //format:'{value:%H:%M}'
                    },
                    //type: 'dateTime'
                    //categories:categories
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    minTickInterval: 1,
                    title: {
                        text: 'Visitors'
                    }
                },
                size:{
                    height:240
                },
                plotOptions: {

                },
                credits: {
                    enabled: false
                },
                series: [
                    {
                        name:'Visitors',
                        data:data
                    }
                ]
            };
            return config;
        };


        this.salesDemoChart = function(fn) {
            var config = {
                options: {
                    chart: {
                        type: 'column',
                        backgroundColor:'rgba(255, 255, 255, 0.1)'
                    },
                    colors: ['#32CD32', '#30D1E1'],
                    title: {
                        text: ''
                    },
                    legend: {
                        enabled: false
                    },
                    exporting: {
                        enabled: false
                    },
                    tooltip: {

                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: false,
                                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                            }
                        }
                    }
                },
                xAxis:{
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', "Aug", 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    minTickInterval: 1,
                    title: {
                        text: ''
                    }
                },
                series: [{
                    name: 'Views',
                    data: [5, 3, 4, 7, 2, 8, 10, 6, 8, 9, 2, 1]
                }, {
                    name: 'Sales',
                    data: [3, 4, 4, 2, 5, 6, 4, 9, 2, 8, 3, 6]
                }]
            };
            fn(config);
        };


        (function init() {

            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                }
            });

        })();

    }]);
}(angular));
