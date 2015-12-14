'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('DOHYCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "$timeout", "DashboardService", function ($scope, $location, toaster, $filter, $modal, $timeout, DashboardService) {

        var vm = this;

        vm.account = $scope.account;

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

            // var analyticsWidgets = [];
            var incompleteWorkstreams = [];
            var completeWorkstreams = [];
            var completeBlocks = 0;
            var incompleteBlocks = 0;
            var lockedAnalyticsWidgets = []
            var unlockedAnalyticsWidgets = []
            // var openWorkstream = {};

            // if (vm.uiState.openWorkstream) {
            //     openWorkstream = _.findWhere(vm.state.workstreams, { _id: vm.uiState.openWorkstream._id });
            // }

            _.each(vm.state.workstreams, function(workstream){

                var analyticsWidgetsCopy = angular.copy(workstream.analyticWidgets);

                if (workstream.completed === true) {
                    completeWorkstreams.push(workstream);
                    unlockedAnalyticsWidgets = unlockedAnalyticsWidgets.concat(analyticsWidgetsCopy);
                } else {
                    incompleteWorkstreams.push(workstream);
                    lockedAnalyticsWidgets = lockedAnalyticsWidgets.concat(analyticsWidgetsCopy);
                }

                completeBlocks = workstream.blocks.filter(function(block) { return block.complete; }).length;
                incompleteBlocks = workstream.blocks.filter(function(block) { return !block.complete; }).length;

                workstream.completeRatio = completeBlocks + ' out of ' + (completeBlocks + incompleteBlocks) + ' completed.';
                workstream.completePercentage = $filter('number')(100 * completeBlocks / (completeBlocks + incompleteBlocks), 0);

            });

            //remove unlocked analytics from the locked array
            lockedAnalyticsWidgets = _.reject(lockedAnalyticsWidgets, function(w) {
                return _.contains(_.pluck(unlockedAnalyticsWidgets, 'name'), w.name)
            });

            //remove duplicates and set to state, and sort
            vm.state.lockedAnalyticsWidgets = _.uniq(lockedAnalyticsWidgets, function(w) { return w.name; });
            vm.state.unlockedAnalyticsWidgets = _.sortBy(_.uniq(unlockedAnalyticsWidgets, function(w) { return w.name; }), function(x) {
                return vm.analyticDisplayOrder[x.name]
            });

            vm.state.completeWorkstreams = completeWorkstreams;
            vm.state.incompleteWorksreams = incompleteWorkstreams;

            //set openWorkstream to updated data
            // if (openWorkstream) {
            //     vm.uiState.openWorkstream = openWorkstream;
            // }

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
            vm.account.business.logo = asset.url;
            DashboardService.updateAccount(vm.account).then(function(response){
                toaster.pop('success', 'Business Logo', 'The logo was updated successfully.');
                console.log('Account logo updated');
            })
        }

        (function init() {
            DashboardService.getContactsByDayReport();

        })();

    }]);
}(angular));
