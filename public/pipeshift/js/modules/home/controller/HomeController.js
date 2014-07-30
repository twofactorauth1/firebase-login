'use strict';

angular.module('app.modules.home')
    .controller('HomeController', ['$scope', '$modal', 'security', function ($scope, $modal, security) {
        $scope.isAuthenticated = security.isAuthenticated;
        $scope.selectedFeature = 1;
        $scope.navClass = function (page) {
            var rootTokens = $location.path().split('/');
            var baseRouteToken = (rootTokens.length > 0 ? rootTokens[1] : $location.path()) || 'home';
            return page === baseRouteToken ? 'active' : '';
        };
        $scope.selectFeature = function (feature) {
            $scope.selectedFeature = feature;
        }
    }]);