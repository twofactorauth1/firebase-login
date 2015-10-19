'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('SimpleSiteBuilderService', SimpleSiteBuilderService);

	SimpleSiteBuilderService.$inject = ['$http', 'AccountService'];

	function SimpleSiteBuilderService($http, AccountService) {
		var ssbService = {};
		var baseUrl = '/api/1.0/cms/website/'; //TODO: upgrade to api/2.0 when ready


		ssbService.getSite = getSite;
		ssbService.getActiveSection = getActiveSection;


		AccountService.getAccount(function(data) {
			ssbService.getSite(data.website.websiteId);
		});


		function getActiveSection() {

			return {
				_id: 1234,
				name: 'SomeComponentName'
			}

		}

		function getSite(id) {

			function success(data) {
				ssbService.website = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService getSite error');
			}

			return $http.get(baseUrl + id).success(success).error(error);
		}



		return ssbService;
	}

})();