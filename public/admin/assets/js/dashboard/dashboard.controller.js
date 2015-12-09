'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('DOHYCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "$timeout", "DashboardService", function ($scope, $location, toaster, $filter, $modal, $timeout, DashboardService) {


    var vm = this;

    vm.state = {};

    vm.uiState = {
        openWorkstream: { _id: undefined }
    };
    vm.showInsert = true;
    vm.openMediaModal = openMediaModal;
    vm.insertMedia = insertMedia;

    $scope.$watch(function() { return DashboardService.state }, function(state) {
        vm.state = state;
        vm.state.account = $scope.account;
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
        // vm.state.analyticsWidgets = analyticsWidgets;
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
        vm.state.account.business.logo = asset.url;
        DashboardService.updateAccount(vm.state.account).then(function(response){
            toaster.pop('success', 'Business Logo', 'The logo was updated successfully.');
            console.log('Account logo updated');
        })
    }

    (function init() {
        DashboardService.getContactsByDayReport();

    })();

  }]);
}(angular));
