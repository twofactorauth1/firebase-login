/*global app, angular, window,Fingerprint,CryptoJS,document,console, $*/
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('activateAccountComponent', ['$filter', '$timeout', '$q', '$location', function ($filter, $timeout, $q, $location) {
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
			scope.selectAccountTemplate = selectAccountTemplate;
			scope.previewTemplate = previewTemplate;
			scope.backToTemplates = backToTemplates;
			scope.templates = [
				{
					_id: 1,
					previewUrl: "https://s3.amazonaws.com/indigenous-digital-assets/test_account_2715/Tessco_content_png_1508233372188"
				},
				{
					_id: 2,
					previewUrl: "https://s3.amazonaws.com/indigenous-digital-assets/test_account_2715/Tessco_content_png_1508233372188"
				},
				{
					_id: 3,
					previewUrl: "https://s3.amazonaws.com/indigenous-digital-assets/test_account_2715/Tessco_content_png_1508233372188"
				}
			]

			function setUpPlan(plan){
				scope.newAccount.plan = scope.plans[plan];
				if(scope.newAccount.plan === scope.plans.NEW)
					scope.currentStep = 2;
			}

			function selectAccountTemplate(template){
				resetSelectedTemplate();
				scope.newAccount.templateId = template._id;
				scope.currentStep = 3;
			}

			function previewTemplate(template){
				scope.selectedTemplate = template;
				scope.showPreview = true;
			}

			function backToTemplates(){
				resetSelectedTemplate();
			}

			function resetSelectedTemplate(){
				scope.selectedTemplate = undefined;
				scope.showPreview = false;
			}
		}
	};
}]);
