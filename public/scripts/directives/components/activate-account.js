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

			scope.setUpPlan = setUpPlan;

			scope.templates = [
				{
					_id: 1,
					previewUrl: "https://s3.amazonaws.com/indigenous-digital-assets/test_account_2715/leadsource_1508228298810.png"
				},
				{
					_id: 12,
					previewUrl: "https://s3.amazonaws.com/indigenous-digital-assets/test_account_2715/leadsource_1508228298810.png"
				},
				{
					_id: 3,
					previewUrl: "https://s3.amazonaws.com/indigenous-digital-assets/test_account_2715/leadsource_1508228298810.png"
				}
			]

			function setUpPlan(plan){
				scope.newAccount.plan = scope.plans[plan];
				scope.currentStep = 2;
			}
		}
	};
}]);
