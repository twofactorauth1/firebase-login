/*global app, angular, window,Fingerprint,CryptoJS,document,console, $*/
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('activateAccountComponent', ['$filter', '$q', '$location', function ($filter, $q, $location) {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.plans = {
                "NEW" : "NEW",
                "EXISTING" : "EXISTING"
            }

			scope.newAccount = {
				plan: scope.plans.NEW
			}

			scope.totalSteps = 3;
			scope.currentStep = 1;
		}
	};
}]);
