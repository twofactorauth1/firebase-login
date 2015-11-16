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
		var baseComponentAPIUrl = '/api/1.0/cms/component/';


		ssbService.getSite = getSite;
		ssbService.getPage = getPage;
		ssbService.getPages = getPages;
		ssbService.savePage = savePage;
		ssbService.setActiveSection = setActiveSection;
		ssbService.setActiveComponent = setActiveComponent;
		ssbService.activeSectionIndex = undefined;
		ssbService.activeComponentIndex = undefined;
		ssbService.getSystemComponents = getSystemComponents;
		ssbService.getComponent = getComponent;
		ssbService.checkForDuplicatePage = checkForDuplicatePage;


		AccountService.getAccount(function(data) {
			ssbService.getSite(data.website.websiteId);
		});

		function setActiveSection(sectionIndex) {
			ssbService.activeSectionIndex = sectionIndex;
		}

		function setActiveComponent(componentIndex) {
			ssbService.activeComponentIndex = componentIndex;
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

		function getPages(id) {

			function success(data) {
				ssbService.pages = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService getPages error: ' + error);
			}

			return $http.get(baseWebsiteAPIUrl + ssbService.website._id + '/pages').success(success).error(error);
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

			/*
			 *
			 * Transform legacy pages to new section/component model format
			 * TODO: think about moving this to API?
			 */
			if (data.components.length) {
				data.sections = angular.copy(data.components);
				for (var i = 0; i < data.sections.length; i++) {
					var component = angular.copy(data.sections[i]);
					var defaultSectionObj = {
						layout: '1-col',
						components: [component]
					};
					data.sections[i] = defaultSectionObj;

				}
				delete data.components;
			}

			ssbService.page = data;
		}

		function errorPage(error) {
			console.error('SimpleSiteBuilderService page error: ' + error);
		}

		function saveWebsite(page) {
			
			function success(data) {
				ssbService.website = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService saveWebsite error: ' + error);
			}

			return (
				$http({
					url: baseWebsiteAPIUrl + ssbService.website._id,
					method: 'POST',
					data: angular.toJson(website)
				}).success(success).error(error)
			)

		}

		//TODO: make actual API call
		function getSystemComponents() {
			return [
				{
				    title: 'Text Block',
				    type: 'text-only',
				    preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/text-block.jpg',
				    filter: 'text',
				    description: 'A full width component for a large volume of text. You can also add images within the text.',
				    enabled: true
				}
			 ];
		}

		function getComponent(component, version) {

			function success(data) {
				console.log('SimpleSiteBuilderService requested component: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService component error: ' + error);
			}

			return (
				$http({
					url: baseComponentAPIUrl + component.type,
					method: "POST",
					data: angular.toJson({
						version: version
					})
				}).success(success).error(error)
			)

		}
		
		function checkForDuplicatePage(pageHandle) {
			
			function success(data) {
				console.log('SimpleSiteBuilderService checkForDuplicatePage: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService checkForDuplicatePage error: ' + error);
			}

			return (
          		$http({
					url: baseWebsiteAPIUrl + ssbService.website._id + '/page/' + pageHandle,
					method: 'GET',
				}).success(success).error(error)
			)

		}

		function getUserSections() {
			return [];
		}



		return ssbService;
	}

})();