'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('DOHYCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "$timeout", "DashboardService", function ($scope, $location, toaster, $filter, $modal, $timeout, DashboardService) {


    var vm = this;

    vm.state = {};
    vm.state.account = $scope.account;

    $scope.$watch(function() { return DashboardService.workstreams }, function(workstreams) {
        vm.state.workstreams = workstreams;
        var analyticsWidgets = [];
        var incompleteWorkstreams = [];
        var completeWorkstreams = [];
        _.each(workstreams, function(workstream){
            analyticsWidgets = analyticsWidgets.concat(workstream.analyticWidgets);
            if(workstream.completed===true) {
                completeWorkstreams.push(workstream);
            } else {
                incompleteWorkstreams.push(workstream);
            }
        });
        vm.state.analyticsWidgets = analyticsWidgets;
        vm.state.completeWorkstreams = completeWorkstreams;
        vm.state.incompleteWorksreams = incompleteWorkstreams;

    }, true);

    (function init() {


    })();

  }]);
}(angular));
