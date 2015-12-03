'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('DOHYCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "$timeout", "DashboardService", function ($scope, $location, toaster, $filter, $modal, $timeout, DashboardService) {


    var vm = this;

    vm.state = {};

    $scope.$watch(function() { return DashboardService.state }, function(state) {
        vm.state = state;
        var analyticsWidgets = [];
        _.each(state.workstreams, function(workstream){
            analyticsWidgets = analyticsWidgets.concat(workstream.analyticWidgets);
        });
        vm.state.analyticsWidgets = analyticsWidgets;
    }, true);

    (function init() {


    })();

  }]);
}(angular));
