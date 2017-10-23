/*global app, angular, window,Fingerprint,CryptoJS,document,console, $*/
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('activateAccountComponent', ['$filter', '$timeout', '$modal', '$location', 'accountService', 'activateAccountService', function ($filter, $timeout, $modal, $location, accountService, activateAccountService) {
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
            scope.backToPrevStep = backToPrevStep;
            scope.openModal = openModal;
            scope.closeModal = closeModal;
            scope.sendEmailToDevs = sendEmailToDevs;
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
                scope.loading = true;
                activateAccountService.activateAccount(scope.username, scope.newAccount.password, scope.newAccount.templateId, function(err, data){
                    scope.loading = false;
                    scope.currentStep = 4;
                    scope.siteurl = scope.account.accountUrl;
                    scope.accountUrl = scope.account.accountUrl + "/admin";
                });
            };

            function loadTemplates() {
                activateAccountService.getAccountTemplates(function(data){
                    if(data) {
                        scope.templates = [];
                        _.each(data, function(accountTemplate){
                            scope.templates.push({_id:accountTemplate._id, previewUrl:accountTemplate.templateImageUrl});
                        });
                    }
                });
            }

            function openModal(template) {
                scope.modalInstance = $modal.open({
                    templateUrl: template,
                    keyboard: true,
                    size: 'lg',
                    scope: scope
                });
            };

            function closeModal() {
                scope.modalInstance.close();
            };

            function sendEmailToDevs(emailTo){
            	var script = $(".pre-wrap-script").html();
            	activateAccountService.sendEmailToDevs(script, emailTo, function(){
                    closeModal();
                })
            }

            function backToPrevStep(){
            	if(scope.currentStep == 1){
            		$location.path("/activate");
            	}
            	else{
            		scope.currentStep = scope.currentStep - 1;
            	}
            }
            loadTemplates();
		}
	};
}]);
