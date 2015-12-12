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

            if(workstream.completed===true) {
                completeWorkstreams.push(workstream);
                // workstream.analyticWidgets.show = true; //TODO how to show analytics widgets?
            } else {
                incompleteWorkstreams.push(workstream);
            }

            analyticsWidgets = analyticsWidgets.concat(workstream.analyticWidgets);

            var completeBlocks = workstream.blocks.filter(function(block) { return block.complete; }).length;
            var incompleteBlocks = workstream.blocks.filter(function(block) { return !block.complete; }).length;

            workstream.completeRatio = completeBlocks + ' out of ' + (completeBlocks + incompleteBlocks) + ' completed.';
            workstream.completePercentage = $filter('number')(100 * completeBlocks / (completeBlocks + incompleteBlocks), 0);

        });

        vm.state.analyticsWidgets = analyticsWidgets;
        vm.state.completeWorkstreams = completeWorkstreams;
        vm.state.incompleteWorksreams = incompleteWorkstreams;
    }, true);

    // $scope.$watch(function() {return DashboardService.state.reports}, function(reports){
    //     if(reports.contactsByDay) {
    //         vm.state.reports.contactsByDayConfig = buildContactsByDayWidgetConfig(reports.contactsByDay);
    //     }
    // }, true);


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
