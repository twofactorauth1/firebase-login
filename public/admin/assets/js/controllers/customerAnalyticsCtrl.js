/*global app, moment, angular,window, console ,Highcharts, $, safari ,_*/
/*jslint unparam:true*/
/* eslint-disable no-console */
(function (angular) {
	'use strict';
	app.controller('customerAnalyticsCtrl', ["$scope", "$modal", "UserService", "ChartAnalyticsService", "$timeout", "AnalyticsWidgetStateService", "$interval", "analyticsConstant", "$rootScope", "$q", function ($scope, $modal, UserService, ChartAnalyticsService, $timeout, AnalyticsWidgetStateService, $interval, analyticsConstant, $rootScope, $q) {

		$scope.analyticsRefreshAfterTime = analyticsConstant.refreshAfterTime;
		$scope.analyticsOverviewConfig = {};
		$scope.timeonSiteConfig = {};
		$scope.trafficSourcesConfig = {};
		$scope.newVsReturningConfig = {};
		$scope.customerOverviewConfig = {};
		$scope.analyticsOverviewConfig.title = {
			text: ''
		};
		$scope.timeonSiteConfig.title = {
			text: ''
		};
		$scope.trafficSourcesConfig.loading = true;
		$scope.newVsReturningConfig.loading = true;
		$scope.customerOverviewConfig.loading = true;
		$scope.livedataLoading = true;
		$scope.displayVisitors = true;
		$scope.visitors = null;

		$scope.date = {
			startDate: moment().subtract(29, 'days').format(),
			endDate: moment().format()
		};
		$scope.Math = Math;
		function updateLiveDetailObject(liveVisitorDetails){
			$scope.liveVisitorDetails=[];
			_.each(liveVisitorDetails, function(detail){
				var server_time =new Date();
				if( detail.pageEvents.length>0){
					server_time =moment(detail.pageEvents[0].pageTime)._d;
				}
				if(detail.pageEvents.length){
					var copyPageEvets=angular.copy(detail.pageEvents);
                    var evn = _.find(copyPageEvets.reverse(), function(activity){
                        return activity.activityType== 'CONTACT_FORM'
                    });
                    if(evn){
                        _.map(evn.extraFields, function (value, key) {
                            if(key.toLowerCase()=='name'){
                                detail.name=value +" "+(evn.extraFields.last?evn.extraFields.last:"");
                            }else if(key.toLowerCase()=='email'){
                                detail.email=value
                            }
                            else if(key.toLowerCase()=='first'){
                                detail.fullname = value +" "+(evn.extraFields.last?evn.extraFields.last:"");
                            }
                        });
                        detail.contactId = evn.contactId;
                    }
                }
				var difference = new Date().getTime()-server_time.getTime() ;
				var sec=Math.round((difference / 1000) % 60)
				detail.resultInMinutes = Math.round(difference / 60000)+(sec<10?":0"+sec:":"+sec);

				$scope.liveVisitorDetails.push(detail);
			});
		}
		var dateSwitch = false,
			localTimezoneOffset = 0;
		//highchar datetime behaving diffent on differnetbrowser so nee to set this check, may be a bugb in highcart
		if ((!!window.chrome && !!window.chrome.webstore) ||
			(/constructor/i.test(window.HTMLElement) || (function (p) {
				return p.toString() === "[object SafariRemoteNotification]";
			})(!window['safari'] || safari.pushNotification))) {
			localTimezoneOffset = 0;
		} else {
			localTimezoneOffset = new Date().getTimezoneOffset() * -60000;
		}
		$scope.$watch('selectedDate', function () {
			$scope.date.startDate = moment($scope.selectedDate.startDate).format();
			$scope.date.endDate = moment($scope.selectedDate.endDate).format();
			//update user preferences
			if (dateSwitch) {
				$scope.analyticsOverviewConfig = {};
				$scope.frontrunnerSitesPageviewsConfig = {};
				$scope.timeonSiteConfig = {};
				$scope.trafficSourcesConfig = {};
				$scope.newVsReturningConfig = {};
				$scope.customerOverviewConfig = {};
				$scope.analyticsOverviewConfig.title = {
					text: ''
				};
				$scope.timeonSiteConfig.title = {
					text: ''
				};

				$scope.locationData = null;
				$scope.countryLocationData = null;
				$scope.pagedformattedTopPages = null;
				/*
				 * Reset charts
				 */
				$scope.trafficSourceData = null;
				$scope.userAgentData = null;
				$scope.userAgentTableData = null;
				$scope.osData = null;
				$scope.revenueConfig = {};
				$scope.emailsOverviewConfig = {};
				$scope.newVsReturning = null;
				$scope.device_data_loaded = false;

				$scope.runAnalyticsReports($scope.analyticsAccount);
			}
			dateSwitch = true;
		});

		$scope.selectedDate = {
			startDate: moment().subtract(6, 'days').startOf('day'),
			endDate: moment()
		};

		$scope.pickerOptions = {
			startDate: moment().subtract(6, 'days').toDate(),
			endDate: moment().toDate(),
			format: 'YYYY-MM-DD',
			opens: 'left',
			ranges: {
				'Today': [moment().startOf('day'), moment()],
				'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
				'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
				'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
			}
		};


		UserService.getAccount(function (account) {
			$scope.analyticsAccount = account;
			$scope.runAnalyticsReports();
			$scope.platformTraffic();
            $scope.platformTrafficDetails();
		});

		function loadLivePlatformLocationChart(data) {
			var livePlatformLocationsData = [];
			var livePlatformUSData = [];
			if (data) {
					_.each(data, function (location) {
						if(location._id=="United States"){
							_.each(location.provinces, function (_location) {
								var _geo_info = ChartAnalyticsService.stateToAbbr(_location['name']);
								if (_geo_info) {
									var subObj = {},
										locationExists;
									subObj.code = _geo_info;
									subObj.value = _location.count;
									locationExists = _.find(livePlatformUSData, function (loc) {
										return loc.code === _location.code;
									});
									if (!locationExists && subObj.value) {
										livePlatformUSData.push(subObj);
									}
								}
							});
						}
						var _geo_info = ChartAnalyticsService.countryToAbbr(location._id);
						if (_geo_info && _geo_info != 'Unknown') {
							var subObj = {},
								locationExists;
							subObj.code = _geo_info;
							subObj.value = location.count;
							locationExists = _.find(livePlatformLocationsData, function (loc) {
								return loc.code === location.code;
							});
							if (!locationExists && subObj.value) {
								livePlatformLocationsData.push(subObj);
							}
						}
					});
			}
			//$scope.livePlatformLocationsData = livePlatformLocationsData;
			$scope.livePlatformLocationsData = livePlatformLocationsData;
			$scope.livePlatformUSData = livePlatformUSData;
		}

		$scope.$watch('livePlatformLocationsData', function (livePlatformLocationData, oldData) {
			if (angular.isDefined(livePlatformLocationData) && !angular.equals(livePlatformLocationData, oldData)) {
				$timeout(function () {
					var livedata = angular.copy(livePlatformLocationData);
					ChartAnalyticsService.visitorLocationsWorldPlatform(livedata);
					ChartAnalyticsService.visitorLocationsPlatform($scope.livePlatformUSData);
				}, 200);
			}
		});

		$scope.platformTraffic = function () {
			ChartAnalyticsService.getPlatformTraffic(function (platformData) {
				var platformTrafficData = _.pluck(platformData, 'count'),
					livePlatformLocationsData = platformData[0].locations,
					livePlatformTrafficConfig = ChartAnalyticsService.liveTraffic(platformTrafficData);
				loadLivePlatformLocationChart(livePlatformLocationsData);

				$scope.livePlatformTraffic = platformData;
				//$scope.livePlatformLocationsData = livePlatformLocationsData;
				$scope.livePlatformTrafficConfig = livePlatformTrafficConfig;

				$timeout($scope.updatePlatformTraffic, 15000);
			});
		};

        $scope.platformTrafficDetails = function() {
            ChartAnalyticsService.getPlatformTrafficDetails(function (liveVisitorDetails) {
				updateLiveDetailObject(liveVisitorDetails);

                if(liveVisitorDetails && liveVisitorDetails.length){
                    $scope.setActiveVisitorIndex(0, true);
				}
				$scope.livedataLoading=false;
                $timeout($scope.updatePlatformTrafficDetails, 15000);
            });
        };
        $scope.setActiveVisitorIndex = function(index, reload){
            if(reload && $scope.activeVisitorDetail){
                var selectedVisitorDetail = _.findWhere($scope.liveVisitorDetails, {
                    _id: $scope.activeVisitorDetail._id
                });
                if(selectedVisitorDetail){
                    var selectedVisitorIndex = _.findIndex($scope.liveVisitorDetails, selectedVisitorDetail);
                    if(selectedVisitorIndex > -1){
                        $scope.selectedVisitorIndex = selectedVisitorIndex;
                        $scope.activeVisitorDetail = $scope.liveVisitorDetails[selectedVisitorIndex];
                    } else{
                        $scope.selectedVisitorIndex = index;
                        $scope.activeVisitorDetail = $scope.liveVisitorDetails[index];
                    }
                } else{
                    $scope.selectedVisitorIndex = index;
                    $scope.activeVisitorDetail = $scope.liveVisitorDetails[index];
                }
            } else{
                $scope.selectedVisitorIndex = index;
                $scope.activeVisitorDetail = $scope.liveVisitorDetails[index];
            }

        };

		$scope.updatePlatformTraffic = function () {
			ChartAnalyticsService.getPlatformTraffic(function (platformData) {
				var chart = $('#live-platform-traffic-chart').highcharts(),
					livePlatformLocationsData;
				if (chart) {
					chart.series[0].setData(_.pluck(platformData, 'count'), true);
				}
				livePlatformLocationsData = platformData[0].locations;
				loadLivePlatformLocationChart(livePlatformLocationsData);

				$scope.livePlatformTraffic = platformData;
				//$scope.livePlatformLocationsData = livePlatformLocationsData;

				$timeout($scope.updatePlatformTraffic, 15000);
			});
		};

        $scope.updatePlatformTrafficDetails = function() {
			//$scope.livedataLoading=true;
            ChartAnalyticsService.getPlatformTrafficDetails(function (liveVisitorDetails) {
				updateLiveDetailObject(liveVisitorDetails);
                $scope.liveVisitorDetails = liveVisitorDetails;
                if(liveVisitorDetails && liveVisitorDetails.length){
                    $scope.setActiveVisitorIndex(0, true);
				}
				$scope.livedataLoading=false;
                $timeout($scope.updatePlatformTrafficDetails, 15000);
            });
        };

        $scope.convertUtcToLocal = function(_date){
            if(_date){
                return moment.utc(_date).local().format('YYYY-MM-DD HH:mm:ss')
            }
        };

		$scope.runAnalyticsReports = function () {
			console.log('runAnalyticsReports');
			if (moment($scope.date.endDate).diff(moment($scope.date.startDate), 'days') <= 7) {
				ChartAnalyticsService.setGraunularity('hours');
			} else {
				ChartAnalyticsService.setGraunularity('days');
			}
			var deferred = $q.defer();
			//visitor overview
			ChartAnalyticsService.getVisitorOverviewChartData($scope.date, $scope.analyticsAccount, true, false, function (err, pageviews, users, sessions, dau, fourOfoursData) {
				var pageviewsData = [],
					currentTotalPageviews = 0,
					pageviewsPreviousData = 0;
				_.each(pageviews.currentMonth, function (pageView) {
					var subArr = [],
						value = pageView.value || 0;
					currentTotalPageviews += value;
					subArr.push(new Date(pageView.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
					subArr.push(value);
					pageviewsData.push(subArr);
				});

				$scope.pageviews = currentTotalPageviews;
				$scope.pageviewsData = pageviewsData;


				_.each(pageviews.previousMonth, function (pageView) {
					var value = pageView.value || 0;
					pageviewsPreviousData += value;
				});

				$scope.pageviewsPreviousData = pageviewsPreviousData;

				var pageviewsPercent = ChartAnalyticsService.calculatePercentChange(pageviewsPreviousData, currentTotalPageviews),
					sessionsData = [],
					totalSessions = 0,
					sessionsPreviousData = 0,
					sessionsPercent;
				$scope.pageviewsPercent = pageviewsPercent;

				//SESSIONS
				_.each(sessions.currentMonth, function (session) {
					var subArr = [],
						value = session.total || session.value || 0;
					totalSessions += value;
					subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
					subArr.push(value);
					sessionsData.push(subArr);
				});
				$scope.sessions = totalSessions;
				$scope.sessionsData = sessionsData;

				_.each(sessions.previousMonth, function (previousSession) {
					var value = previousSession.total || previousSession.value || 0;
					sessionsPreviousData += value;
				});
				//console.log('Calculate percent change sessions:');
				sessionsPercent = ChartAnalyticsService.calculatePercentChange(sessionsPreviousData, totalSessions);
				//console.log('total:' + totalSessions + ', prev:' + sessionsPreviousData + ', percent:' + sessionsPercent);
				$scope.sessionsPercent = sessionsPercent;
				//VISITORS
				$scope.visitorDataReport(users.currentMonth, users.previousMonth);


				//DAU
				var dauData = [];
				_.each(dau, function (dau) {
					var subArr = [];
					var value = dau.total || 0;
					subArr.push(new Date(dau.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
					subArr.push(value);
					dauData.push(subArr);
				});
				$scope.dauData = dauData;
				if (fourOfoursData) {
					var fourOfours = [];
					_.each(fourOfoursData, function (fourOfour) {
						var subArr = [];
						subArr.push(new Date(fourOfour.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
						subArr.push(fourOfour.total);
						fourOfours.push(subArr);
					});
					$scope.fourOfours = fourOfours;
				}
				ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, $scope.dauData, $scope.fourOfours, isVisibleLegend, setLegendVisibility, function (data) {
					//$scope.$apply(function () {
					$scope.analyticsOverviewConfig = data;
					//});
					$scope.analyticsOverviewConfig.loading = false;
					deferred.resolve();
				});
			});
			$q.all(deferred).then(function () {
				//most active sites (pageviews)
				ChartAnalyticsService.getPageAnalyticsChartData($scope.date, $scope.analyticsAccount, true, false, function (pageAnalytics) {
					var formattedTopPages = [],
						pagedformattedTopPages;
					_.each(pageAnalytics, function (singleRow) {
						var subObj = {};
						if (singleRow['url.path']) {
							subObj.page = singleRow['url.path'];
							subObj.accountId = singleRow['id'];
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

					pagedformattedTopPages = formattedTopPages;

					$scope.formattedTopPages = _.reject(formattedTopPages, function (analytics) {
						return !angular.isDefined(analytics.page);
					});
					$scope.pagedformattedTopPages = _.reject(pagedformattedTopPages, function (analytics) {
						return !angular.isDefined(analytics.page);
					});

					//Frontrunner Sites Pageviews
					var topFiveAccounts = _.first(_.sortBy($scope.pagedformattedTopPages, function (num) {
							return -num.pageviews;
						}), 5),
						accountIdArray = _.map(topFiveAccounts, function (account) {
							return account.accountId;
						});

					ChartAnalyticsService.getFrontrunnerSitesPageviews($scope.date, $scope.analyticsAccount, accountIdArray, function (data) {

						var calculatedData = _.object(_.map(data, function (value, key) {
							var item = _.find(topFiveAccounts, function (account) {
								return account.accountId == key;
							});
							if (item) {
								return [item.page, value];
							}
						})),
							series = [];
						Object.keys(calculatedData).forEach(function (key) {

							var chartData = [],
								sData;
							//_chartCount = 0;
							_.each(calculatedData[key], function (cData) {
								var subArr = [],
									value = cData.value || 0;
								//_chartCount += value;
								subArr.push(new Date(cData.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
								subArr.push(value);
								chartData.push(subArr);
							});
							//console.log(_chartCount);
							sData = {
								name: key,
								data: chartData
							};
							series.push(sData);
						});

						ChartAnalyticsService.frontrunnerSitesPageviews(calculatedData, series, function (data) {
							$scope.frontrunnerSitesPageviewsConfig = data;
						});
					});
				});
				//visitor locations US / visitor locations global
				ChartAnalyticsService.getVisitorLocationsChartData($scope.date, $scope.analyticsAccount, true, false, function (err, visitorLocations, visitorLocationsByCountry) {
					var locationData = [],
						countryLocationData = [],
						formattedLocations = [],
						formattedCountryLocations = [];
					_.each(visitorLocations, function (loc) {
					    if(loc._id === 'United States') {
					        formattedLocations = formattedLocations.concat(loc.provinces);
                        }

					});
					$scope.mostPopularState = _.max(formattedLocations, function (o) {
						return o.count;
					});
                    //console.log('Before each', formattedLocations);
					_.each(formattedLocations, function (location) {
						var _geo_info = ChartAnalyticsService.stateToAbbr(location['name']);
						if (_geo_info) {
							var subObj = {},
								locationExists;
							subObj.code = _geo_info;
							subObj.value = location.count;

							locationExists = _.find(locationData, function (loc) {
								return loc.name === location.name;
							});

							if (!locationExists && subObj.value) {
								locationData.push(subObj);
							}
						}
					});
                    //console.log('After each:', formattedLocations);

					_.each(visitorLocationsByCountry, function (loc) {
						if (loc['ip_geo_info.country'] && loc['ip_geo_info.country'] != "Unknown") {
							formattedCountryLocations.push(loc);
						}
					});
					$scope.mostPopularCountry = _.max(formattedCountryLocations, function (o) {
						return o.result;
					});
					_.each(visitorLocationsByCountry, function (location) {
						var _geo_info = ChartAnalyticsService.countryToAbbr(location['ip_geo_info.country']);
						if (_geo_info && _geo_info != 'Unknown') {
							var subObj = {},
								locationExists;
							subObj.code = _geo_info;
							subObj.value = location.result;
							locationExists = _.find(countryLocationData, function (loc) {
								return loc.code === location.code;
							});
							if (!locationExists && subObj.value) {
								countryLocationData.push(subObj);
							}
						}
					});
					$scope.locationData = locationData;

					$scope.locationLabel = 'States';
					$scope.locationsLength = locationData.length;
					$scope.mostPopularLabel = $scope.mostPopularState['name'];

					// Country based
					$scope.countryLocationData = countryLocationData;
					$scope.locationLabelCountry = 'Countries';
					$scope.locationsLengthCountry = $scope.countryLocationData.length;
					$scope.mostPopularLabelCountry = $scope.mostPopularCountry['ip_geo_info.country'];

					$scope.renderVisitorCharts();
				});
				//Content Interactions / Traffic Sources
				ChartAnalyticsService.getContentInteractionAndTrafficeSourcesChartData($scope.date, $scope.analyticsAccount, true, false, function (err, sessionLength, trafficSources) {
					var slr = sessionLength, //slr = SessionLengthReport
						secsToConv = 0,
						visitDuration;
					if (slr.currentMonthAverage) {
						secsToConv = (slr.currentMonthAverage / 1000);
					}
					visitDuration = ChartAnalyticsService.secToTime(secsToConv);

					if (slr.previousMonthAverage === null) {
						slr.previousMonthAverage = 0;
					}

					$scope.visitDuration = visitDuration;

					var previousVisitDuration = slr.previousMonthAverage;

					var visitDurationPercent = ChartAnalyticsService.calculatePercentChange(previousVisitDuration, slr.currentMonthAverage);
					$scope.visitDurationPercent = visitDurationPercent;

					//8 = sessionLengthReport, 10=bounceReport, 11=NOTbouncePreviousReport ... previousMonthBounceCount
					$scope.contentInteractionsReportData(slr.nonBounceAvg, slr.bounceAvg, slr.previousMonthBounceCount);

					// ======================================
					// Traffic Sources
					// ======================================
					if (trafficSources) {
						$scope.trafficSourceData = ChartAnalyticsService.mergeLiveTrafficData(trafficSources);
					}
				});
				//Device / New vs Returning
				ChartAnalyticsService.getDeviceNewReturningChartData($scope.date, $scope.analyticsAccount, true, false, function (err, visitorDevices, newVsReturning) {
					var desktop = 0;
					var mobile = 0;
					_.each(visitorDevices.result, function (device) {
						var category = device['user_agent.device'];
						if (category === 'desktop') {
							desktop = device.result;
						} else if (category === 'mobile') {
							mobile = device.result;
						}
					});
					$scope.desktop = desktop;
					$scope.mobile = mobile;

					$scope.device_data_loaded = true;

					var newCustomers = ['New'];
					var returningCustomers = ['Returning'];
					_.each(newVsReturning, function (result) {
						if (result._id === 'new') {
							newCustomers.push(result.count);
						} else if (result._id === 'returning') {
							returningCustomers.push(result.count);
						}
					});
					if (newCustomers.length < 2) {
						newCustomers.push(0);
						returningCustomers.push(0);
					}
					newVsReturning = [
                        newCustomers,
                        returningCustomers
                    ];

					$scope.newVsReturning = newVsReturning;

					ChartAnalyticsService.newVsReturning($scope.newVsReturning, function (data) {
						$scope.newVsReturningConfig = data;
						$scope.newVsReturningConfig.loading = false;
					});
				});
				//Customer Site Analytics -- Done
				//User Agents / User Agents / OS
				//New Revenue Overview
				//Campaigns and Email
				ChartAnalyticsService.getUserAgentsAndOSChartData($scope.date, $scope.analyticsAccount, true, false, function (err, userAgents, os) {
					var userAgentData = [];
					var browserMap = {};
					var browserTotal = 0;
					_.each(userAgents, function (obj) {
						var browser = obj._id.browserName;
						var count = obj.count;
						if (browserMap[browser]) {
							browserMap[browser] += count;
						} else {
							browserMap[browser] = count;
						}
						browserTotal += count;
					});
					$scope.browserTotal = browserTotal;

					userAgentData = userAgentData.concat(_.pairs(browserMap));
					userAgentData = _.sortBy(userAgentData, function (pair) {
						return pair[1];
					});

					$scope.userAgentData = userAgentData;
					var uadLength = userAgentData.length - 1,
						browserPercent = 0;
					if (userAgentData && userAgentData.length > 0) {
						$scope.topBrowser = userAgentData[uadLength][0];
						browserPercent = Math.round((userAgentData[uadLength][1] / browserTotal) * 100);
						$scope.browserPercent = browserPercent;
					} else {
						$scope.topBrowser = '--';
						$scope.browserPercent = '--';
					}


					ChartAnalyticsService.userAgentChart(userAgentData, function (config) {
						$scope.userAgentConfig = config;
						$scope.userAgentConfig.loading = false;
					});

					$scope.userAgentTableData = userAgentData.reverse();


					// ======================================
					// OS Pie Chart
					// ======================================
					var osData = [];
					var osMap = {};
					var osTotal = 0;
					_.each(os, function (obj) {
						var os = obj._id.osName;
						if (os === 'undefined' || os === undefined) {
							os = 'Unknown';
						}
						var count = obj.count;
						if (osMap[os]) {
							osMap[os] += count;
						} else {
							osMap[os] = count;
						}
						osTotal += count;
					});
					osData = osData.concat(_.pairs(osMap));
					osData = _.sortBy(osData, function (pair) {
						return pair[1];
					});
					$scope.osData = osData;
					$scope.topOS = "__";
					var osPercent = 0;
					$scope.osPercent = "_";
					if (osData && osData.length > 0) {
						var osLength = osData.length - 1;
						$scope.topOS = osData[osLength];
						osPercent = Math.floor((osData[osLength][1] / osTotal) * 100);
						$scope.osPercent = osPercent;
					}

					ChartAnalyticsService.osChart(osData, function (config) {
						$scope.osConfig = config;
						$scope.osConfig.loading = false;
					});
				});
				ChartAnalyticsService.getRevenueChartData($scope.date, $scope.analyticsAccount, true, false, function (err, revenue) {
					// ======================================
					// Revenue
					// ======================================
					var revenueChartData = {
						xData: [],
						amountData: [],
						orderData: []
					};
					var currentTotalRevenue = 0;
					var currentTotalCount = 0;
					_.each(revenue.currentMonth, function (rev) {
						revenueChartData.xData.push(new Date(rev.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
						var amt = rev.total || 0;
						var cnt = rev.count || 0;
						revenueChartData.amountData.push(amt);
						revenueChartData.orderData.push(cnt);
						currentTotalRevenue += amt;
						currentTotalCount += cnt;
					});

					$scope.revenueData = revenueChartData;
					$scope.revenue = parseFloat(currentTotalRevenue).toFixed(2);
					$scope.orderCount = currentTotalCount;

					var revenuePreviousData = 0;
					var ordersPreviousData = 0;
					_.each(revenue.prevMonth, function (rev) {
						var value = rev.total || 0;
						revenuePreviousData += value;
						var cnt = rev.count || 0;
						ordersPreviousData += cnt;
					});

					$scope.revenuePreviousData = revenuePreviousData;

					var revenuePercent = ChartAnalyticsService.calculatePercentChange(revenuePreviousData, currentTotalRevenue);
					$scope.revenuePercent = revenuePercent;

					var ordersPercent = ChartAnalyticsService.calculatePercentChange(ordersPreviousData, currentTotalCount);
					$scope.ordersPercent = ordersPercent;

					ChartAnalyticsService.revenueOverview($scope.revenueData, function (data) {
						$scope.revenueConfig = data;
						$scope.revenueConfig.loading = false;
					});
				});
				ChartAnalyticsService.getEmailChartData($scope.date, $scope.analyticsAccount, true, false, function (err, emails) {
					// ======================================
					// Emails
					// ======================================

					var emailsData = [];
					var totalEmails = 0;
					_.each(emails.emails, function (email) {
						var subArr = [];
						var value = email.total || 0;
						subArr.push(new Date(email.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
						subArr.push(value);
						totalEmails += value;
						emailsData.push(subArr);
					});

					var campaignsData = [];
					_.each(emails.campaigns, function (campaign) {
						var subArr = [];
						var value = campaign.total || 0;
						subArr.push(new Date(campaign.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
						subArr.push(value);

						campaignsData.push(subArr);
					});

					var opensData = [];
					var totalOpens = 0;
					_.each(emails.opens, function (open) {
						var subArr = [];
						var value = open.total || 0;
						subArr.push(new Date(open.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
						subArr.push(value);
						totalOpens += value;
						opensData.push(subArr);
					});

					var clicksData = [];
					var totalClicks = 0;
					_.each(emails.clicks, function (click) {
						var subArr = [];
						var value = click.total || 0;
						subArr.push(new Date(click.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
						subArr.push(value);
						totalClicks += value;
						clicksData.push(subArr);
					});

					ChartAnalyticsService.emailsOverview(emailsData, campaignsData, opensData, clicksData, function (data) {
						$scope.emailsOverviewConfig = data;
						$scope.emailsOverviewConfig.loading = false;
						$scope.totalEmails = totalEmails;
						$scope.totalOpens = totalOpens;
						$scope.totalClicks = totalClicks;
					});

					//=======================================
					// Cleanup
					//=======================================

					$scope.displayVisitors = $scope.visitors > 0;
				});


			});

		};



		/** IN USE
		 *
		 * @param result2 - userReport current month
		 * @param result3 - userReport previous month
		 */
		$scope.visitorDataReport = function (result2, result3) {
			console.log('visitor data report:');
			console.log('result2:', result2);
			console.log('result3:', result3);
			var visitorsData = [];
			var currentTotalVisitors = 0;
			_.each(result2, function (visitor) {
				var subArr = [];
				var value = visitor.value || 0;
				currentTotalVisitors += value;
				subArr.push(new Date(visitor.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
				subArr.push(value);
				visitorsData.push(subArr);
			});
			console.log('visitorsData:', visitorsData);
			$scope.visitorsData = visitorsData;

			var vistorsPreviousData = 0;
			_.each(result3, function (previousVisitor) {
				var value = previousVisitor.value || 0;
				vistorsPreviousData += value;
			});

			var visitorsPercent = ChartAnalyticsService.calculatePercentChange(vistorsPreviousData, currentTotalVisitors);

			//$scope.$apply(function () {
			$scope.visitors = currentTotalVisitors;
			$scope.visitorsPercent = visitorsPercent;
			//});
		};


		/** IN USE
		 * This is plotting (non-bounce) visitor count on site vs. bounce visitor time on site
		 * slr.nonBounceAvg, slr.bounceAvg, slr.previousMonthBounceCount
		 * @param result8 - nonBounceAvg
		 * @param result10 - bounceAvg
		 * @param result11 - previousMonthBounceCount
		 */
		$scope.contentInteractionsReportData = function (result8, result10, previousMonthBounceCount) {
			console.log('contentInteractionsReportData:');
			console.log('nonBounceAvg:', result8);
			console.log('bounceAvg:', result10);
			console.log('previousMonthBounceCount:', previousMonthBounceCount);
			// ----------------------------------------
			// Average Visit Duration
			// ----------------------------------------

			var avgSessionData = [];
			_.each(result8, function (session) {
				var subArr = [];
				var value = session.count || session.value || 0;
				subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
				subArr.push(value);
				avgSessionData.push(subArr);
			});

			$scope.avgSessionData = avgSessionData;

			// ======================================
			// Bounces
			// ======================================

			var _bouncesData = [];
			var _totalBounces = 0;
			_.each(result10, function (bounce) {
				var subArr = [];
				var value = bounce.count || bounce.value || 0;
				_totalBounces += value;
				subArr.push(new Date(bounce.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
				subArr.push(value);
				_bouncesData.push(subArr);
			});

			$scope.bouncesData = _bouncesData;

			ChartAnalyticsService.timeOnSite($scope.avgSessionData, $scope.bouncesData, function (data) {
				$scope.timeonSiteConfig = data;
				$scope.timeonSiteConfig.loading = false;
			});


			var bouncesPercent = ChartAnalyticsService.calculatePercentChange(previousMonthBounceCount, _totalBounces);
			//$scope.$apply(function () {
			$scope.bounces = _totalBounces;
			$scope.bouncesPercent = bouncesPercent;
			//});
		};

		$scope.renderVisitorCharts = function () {
			if ($("#visitor_locations").length) {
				$timeout(function () {
					var location_data = angular.copy($scope.locationData);
					var countryLocationData = angular.copy($scope.countryLocationData);
					ChartAnalyticsService.visitorLocations(location_data, Highcharts.maps['countries/us/us-all'], countryLocationData, Highcharts.maps['custom/world']);
					ChartAnalyticsService.visitorLocationsGlobal(location_data, Highcharts.maps['countries/us/us-all'], countryLocationData, Highcharts.maps['custom/world']);
				}, 200);
				if (!$scope.displayVisitors) {
					console.log('no visitors');
					// var deshBlockUI = blockUI.instances.get('deshboardBlock');
					// deshBlockUI.start("There haven't been any new visitors to your site yet. Once they do that data will be displayed here. To increase your site visitors you should add a social post.");
				}
			} else {
				$timeout(function () {
					$scope.renderVisitorCharts();
				}, 100);
			}
		};

		$scope.renderAnalyticsCharts = function () {
			if ($("#visitor_locations").length) {
				$timeout(function () {
					var location_data = angular.copy($scope.locationData);
					var countryLocationData = angular.copy($scope.countryLocationData);
					ChartAnalyticsService.visitorLocations(location_data, Highcharts.maps['countries/us/us-all'], countryLocationData, Highcharts.maps['custom/world']);
					ChartAnalyticsService.visitorLocationsGlobal(location_data, Highcharts.maps['countries/us/us-all'], countryLocationData, Highcharts.maps['custom/world']);
				}, 200);
				if (!$scope.displayVisitors) {
					console.log('no visitors');
					// var deshBlockUI = blockUI.instances.get('deshboardBlock');
					// deshBlockUI.start("There haven't been any new visitors to your site yet. Once they do that data will be displayed here. To increase your site visitors you should add a social post.");
				}
			} else {
				$timeout(function () {
					$scope.renderAnalyticsCharts();
				}, 100);
			}
		};


		$scope.displayDatePicker = function () {
			$timeout(function () {
				angular.element('.deshboard-date-picker').click();
			}, 0);
		};

		function reflowCharts() {
			window.Highcharts.charts.forEach(function (chart) {
				$timeout(function () {
					if (angular.isDefined(chart) && Object.keys(chart).length)
						chart.reflow();
				}, 0);
			});
		}

		$scope.$watch('overview', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("overview", value);
				reflowCharts();
			}
		});

		$scope.$watch('frontrunnerSite', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("frontrunnerSite", value);
				reflowCharts();
			}
		});


		$scope.$watch('locations', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("locations", value);
				reflowCharts();
			}
		});


		$scope.$watch('locationsGlobal', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("locationsGlobal", value);
				reflowCharts();
			}
		});

		$scope.$watch('interactions', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("interactions", value);
				reflowCharts();
			}
		});

		$scope.$watch('device', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("device", value);
				reflowCharts();
			}
		});

		$scope.$watch('newVReturning', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("newVReturning", value);
				reflowCharts();
			}
		});

		$scope.$watch('trafficSources', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("trafficSources", value);
				reflowCharts();
			}
		});

		$scope.$watch('pageanalytics', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("pageanalytics", value);
				reflowCharts();
			}
		});

		$scope.$watch('ua', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("ua", value);
				reflowCharts();
			}
		});

		$scope.$watch('userAgentsTable', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("userAgentsTable", value);
				reflowCharts();
			}
		});

		$scope.$watch('rev', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("rev", value);
				reflowCharts();
			}
		});

		$scope.$watch('os', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("os", value);
				reflowCharts();
			}
		});

		$scope.$watch('campaigns', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("campaigns", value);
				reflowCharts();
			}
		});

		$scope.$watch('frontrunnerSite', function (value, oldValue) {
			if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
				AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("frontrunnerSite", value);
				reflowCharts();
			}
		});

		$scope.setAnalyticsWidgetStates = function () {
			AnalyticsWidgetStateService.getPlateformAnalyticsWidgetStates();
			$timeout(function () {
				$scope.overview = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.overview;
				$scope.locations = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.locations;
				$scope.locationsGlobal = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.locationsGlobal;
				$scope.interactions = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.interactions;
				$scope.device = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.device;
				$scope.newVReturning = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.newVReturning;
				$scope.trafficSources = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.trafficSources;
				$scope.pageanalytics = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.pageanalytics;
				$scope.ua = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.ua;
				$scope.userAgentsTable = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.userAgentsTable;
				$scope.rev = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.rev;
				$scope.os = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.os;
				$scope.campaigns = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.campaigns;
				$scope.frontrunnerSite = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.frontrunnerSite;
				$scope.dataLoaded = true;
				reflowCharts();
			}, 0);

		};


		$scope.uiState = {
			dashboardMode: false
		};


		$scope.$watch('uiState.dashboardMode', function (mode) {
			if (angular.isDefined(mode)) {
				if (mode) {
					console.log("dashboard Mode");
					setDashboardMode();
				} else {
					console.log("desktop Mode");
					setDesktopMode();
				}
			}
		});

		var timer ;

		function setDashboardMode() {
			$rootScope.app.layout.isAnalyticsDashboardMode = true;
			timer = $interval(function () {
				console.log("Refreshing");
				$scope.runAnalyticsReports();
				$scope.platformTraffic();
                $scope.platformTrafficDetails();
			}, $scope.analyticsRefreshAfterTime);
		}

		function setDesktopMode() {
			$rootScope.app.layout.isAnalyticsDashboardMode = false;
			if (angular.isDefined(timer)) {
				$interval.cancel(timer);
				timer = undefined;
			}
		}


		$scope.$watchGroup(['app.layout.isAnalyticsDashboardMode', 'app.layout.isSidebarClosed'], function (val1, val2) {
			if (angular.isDefined(val1) || angular.isDefined(val2)) {
				reflowCharts();
			}
		});


		function isVisibleLegend(name, widget) {
			var legend = widget.toLowerCase() + "_" + name.toLowerCase() + "_legend";
			legend = legend.replace(/ /g, "_");
			return AnalyticsWidgetStateService.getNamedPlateformAnalyticsWidgetState(legend);
		}

		function setLegendVisibility(widget, name, value) {
			var legend = widget.toLowerCase() + "_" + name.toLowerCase() + "_legend";
			legend = legend.replace(/ /g, "_");
			AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates(legend, value);
		}

    }]);
}(angular));
