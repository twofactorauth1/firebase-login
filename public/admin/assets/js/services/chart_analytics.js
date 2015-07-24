'use strict';
/*global app, moment, angular, window, Keen, Highcharts*/
/*jslint unparam:true*/
(function (angular) {
  app.service('ChartAnalyticsService', ['KeenService', function (KeenService) {

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

    this.calculatePercentage = function (oldval, newval) {
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

    this.stateToAbbr = function (strInput) {
      var strOutput;
      if (strInput) {
        var arrStates = [{
          "name": "Alabama",
          "abbreviation": "AL"
        }, {
          "name": "Alaska",
          "abbreviation": "AK"
        }, {
          "name": "American Samoa",
          "abbreviation": "AS"
        }, {
          "name": "Arizona",
          "abbreviation": "AZ"
        }, {
          "name": "Arkansas",
          "abbreviation": "AR"
        }, {
          "name": "California",
          "abbreviation": "CA"
        }, {
          "name": "Colorado",
          "abbreviation": "CO"
        }, {
          "name": "Connecticut",
          "abbreviation": "CT"
        }, {
          "name": "Delaware",
          "abbreviation": "DE"
        }, {
          "name": "District Of Columbia",
          "abbreviation": "DC"
        }, {
          "name": "Federated States Of Micronesia",
          "abbreviation": "FM"
        }, {
          "name": "Florida",
          "abbreviation": "FL"
        }, {
          "name": "Georgia",
          "abbreviation": "GA"
        }, {
          "name": "Guam",
          "abbreviation": "GU"
        }, {
          "name": "Hawaii",
          "abbreviation": "HI"
        }, {
          "name": "Idaho",
          "abbreviation": "ID"
        }, {
          "name": "Illinois",
          "abbreviation": "IL"
        }, {
          "name": "Indiana",
          "abbreviation": "IN"
        }, {
          "name": "Iowa",
          "abbreviation": "IA"
        }, {
          "name": "Kansas",
          "abbreviation": "KS"
        }, {
          "name": "Kentucky",
          "abbreviation": "KY"
        }, {
          "name": "Louisiana",
          "abbreviation": "LA"
        }, {
          "name": "Maine",
          "abbreviation": "ME"
        }, {
          "name": "Marshall Islands",
          "abbreviation": "MH"
        }, {
          "name": "Maryland",
          "abbreviation": "MD"
        }, {
          "name": "Massachusetts",
          "abbreviation": "MA"
        }, {
          "name": "Michigan",
          "abbreviation": "MI"
        }, {
          "name": "Minnesota",
          "abbreviation": "MN"
        }, {
          "name": "Mississippi",
          "abbreviation": "MS"
        }, {
          "name": "Missouri",
          "abbreviation": "MO"
        }, {
          "name": "Montana",
          "abbreviation": "MT"
        }, {
          "name": "Nebraska",
          "abbreviation": "NE"
        }, {
          "name": "Nevada",
          "abbreviation": "NV"
        }, {
          "name": "New Hampshire",
          "abbreviation": "NH"
        }, {
          "name": "New Jersey",
          "abbreviation": "NJ"
        }, {
          "name": "New Mexico",
          "abbreviation": "NM"
        }, {
          "name": "New York",
          "abbreviation": "NY"
        }, {
          "name": "North Carolina",
          "abbreviation": "NC"
        }, {
          "name": "North Dakota",
          "abbreviation": "ND"
        }, {
          "name": "Northern Mariana Islands",
          "abbreviation": "MP"
        }, {
          "name": "Ohio",
          "abbreviation": "OH"
        }, {
          "name": "Oklahoma",
          "abbreviation": "OK"
        }, {
          "name": "Oregon",
          "abbreviation": "OR"
        }, {
          "name": "Palau",
          "abbreviation": "PW"
        }, {
          "name": "Pennsylvania",
          "abbreviation": "PA"
        }, {
          "name": "Puerto Rico",
          "abbreviation": "PR"
        }, {
          "name": "Rhode Island",
          "abbreviation": "RI"
        }, {
          "name": "South Carolina",
          "abbreviation": "SC"
        }, {
          "name": "South Dakota",
          "abbreviation": "SD"
        }, {
          "name": "Tennessee",
          "abbreviation": "TN"
        }, {
          "name": "Texas",
          "abbreviation": "TX"
        }, {
          "name": "Utah",
          "abbreviation": "UT"
        }, {
          "name": "Vermont",
          "abbreviation": "VT"
        }, {
          "name": "Virgin Islands",
          "abbreviation": "VI"
        }, {
          "name": "Virginia",
          "abbreviation": "VA"
        }, {
          "name": "Washington",
          "abbreviation": "WA"
        }, {
          "name": "West Virginia",
          "abbreviation": "WV"
        }, {
          "name": "Wisconsin",
          "abbreviation": "WI"
        }, {
          "name": "Wyoming",
          "abbreviation": "WY"
        }];
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
    var timeframePreviousStart = moment().subtract(60, 'days').utc().format("YYYY-MM-DDTHH:mm:ss") + "Z"; //TODO: 60d ago
    var timeframePreviousEnd = moment().subtract(30, 'days').utc().format("YYYY-MM-DDTHH:mm:ss") + "Z"; //TODO: 30d ago
    var interval = "daily";

    //reports

    this.queryReports = function (date, _hostname) {
      var queryData = {};

      queryData.visitorLocations = new Keen.Query("count", {
        eventCollection: "session_data",
        groupBy: "ip_geo_info.province",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }, {
          "property_name": "ip_geo_info",
          "operator": "ne",
          "property_value": "null"
        }]
      });

      queryData.deviceReportByCategory = new Keen.Query("count", {
        eventCollection: "session_data",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        groupBy: "user_agent.device",
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.userReport = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "fingerprint",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        interval: interval,
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.userReportPreviousMonth = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "fingerprint",
        timeframe: {
          "start": timeframePreviousStart,
          "end": timeframePreviousEnd
        },
        interval: interval,
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.pageviewsReport = new Keen.Query("count", {
        eventCollection: "page_data",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        interval: interval,
        filters: [{
          "property_name": "url.domain",
          "operator": "in",
          "property_value": ["www." + _hostname, _hostname]
        }]
      });

      queryData.pageviewsPreviousReport = new Keen.Query("count", {
        eventCollection: "page_data",
        timeframe: {
          "start": timeframePreviousStart,
          "end": timeframePreviousEnd
        },
        interval: interval,
        filters: [{
          "property_name": "url.domain",
          "operator": "in",
          "property_value": ["www." + _hostname, _hostname]
        }]
      });

      queryData.sessionsReport = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "session_id",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        interval: interval,
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.sessionsPreviousReport = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "session_id",
        timeframe: {
          "start": timeframePreviousStart,
          "end": timeframePreviousEnd
        },
        interval: interval,
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.sessionLengthReport = new Keen.Query("count", {
        eventCollection: "session_data",
        targetProperty: "session_length",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        interval: interval,
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.sessionAvgLengthReport = new Keen.Query("average", {
        eventCollection: "session_data",
        targetProperty: "session_length",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.bouncesReport = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "session_id",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        interval: interval,
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }, {
          "property_name": "session_length",
          "operator": "lte",
          "property_value": 5000
        }, {
          "property_name": "page_depth",
          "operator": "eq",
          "property_value": 1
        }]
      });

      queryData.bouncesPreviousReport = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "session_id",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }, {
          "property_name": "session_length",
          "operator": "lte",
          "property_value": 5000
        }, {
          "property_name": "page_depth",
          "operator": "eq",
          "property_value": 1
        }]
      });

      queryData.trafficSources = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "referrer.domain",
        groupBy: "referrer.domain",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.returningVisitors = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "permanent_tracker",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }, {
          "property_name": "new_visitor",
          "operator": "eq",
          "property_value": false
        }]
      });

      queryData.newVisitors = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "permanent_tracker",
        timeframe: {
          "start": date.startDate,
          "end": date.endDate
        },
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }, {
          "property_name": "new_visitor",
          "operator": "eq",
          "property_value": true
        }]
      });


      queryData.sessionPreviousAvgLengthReport = new Keen.Query("average", {
        eventCollection: "session_data",
        targetProperty: "session_length",
        timeframe: {
          "start": timeframePreviousStart,
          "end": timeframePreviousEnd
        },
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      return queryData;
    };

    this.runReports = function (date, account, fn) {

      var self = this;
      var hostname = this.getHostName(account);
      console.log('hostname ', hostname);

      KeenService.keenClient(function (client) {
        var queryData = self.queryReports(date, hostname);
        client.run([
          queryData.visitorLocations,
          queryData.deviceReportByCategory,
          queryData.userReport,
          queryData.userReportPreviousMonth,
          queryData.pageviewsReport,
          queryData.pageviewsPreviousReport,
          queryData.sessionsReport,
          queryData.sessionsPreviousReport,
          queryData.sessionLengthReport,
          queryData.sessionAvgLengthReport,
          queryData.bouncesReport,
          queryData.bouncesPreviousReport,
          queryData.trafficSources,
          queryData.returningVisitors,
          queryData.newVisitors,
          // queryData.pageDepth,
          queryData.sessionPreviousAvgLengthReport
        ], function (results) {
          fn(results);
        });
      });
    };

    this.runPagedReports = function (date, account, fn) {
      var filters = [];
      var hostname = this.getHostName(account);
      filters.push({
        "property_name": "url.domain",
        "operator": "in",
        "property_value": ["www." + hostname, hostname]
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

      KeenService.multiAnalysis(params2, function (multidata) {
        var formattedTopPages = [];
        var pagedformattedTopPages;

        // ----------------------------------------
        // Top Pageviews
        // ----------------------------------------
        _.each(multidata.result, function (singleRow) {
          var subObj = {};

          if (singleRow['url.path']) {
            subObj.page = singleRow['url.path'];
            subObj.pageviews = singleRow.pageviews;
            subObj.avgTime = Math.abs(singleRow.avgTimeOnPage) / 1000;
            subObj.uniquePageviews = singleRow.uniquePageviews;
            //TODO
            //subObj.entrances = singleRow['entrances'];
            //subObj.bounceRate = singleRow['bounces']/singleRow['pageviews'];
            //subObj.exitRate = self.calculatePercentage(singleRow['exits'], currentTotalPageviews);
          }
          if (subObj) {
            formattedTopPages.push(subObj);
          }
        });

        pagedformattedTopPages = formattedTopPages.slice(0, 15);
        reportData.formattedTopPages = formattedTopPages;
        reportData.pagedformattedTopPages = pagedformattedTopPages;
        fn(reportData);
      });
    };

    this.visitorsReport = function (date, account, fn) {
      var self = this;
      var _hostname = this.getHostName(account);

      KeenService.keenClient(function (client) {
        var queryData = self.queryVisitorReports(date, _hostname);
        client.run([
          queryData.returningVisitors,
          queryData.newVisitors,
          queryData.lastVisitor
        ], function (results) {
          fn(results);
        });
      });
    };

    this.queryVisitorReports = function (date, _hostname) {
      var queryData = {};

      queryData.returningVisitors = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "permanent_tracker",
        timeframe: "this_month",
        interval: "daily",
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }, {
          "property_name": "new_visitor",
          "operator": "eq",
          "property_value": false
        }]
      });

      queryData.newVisitors = new Keen.Query("count_unique", {
        eventCollection: "session_data",
        targetProperty: "permanent_tracker",
        timeframe: "this_month",
        interval: "daily",
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }, {
          "property_name": "new_visitor",
          "operator": "eq",
          "property_value": true
        }]
      });

      queryData.lastVisitor = new Keen.Query("extraction", {
        eventCollection: "session_data",
        targetProperty: "permanent_tracker",
        latest: 1,
        filters: [{
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

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
        series: [{
          type: 'pie',
          name: 'Gender',
          innerSize: '40%',
          data: [
            ['Male', 44.3],
            ['Female', 55.7]
          ]
        }],
        credits: {
          enabled: false
        }
      };

      return pageDepthConfig;
    };

    this.analyticsOverview = function (readyPageviewsData, sessionsData, readyVisitorsData, fn) {
      var analyticsOverviewConfig = {
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
            pointFormat: '<b class="text-center">{point.y}</b>',
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
                enabled: false
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
        series: [{
          name: 'Visitors',
          data: readyVisitorsData
        }, {
          name: 'Visits',
          data: sessionsData
        }, {
          name: 'Pageviews',
          data: readyPageviewsData
        }],
        credits: {
          enabled: false
        }
        /*
        func: function (chart) {

        }
        */
      };
      fn(analyticsOverviewConfig);
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
            pointFormat: '<b class="text-center">{point.y}</b>',
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
                enabled: false
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
        series: [{
          name: 'Time on Site',
          data: timeOnSiteData
        }, {
          name: 'Bounces',
          data: bouncesData
        }],
        credits: {
          enabled: false
        }
      };
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
        series: [{
          type: 'pie',
          name: 'Traffic Source',
          innerSize: '40%',
          data: trafficSourceData
        }],
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
        series: [{
          type: 'pie',
          name: 'Browser share',
          data: newVsReturning
        }],
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

    this.visitorLocations = function (locationData, highchartsData) {

      if ($("#visitor_locations").length) {
        var chart1 = new Highcharts.Map({
          chart: {
            renderTo: 'visitor_locations',
            height: 360,
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

          series: [{
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
          }],
          credits: {
            enabled: false
          }
        });
      }
    };

  }]);
}(angular));
