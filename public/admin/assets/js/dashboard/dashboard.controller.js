'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('DOHYCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "$timeout", "DashboardService", function ($scope, $location, toaster, $filter, $modal, $timeout, DashboardService) {


    var vm = this;

    vm.state = {};
    vm.state.account = $scope.account;

    vm.uiState = {
        openWorkstream: null
    };

    $scope.$watch(function() { return DashboardService.state }, function(state) {
        vm.state = state;
        var analyticsWidgets = [];

        var incompleteWorkstreams = [];
        var completeWorkstreams = [];

        _.each(vm.state.workstreams, function(workstream){

            analyticsWidgets = analyticsWidgets.concat(workstream.analyticWidgets);
            if(workstream.completed===true) {
                completeWorkstreams.push(workstream);
            } else {
                incompleteWorkstreams.push(workstream);
            }

            var completeBlocks = workstream.blocks.filter(function(block) { return block.complete; }).length;
            var incompleteBlocks = workstream.blocks.filter(function(block) { return !block.complete; }).length;

            // workstream.completePercentage = $filter('number')(100 * completeBlocks / (completeBlocks + incompleteBlocks), 2);
            workstream.completePercentage = completeBlocks + ' out of ' + (completeBlocks + incompleteBlocks) + ' completed.'

        });
        vm.state.analyticsWidgets = analyticsWidgets;
        vm.state.completeWorkstreams = completeWorkstreams;
        vm.state.incompleteWorksreams = incompleteWorkstreams;

    }, true);

    $scope.$watch(function() {return DashboardService.state.reports}, function(reports){
        if(reports.contactsByDay) {
            vm.state.reports.contactsByDayConfig = buildContactsByDayWidgetConfig(reports.contactsByDay);
        }
    }, true);



    var buildContactsByDayWidgetConfig = function(contactsByDay) {
        var contactsPerDayData = [];
        _.each(contactsByDay, function(dayData){
            var xy = [];

            //subtract one from the month.  mongo is 1-based and js is 0-based.  Dat off-by-one, tho.
            xy[0] = new Date(dayData._id._id.year, dayData._id._id.month-1, dayData._id._id.day, 0,0,0,0).getTime();
            xy[1] = dayData.count;
            contactsPerDayData.push(xy);
        });
        var config = {
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
                title: {
                    text: ''
                }
            },
            series: [{
                name: 'New Leads Per Day',
                data: contactsPerDayData
            }],
            credits: {
                enabled: false
            }
        };
        return config;
    };

    (function init() {
        DashboardService.getContactsByDayReport();

    })();

  }]);
}(angular));
