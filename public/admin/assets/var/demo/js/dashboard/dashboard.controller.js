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

        vm.showInsert = true;
        vm.openMediaModal = openMediaModal;
        vm.insertMedia = insertMedia;
        vm.buildViewModel = buildViewModel;
        vm.workstreamDisplayOrder = _.invert(_.object(_.pairs(DashboardService.workstreamDisplayOrder)));
        vm.analyticDisplayOrder = _.invert(_.object(_.pairs(DashboardService.analyticDisplayOrder)));

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

            // var incompleteWorkstreams = [];
            // var completeWorkstreams = [];
            // var completeBlocks = 0;
            // var incompleteBlocks = 0;
            // var analyticsWidgets = [];
            // //var unlockedAnalyticsWidgets = []

            // _.each(vm.state.workstreams, function(workstream){

            //     var analyticsWidgetsCopy = angular.copy(workstream.analyticWidgets);

            //     _.each(analyticsWidgetsCopy, function(analytic){
            //         analytic.completed = workstream.unlocked && workstream.completed;
            //         analyticsWidgets.push(analytic);
            //     });

            //     completeBlocks = workstream.blocks.filter(function(block) { return block.complete; }).length;
            //     incompleteBlocks = workstream.blocks.filter(function(block) { return !block.complete; }).length;

            //     workstream.completeRatio = completeBlocks + ' out of ' + (completeBlocks + incompleteBlocks) + ' completed.';
            //     workstream.completePercentage = $filter('number')(100 * completeBlocks / (completeBlocks + incompleteBlocks), 0);

            // });


            // //remove duplicates and set to state, and sort
            // //vm.state.lockedAnalyticsWidgets = _.uniq(lockedAnalyticsWidgets, function(w) { return w.name; });
            // vm.state.analyticsWidgets = _.sortBy(_.uniq(analyticsWidgets, function(w) { return w.name; }), function(x) {
            //     return vm.analyticDisplayOrder[x.name] && !x.completed
            // });



            // vm.state.completeWorkstreams = completeWorkstreams;
            // vm.state.incompleteWorksreams = incompleteWorkstreams;
            $scope.$watch("$parent.orgCardAndPermissions", function(permissions) {
                if(angular.isDefined(permissions)){
                    vm.state.analyticsWidgets = [];
                    if(permissions.inventory){
                        vm.state.analyticsWidgets.push({
                           'completed': false,
                           'link': "#",
                           'name': 'Inventory'
                        })                            
                    }
                    if(permissions.purchaseorders){
                        vm.state.analyticsWidgets.push({
                           'completed': false,
                            'link': "#",
                            'name': 'PurchaseOrders'
                        })                            
                    }
                    if(permissions.ledger){
                        vm.state.analyticsWidgets.push({
                           'completed': false,
                            'link': "#",
                            'name': 'Invoices'
                        })                            
                    }
                }    
            })
        }


        function openMediaModal(modal, controller, size) {
            console.log('openModal >>> ', modal, controller);
            var _modal = {
                templateUrl: modal,
                keyboard: false,
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

        //function sectionBGStyle(image) {
            // var styleString = ' ';
            // styleString += 'background-image: url("' + image + '")';
            // vm.sectionBGStyle = styleString;
        //}

        // $scope.$watch(function() { return DashboardService.imageGallery; }, function(images){
        //     if(images){
        //         var now = new Date();
        //         var start = new Date(now.getFullYear(), 0, 0);
        //         var diff = now - start;
        //         var oneDay = 1000 * 60 * 60 * 24;
        //         var dayOfYear = Math.floor(diff / oneDay);
        //         var moduloIndex = dayOfYear % images.length;
        //         var dashboardBGImage = images[moduloIndex];
        //         sectionBGStyle(dashboardBGImage);
        //     }
        // });

        

        $scope.$watch(function() { return DashboardService.liveTraffic;}, function(liveTraffic){
            if(liveTraffic && liveTraffic.length > 0) {
                if(!$scope.liveTrafficConfig) {
                    //initialize chart
                    var trafficData = _.pluck(liveTraffic, 'count');

                    var categories = [];
                    for(var i=0; i<liveTraffic.length; i++) {
                        categories.push("" + (liveTraffic.length - i));
                    }
                    var liveTrafficConfig = ChartAnalyticsService.liveTraffic(trafficData, categories);
                    $scope.liveTraffic = liveTraffic;
                    $scope.liveTrafficConfig = liveTrafficConfig;
                    $scope.liveTrafficCategories = categories;
                    $timeout(DashboardService.getLiveTraffic, 30000);
                } else {
                    //updateChart

                    //figure out what's different

                    var chart = $('#live-traffic-chart').highcharts();
                    if(chart)
                        chart.series[0].setData(_.pluck(liveTraffic, 'count'), true);

                    $scope.liveTraffic = liveTraffic;
                    $timeout(DashboardService.getLiveTraffic, 15000);
                }

            }
        });

        function reflowCharts(){
            window.Highcharts.charts.forEach(function(chart){
                if(chart){
                    $timeout(function() {
                        chart.reflow();
                    }, 500);
                }
            })
        };

        $scope.$watch('app.layout.isSidebarClosed',  function (val) {
            if(angular.isDefined(val)){
                reflowCharts();
            }
        });

        (function init() {
            $timeout(function() {
                reflowCharts();
            }, 1000);

        })();

    }]);
}(angular));
