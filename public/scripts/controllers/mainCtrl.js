'use strict';

mainApp.controller('MainCtrl', ['$scope', 'ENV', '$document', '$window',
    function ($scope, ENV, $document, $window) {

        var account, pages, website, that = this;
        that.segmentIOWriteKey = ENV.segmentKey;

        var body = document.body,
            html = document.documentElement;

        $scope.init = function (value) {
            $scope.websiteId = value;
        };

        $scope.isSection = function (value) {
            if (value == 'section') {
                return true;
            } else {
                return false;
            }
        };

        /*
         * Setup some org specific settings
         */
        $scope.orgId = $window.indigenous.orgId;
        ENV.stripeKey = ENV.stripeKey[$scope.orgId];

    }
]);
