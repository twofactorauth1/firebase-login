/*global app, angular, window,Fingerprint,CryptoJS,document,console, $*/
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('activateAccountComponent', ['$sce', '$modal', '$location', 'accountService', 'activateAccountService', function ($sce, $modal, $location, accountService, activateAccountService) {
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
            scope.errorMessage = "";

            accountService(function (err, account) {
                scope.account = account;
                if(scope.account.oem == true){
                    scope.totalSteps = 1;
                    scope.currentStep = 3;
                    scope.newAccount = {

                    }
                }
                else{
                    scope.totalSteps = 3;
                    scope.currentStep = 1;
                    scope.newAccount = {
                        plan: scope.plans.NEW
                    };
                }
            });

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
					templateImageUrl: "https://s3.amazonaws.com/indigenous-digital-assets/test_account_2715/Tessco_content_png_1508233372188"
				},
				{
					_id: 2,
					templateImageUrl: "https://s3.amazonaws.com/indigenous-digital-assets/test_account_2715/Tessco_content_png_1508233372188"
				},
				{
					_id: 3,
					templateImageUrl: "https://s3.amazonaws.com/indigenous-digital-assets/test_account_2715/Tessco_content_png_1508233372188"
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

            function generateTemplateUrl(template){
                var windowHostname = window.location.hostname;
                var hostname = "";
                if (windowHostname.indexOf(".local") > -1 || windowHostname.indexOf(".test.") > -1) {
                    hostname = template.subdomain + '.test.leadsource.cc';
                } else {
                    hostname = template.subdomain + '.leadsource.cc';
                }
                return $sce.trustAsResourceUrl("//" + hostname);
            }

			function previewTemplate(template){
				scope.selectedTemplate = template;
				scope.showPreview = true;
                scope.frameSrc = generateTemplateUrl(template);
			}

			function backToTemplates(){
				resetSelectedTemplate();
			}

			function resetSelectedTemplate(){
                scope.frameSrc = "";
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

            

            function activateAccount() {
                //TODO: Load Spinner
                scope.loading = true;
                scope.errorMessage = "";
                activateAccountService.activateAccount(scope.username, scope.newAccount.password, scope.newAccount.templateId, function(err, data){
                    scope.loading = false;
                    if(err){
                        if(err.message){
                            scope.errorMessage = err.message;
                        }
                        else{
                            scope.errorMessage = "Error while activating account";
                        }
                    }
                    else{
                        scope.currentStep = 4;
                        scope.account.accountUrl = scope.account.accountUrl.replace("indigenous.io", "leadsource.cc");
                        scope.siteurl = scope.account.accountUrl;
                        scope.accountUrl = scope.account.accountUrl + "/login";
                    }
                    
                });
            };

            function loadTemplates() {
                activateAccountService.getAccountTemplates(function(data){
                    if(data) {
                        scope.templates = data;                        
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
