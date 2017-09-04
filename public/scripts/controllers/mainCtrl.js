/*global mainApp */
mainApp.controller('MainCtrl', ['$scope', 'ENV', '$document', '$window',
    function ($scope, ENV, $document, $window) {
		'use strict';
		var  that = this;
		that.segmentIOWriteKey = ENV.segmentKey;

		$scope.init = function (value) {
			$scope.websiteId = value;
		};

		$scope.isSection = function (value) {
			return (value === 'section');
		};

		/*
		 * Setup some org specific settings
		 */
		$scope.orgId = $window.indigenous.orgId;
		ENV.stripeKey = ENV.stripeKey[$scope.orgId];

    }
]);
