'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('DOHYCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "$timeout", "DashboardService", "ChartAnalyticsService", function ($scope, $location, toaster, $filter, $modal, $timeout, DashboardService, ChartAnalyticsService) {

        var vm = this;

        vm.state = {
            account: $scope.account
        };

        vm.uiState = {
            openWorkstream: { _id: undefined }
        };
        
        function updateLiveDetailObject(liveVisitorDetails){
			vm.state.liveVisitorDetails=[];
			_.each(liveVisitorDetails, function(detail){
				var server_time =new Date();
				if( detail.pageEvents.length>0){
                    server_time =
                    moment(detail.pageEvents[0].pageTime)._d;
                }
                _.each(detail.pageEvents, function(evn){
					if(evn.activityType== 'CONTACT_FORM'){
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
				  });
				//console.log('calculating difference between now and ', server_time);
				//var difference = new Date().getTime()-server_time.getTime() ;
                var difference = detail.difference;
				//console.log('difference:', difference);
				var sec=Math.floor((difference / 1000) % 60);
				detail.resultInMinutes = Math.floor(difference / 60000)+(sec<10?":0"+sec:":"+sec);

				vm.state.liveVisitorDetails.push(detail);
			});
		}
        vm.showInsert = true;
        vm.openMediaModal = openMediaModal;
        vm.insertMedia = insertMedia;
        vm.buildViewModel = buildViewModel;
        vm.setActiveVisitorIndex = setActiveVisitorIndex;
        vm.workstreamDisplayOrder = _.invert(_.object(_.pairs(DashboardService.workstreamDisplayOrder)));
        vm.analyticDisplayOrder = _.invert(_.object(_.pairs(DashboardService.analyticDisplayOrder)));
        vm.convertUtcToLocal = convertUtcToLocal;
        vm.livedataLoading= true;
        $scope.$watch(function() { return DashboardService.state }, function(state) {

            state.workstreams = _.sortBy(state.workstreams, function(x) {
                return vm.workstreamDisplayOrder[x.name]
            });

            vm.state = state;

            $timeout(function() {
                vm.buildViewModel();
            }, 0);

        }, true);

        function buildViewModel() {

            var incompleteWorkstreams = [];
            var completeWorkstreams = [];
            var completeBlocks = 0;
            var incompleteBlocks = 0;
            var analyticsWidgets = [];
            //var unlockedAnalyticsWidgets = []

            _.each(vm.state.workstreams, function(workstream){

                var analyticsWidgetsCopy = angular.copy(workstream.analyticWidgets);

                _.each(analyticsWidgetsCopy, function(analytic){
                    analytic.completed = workstream.unlocked && workstream.completed;
                    analyticsWidgets.push(analytic);
                });

                completeBlocks = workstream.blocks.filter(function(block) { return block.complete; }).length;
                incompleteBlocks = workstream.blocks.filter(function(block) { return !block.complete; }).length;

                workstream.completeRatio = completeBlocks + ' out of ' + (completeBlocks + incompleteBlocks) + ' completed.';
                workstream.completePercentage = $filter('number')(100 * completeBlocks / (completeBlocks + incompleteBlocks), 0);

            });


            //remove duplicates and set to state, and sort
            //vm.state.lockedAnalyticsWidgets = _.uniq(lockedAnalyticsWidgets, function(w) { return w.name; });
            vm.state.analyticsWidgets = _.sortBy(_.uniq(analyticsWidgets, function(w) { return w.name; }), function(x) {
                return vm.analyticDisplayOrder[x.name] && !x.completed
            });



            vm.state.completeWorkstreams = completeWorkstreams;
            vm.state.incompleteWorksreams = incompleteWorkstreams;

        }


        function openMediaModal(modal, controller, size) {
            console.log('openModal >>> ', modal, controller);
            var _modal = {
                templateUrl: modal,
                keyboard: true,
                backdrop: 'static',
                size: 'md',
                resolve: {
                    vm: function() {
                        return vm;
                    }
                }
            };
            if (controller) {
                _modal.controller = controller;
                _modal.resolve.showInsert = function () {
                  return vm.showInsert;
                };
                _modal.resolve.insertMedia = function () {
                  return vm.insertMedia;
                };
                _modal.resolve.isSingleSelect = function () {
                  return true
                };
            }

            if (size) {
                _modal.size = 'lg';
            }

            vm.modalInstance = $modal.open(_modal);

            vm.modalInstance.result.then(null, function () {
                angular.element('.sp-container').addClass('sp-hidden');
            });
        }

        function insertMedia(asset) {
            vm.state.account.business.logo = asset.url.replace(/^https?:/,'');
            DashboardService.updateAccount(vm.state.account).then(function(response){
                toaster.pop('success', 'Business Logo', 'The logo was updated successfully.');
                console.log('Account logo updated');
            });
        }

        function sectionBGStyle(image) {
            var styleString = ' ';
            styleString += 'background-image: url("' + image + '")';
            vm.sectionBGStyle = styleString;
        }

        $scope.$watch(function() { return DashboardService.imageGallery; }, function(images){
            if(images){
                var now = new Date();
                var start = new Date(now.getFullYear(), 0, 0);
                var diff = now - start;
                var oneDay = 1000 * 60 * 60 * 24;
                var dayOfYear = Math.floor(diff / oneDay);
                var moduloIndex = dayOfYear % images.length;
                var dashboardBGImage = images[moduloIndex];
                sectionBGStyle(dashboardBGImage);
            }
        });


        $scope.$watch(function() { return DashboardService.broadcastMessages; }, function(messages){
            if(messages && messages.length){
                vm.state.broadCastMessage = messages[0];
            }
            else{
                vm.state.broadCastMessage = null;
            }
        });


        function loadLocationChart(data){
           /* var locationData = [];
            if (data) {
                var _formattedLocations = [];
                _.each(data, function (loc) {
                    if (loc['ip_geo_info.province']) {
                        _formattedLocations.push(loc);
                    }
                });
                // $scope.mostPopularState = _.max(_formattedLocations, function (o) {
                //     return o.result;
                // });
                _.each(data, function (location) {
                    var _geo_info = ChartAnalyticsService.stateToAbbr(location['ip_geo_info.province']);
                    if (_geo_info) {
                        var subObj = {};
                        subObj.code = _geo_info;
                        subObj.value = location.result;
                        var locationExists = _.find(locationData, function (loc) {
                            return loc.code === location.code;
                        });
                        if (!locationExists && subObj.value) {
                            locationData.push(subObj);
                        }
                    }
                });
            }
            $scope.locationData = locationData;
            */
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

        $scope.$watch(function() { return DashboardService.liveTraffic;}, function(liveTraffic){
            if(liveTraffic && liveTraffic.length > 0) {
                if(!$scope.liveTrafficConfig) {
                    //initialize chart
                    var trafficData = _.pluck(liveTraffic, 'count');
                    var locationData = liveTraffic[0].locations;
                    loadLocationChart(locationData);
                    var categories = [];
                    for(var i=0; i<liveTraffic.length; i++) {
                        categories.push("" + (liveTraffic.length - i));
                    }
                    var liveTrafficConfig = ChartAnalyticsService.liveTraffic(trafficData, categories);
                    $scope.liveTraffic = liveTraffic;
                    $scope.liveTrafficConfig = liveTrafficConfig;
                    $scope.liveTrafficCategories = categories;
                    $timeout(DashboardService.getLiveTraffic, 15000);
                } else {
                    //updateChart

                    //figure out what's different

                    var chart = $('#live-traffic-chart').highcharts();
                    if(chart)
                        chart.series[0].setData(_.pluck(liveTraffic, 'count'), true);

                    $scope.liveTraffic = liveTraffic;
                    var locationData = liveTraffic[0].locations;
                    loadLocationChart(locationData);
                    $timeout(DashboardService.getLiveTraffic, 15000);
                }

            }
        });


        $scope.$watch(function() { return DashboardService.liveVisitorDetails;}, function(liveVisitorDetails){
            vm.livedataLoading=false
            updateLiveDetailObject(liveVisitorDetails);
            if(liveVisitorDetails && liveVisitorDetails.length){
                setActiveVisitorIndex(0, true);
            }
            $timeout(DashboardService.getLiveVisitorDetails, 15000);
        });

        function setActiveVisitorIndex(index, reload){
            if(reload && vm.activeVisitorDetail){
                var selectedVisitorDetail = _.findWhere(vm.state.liveVisitorDetails, {
                   _id: vm.activeVisitorDetail._id
                });
                if(selectedVisitorDetail){
                    var selectedVisitorIndex = _.findIndex(vm.state.liveVisitorDetails, selectedVisitorDetail);
                    if(selectedVisitorIndex > -1){
                        vm.selectedVisitorIndex = selectedVisitorIndex;
                        vm.activeVisitorDetail = vm.state.liveVisitorDetails[selectedVisitorIndex];
                    }
                    else{
                        vm.selectedVisitorIndex = index;
                        vm.activeVisitorDetail = vm.state.liveVisitorDetails[index];
                    }
                }
                else{
                    vm.selectedVisitorIndex = index;
                    vm.activeVisitorDetail = vm.state.liveVisitorDetails[index];
                }
            }
            else{
                vm.selectedVisitorIndex = index;
                vm.activeVisitorDetail = vm.state.liveVisitorDetails[index];
            }

        }

        function reflowCharts(){
            window.Highcharts.charts.forEach(function(chart){
                $timeout(function() {
                    if(angular.isDefined(chart) && Object.keys(chart).length)
                        chart.reflow();
                }, 0);
            })
        };

        $scope.$watch('app.layout.isSidebarClosed',  function (val) {
            if(angular.isDefined(val)){
                reflowCharts();
            }
        });


        function convertUtcToLocal(_date){
            if(_date){
              return moment.utc(_date).local().format('YYYY-MM-DD HH:mm:ss')
            }
        }

        (function init() {
            $timeout(function() {
                reflowCharts();
            }, 0);

        })();

    }]);
}(angular));
