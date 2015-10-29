'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('SimpleSiteBuilderService', SimpleSiteBuilderService);

	SimpleSiteBuilderService.$inject = ['$http', 'AccountService', 'WebsiteService'];
	/* @ngInject */
	function SimpleSiteBuilderService($http, AccountService, WebsiteService) {
		var ssbService = {};
		var baseWebsiteAPIUrl = '/api/1.0/cms/website/'; //TODO: upgrade to api/2.0 when ready
		var basePageAPIUrl = '/api/1.0/cms/page/';


		ssbService.getSite = getSite;
		ssbService.getPage = getPage;
		ssbService.savePage = savePage;
		ssbService.setActiveSection = setActiveSection;
		ssbService.activeSection = undefined;


		AccountService.getAccount(function(data) {
			ssbService.getSite(data.website.websiteId);
		});

		function setActiveSection(sectionIndex) {
			ssbService.activeSection = sectionIndex;
		}

		function getSite(id) {

			function success(data) {
				ssbService.website = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService getSite error: ' + error);
			}

			return $http.get(baseWebsiteAPIUrl + id).success(success).error(error);
		}

		function getPage(id) {

			return $http.get(basePageAPIUrl + id).success(successPage).error(errorPage);

		}

		function savePage(page) {

			return (
				$http({
					url: baseWebsiteAPIUrl + ssbService.website._id + '/page/' + page._id,
					method: 'POST',
					data: angular.toJson(page)
				}).success(successPage).error(errorPage)
			)

		}

		function successPage(data) {
			ssbService.page = data;
		}

		function errorPage(error) {
			console.error('SimpleSiteBuilderService page error: ' + error);
		}

		return ssbService;
	}

})();