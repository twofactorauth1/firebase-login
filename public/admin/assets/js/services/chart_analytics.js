'use strict';
/*global app, moment, angular, window, Highcharts, $$*/
/*jslint unparam: true*/
(function (angular) {
    app.service('ChartAnalyticsService', ['SiteAnalyticsService', function (SiteAnalyticsService) {

        //common functions

        this.secToTime = function (duration) {
            var minutes = parseInt(Math.floor(duration / 60), 10);
            var seconds = parseInt(duration - minutes * 60, 10);

            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return minutes + ":" + seconds;
        };

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

        /*
         * I assume these timeframes are the past 30days and the past 60 days.
         * .utc().format("YYYY-MM-DDTHH:mm:ss") + "Z"
         * moment().subtract(29, 'days'), moment()
         */
        var timeframePreviousStart = moment().subtract(60, 'days').format(); //TODO: 60d ago
        var timeframePreviousEnd = moment().subtract(30, 'days').format(); //TODO: 30d ago
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

        this.runAdminMongoReports = function(date, account, fn) {
            SiteAnalyticsService.runAdminReports(date.startDate, date.endDate, function(data){
                fn(data);
            });
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

        this.analyticsOverview = function (readyPageviewsData, sessionsData, readyVisitorsData, dailyActiveUsersData, fn) {
            var analyticsOverviewConfig = {
                options: {
                    chart: {
                        spacing: [25, 25, 25, 25],
                        zoomType: 'x'
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
                    min: 0,
                    // max: Math.max.apply(Math, lineData) + 100,
                    title: {
                        text: ''
                    }
                },
                series: [
                    {
                        name: 'Visitors',
                        data: readyVisitorsData
                    },
                    {
                        name: 'Visits',
                        data: sessionsData
                    },
                    {
                        name: 'Pageviews',
                        data: readyPageviewsData
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
                analyticsOverviewConfig.series.push({name: 'Daily Active Users', data:dailyActiveUsersData});
            }
            if(this.granularity === 'hours') {
                analyticsOverviewConfig.xAxis.labels.format = '{value:%b %d %H:%M}';
                analyticsOverviewConfig.options.tooltip.headerFormat = '<b>{point.x:%b %d %H:%M}</b><br>';
            }
            fn(analyticsOverviewConfig);
        };

        this.emailsOverview = function (emailsData, campaignsData, opensData, clicksData, fn) {
            var emailsOverviewConfig = {
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

        this.timeOnSite = function (timeOnSiteData, bouncesData, fn) {
            var timeonSiteConfig = {
                options: {
                    chart: {
                        spacing: [25, 25, 25, 25],
                        height: 360
                    },
                    colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
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

        this.visitorLocations = function (locationData, highchartsData, countryData, countryMap, labelSwitchFN) {
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
                        height: 360
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
                        enableButtons: true,
                        //enableDoubleClickZoomTo: true,
                        enableDoubleClickZoom: true,
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
                        events:{
                            setExtremes:function(event) {
                                //console.log('setExtremes:', event);
                                //console.log('this:', this);
                                if(this.chart.series[0].mapTitle === 'United States of America') {
                                    if(event.min === event.dataMin && event.max === event.dataMax && event.trigger !== 'zoom') {
                                        this.chart.series[0].update(worldSeries);
                                        labelSwitchFN('world');
                                        this.switchedSeries = true;
                                    }
                                } else {
                                    if(event.min) {
                                        //console.log('Switching to US');
                                        this.chart.series[0].update(usSeries);
                                        labelSwitchFN('US');
                                        this.switchedSeries = true;
                                        //var chart = $('#visitor_locations').highcharts();
                                        //chart.zoom();
                                    }
                                }
                            },
                            afterSetExtremes: function(event) {
                                if(this.switchedSeries === true) {
                                    this.switchedSeries = false;
                                    var chart = $('#visitor_locations').highcharts();
                                    chart.zoom();
                                }
                            }
                        }
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
                            valueSuffix: ' USD',
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
            if(this.granularity === 'hours') {
                revenueConfig.xAxis.labels.format = '{value:%b %d %H:%M}';
                revenueConfig.options.tooltip.headerFormat = '<b>{point.x:%b %d %H:%M}</b><br>';
            }
            fn(revenueConfig);
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
