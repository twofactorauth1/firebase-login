/*global app, angular, window,Fingerprint,CryptoJS,document,console, $*/
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('activateAccountComponent', ['$filter', '$timeout', '$q', '$location', 'accountService', 'activateAccountService', function ($filter, $timeout, $q, $location, accountService, activateAccountService) {
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
            };

			scope.newAccount = {
				plan: scope.plans.NEW
			};

			scope.totalSteps = 3;
			scope.currentStep = 1;

			scope.setUpPlan = setUpPlan;
			scope.selectAccountTemplate = selectAccountTemplate;
			scope.previewTemplate = previewTemplate;
			scope.backToTemplates = backToTemplates;
			scope.copyToClipboard = copyToClipboard;
			scope.completeActivation = completeActivation;
            scope.activateAccount = activateAccount;

			scope.templates = [
				{
					_id: 2746,
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
			];

			function setUpPlan(plan){
				scope.newAccount.plan = scope.plans[plan];
				scope.currentStep = 2;
			}

			function selectAccountTemplate(template){
				resetSelectedTemplate();
				scope.newAccount.templateId = template._id;
				scope.currentStep = 3;
			}

			function completeActivation(){
				resetSelectedTemplate();
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

			function copyToClipboard(element) {
			  var $temp = $("<textarea>");
			  $("body").append($temp);
			  $temp.val($(element).text()).select();
			  document.execCommand("copy");
			  $temp.remove();
			}

            function getUsername() {
                activateAccountService.getOwnerUsername(function(username){
                    scope.username = username;
                });
            }
            getUsername();

            function getServerName() {
                var protocol = $location.protocol();
                var host = $location.host();
                var port = $location.port();

                scope.servername = protocol + '://' + host;
                if (port && port !== 80)
                    scope.servername += ':' + port;
            }
            getServerName();

            accountService(function (err, account) {
                scope.account = account;
            });

            function activateAccount() {
                //TODO: Load Spinner
                activateAccountService.activateAccount(scope.username, scope.newAccount.password, scope.newAccount.templateId, function(err, data){
                    //TODO: forward to welcome page
                });
            };
		}
	};
}]);
