'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('SimpleSiteBuilderService', SimpleSiteBuilderService);

	SimpleSiteBuilderService.$inject = ['$http', '$q', '$timeout', 'AccountService', 'WebsiteService'];
	/* @ngInject */
	function SimpleSiteBuilderService($http, $q, $timeout, AccountService, WebsiteService) {
		var ssbService = {};
		var baseWebsiteAPIUrl = '/api/1.0/cms/website/'; //TODO: upgrade to api/2.0 when ready
		var basePageAPIUrl = '/api/1.0/cms/page/';
		var baseComponentAPIUrl = '/api/1.0/cms/component/';


		ssbService.getSite = getSite;
		ssbService.getPage = getPage;
		ssbService.getPages = getPages;
		ssbService.savePage = savePage;
		ssbService.saveWebsite = saveWebsite;
		ssbService.setActiveSection = setActiveSection;
		ssbService.setActiveComponent = setActiveComponent;
		ssbService.activeSectionIndex = undefined;
		ssbService.activeComponentIndex = undefined;
		ssbService.getSystemComponents = getSystemComponents;
		ssbService.getComponent = getComponent;
		ssbService.getSection = getSection;
		ssbService.checkForDuplicatePage = checkForDuplicatePage;
		ssbService.loading = { value: 0 };
		ssbService.getTemplates = getTemplates;
		

		function ssbRequest(fn) {
			// return $timeout(function() {
				ssbService.loading.value = ssbService.loading.value + 1;
				console.info('service | loading +1 : ' + ssbService.loading.value);
				fn.finally(function() {
					ssbService.loading.value = ssbService.loading.value - 1;
					console.info('service | loading -1 : ' + ssbService.loading.value);
				})
				return fn;
			// }, 0);
		}

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

			return ssbRequest($http.get(baseWebsiteAPIUrl + id).success(success).error(error));
		}

		function getPages(id) {

			function success(data) {
				ssbService.pages = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService getPages error: ' + error);
			}

			return ssbRequest($http.get(baseWebsiteAPIUrl + ssbService.websiteId + '/pages').success(success).error(error));
		}

		function getPage(id) {

			return ssbRequest($http.get(basePageAPIUrl + id).success(successPage).error(errorPage));

		}

		function savePage(page) {

			return (
				ssbRequest($http({
					url: baseWebsiteAPIUrl + ssbService.website._id + '/page/' + page._id,
					method: 'POST',
					data: angular.toJson(page)
				}).success(successPage).error(errorPage))
			)

		}

		function successPage(data) {

			/*
			 *
			 * Transform legacy pages to new section/component model format
			 */
			if (data.components.length && !data.sections.length) {
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

		function saveWebsite(website) {
			
			function success(data) {
				ssbService.website = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService saveWebsite error: ' + error);
			}

			return (
				ssbRequest($http({
					url: baseWebsiteAPIUrl,
					method: 'POST',
					data: angular.toJson(website)
				}).success(success).error(error))
			)

		}

		function getSystemSections() {
			return [
				{
				    layout: '1-col',
				    componenents: []
				}
			 ];
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

		//TODO: component versions
		function getComponent(component, version) {

			function success(data) {
				console.log('SimpleSiteBuilderService requested component: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService component error: ' + error);
			}

			return (
				ssbRequest($http({
					url: baseComponentAPIUrl + component.type,
					method: "POST",
					data: angular.toJson({
						version: version
					})
				}).success(success).error(error))
			)

		}

		//TODO: api implement
		function getSection(section, version) {

			// var tempSection = {
			// 	"layout": "1-col",
			// 	"txtcolor": "",
			// 	"bg": {
			// 		"color": "",
			// 		"opacity": 0.5,
			// 		"img": {
			// 		"show": true,
			// 		"overlay": true,
			// 		"overlaycolor": "#26a65b",
			// 		"overlayopacity": 40
			// 	},
			// 	"visibility": true,
			// 	"spacing": {
			// 		"mt": "0",
			// 		"ml": "0",
			// 		"mr": "0",
			// 		"mb": "0",
			// 		"pt": "10",
			// 		"pb": "10",
			// 		"pl": "10",
			// 		"pr": "10"
			// 	}
			// }

			function success(data) {
				console.log('SimpleSiteBuilderService requested section: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService section error: ' + error);
			}

			var deferred = $q.defer();
			deferred.resolve(section);
			return ssbRequest(deferred.promise);

		}

		//TODO: api implement
		function getSections() {

			var tempSection = {
				"name": "3 Column Text",
				"layout": "3-col",
				"components": [{
					"_id": "c72f4759-fcae-4fb6-a2a2-b0790a7b2742",
					"anchor": "c72f4759-fcae-4fb6-a2a2-b0790a7b2742",
					"type": "text",
					"version": 1,
					"txtcolor": "#000000",
					"text": "<p><span style=\"\">Some Text</span></p><p><span style=\"\"></span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.</p>",
					"bg": {
						"img": {
							"url": "",
							"width": null,
							"height": null,
							"parallax": false,
							"blur": false,
							"overlay": false,
							"show": false
						},
						"color": "#FFFFFF"
					},
					"visibility": true,
					"spacing": {
						"mt": "0",
						"ml": "0",
						"mr": "0",
						"mb": "0",
						"pt": "20",
						"pb": "20",
						"pl": "20",
						"pr": "20"
					}
				},
				{
					"_id": "c72f4759-1234-4fb6-a2a2-b0790a7b2742",
					"anchor": "c72f4759-1234-4fb6-a2a2-b0790a7b2742",
					"type": "text",
					"version": 1,
					"txtcolor": "#000000",
					"text": "<p><span style=\"\">Some Text</span></p><p><span style=\"\"></span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.</p>",
					"bg": {
						"color": "#FFFFFF",
						"opacity": 1,
						"img": {
							"url": "",
							"width": null,
							"height": null,
							"parallax": false,
							"blur": false,
							"overlay": false,
							"show": false
						},
					},
					"visibility": true,
					"spacing": {
						"mt": "0",
						"ml": "0",
						"mr": "0",
						"mb": "0",
						"pt": "20",
						"pb": "20",
						"pl": "20",
						"pr": "20"
					}
				},
				{
					"_id": "5a9adc3a-027d-4e87-a114-946986478f45",
					"anchor": "5a9adc3a-027d-4e87-a114-946986478f45",
					"type": "text",
					"version": 1,
					"txtcolor": "#000000",
					"text": "<p><span style=\"\">Some Text</span></p><p><span style=\"\"></span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.</p>",
					"bg": {
						"color": "#FFFFFF",
						"opacity": 1,
						"img": {
							"url": "",
							"width": null,
							"height": null,
							"parallax": false,
							"blur": false,
							"overlay": false,
							"show": false
						},
					},
					"visibility": true,
					"spacing": {
						"mt": "0",
						"ml": "0",
						"mr": "0",
						"mb": "0",
						"pt": "20",
						"pb": "20",
						"pl": "20",
						"pr": "20"
					}
				}],
				"txtcolor": "#000000",
				"bg": {
					"color": "#FFFFFF",
					"opacity": 1,
					"img": {
						"url": "",
						"width": null,
						"height": null,
						"parallax": false,
						"blur": false,
						"overlay": false,
						"show": false
					},
				},
				"visibility": true,
				"spacing": {
					"mt": "0",
					"ml": "0",
					"mr": "0",
					"mb": "0",
					"pb": "0",
					"pl": "0",
					"pr": "0",
					"pt": "0"
				}
			}

			function success(data) {
				console.log('SimpleSiteBuilderService requested section: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService section error: ' + error);
			}

			var deferred = $q.defer();
			deferred.resolve(section);
			return ssbRequest(deferred.promise);

		}

		//TODO: api implement
		function getTemplates() {
			
			var tempTemplates = [{
				_id: '11032028',
				name: 'Default',
				styles: {
					headerBackgroundColor: '#FFFFFF',
					bodyBackgroundColor: '#FFFFFF',
					primaryTextColor: '#000000',
					primaryBtnColor: '#50c7e8',
					headingSize: '16px',
					paragraphSize: '12px'
				},
				headingFontStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
				paragraphFontStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
				defaultSections: [{
					//
				}]
			},
			{
				_id: '96751783',
				name: 'Music - Soft',
				styles: {
					headerBackgroundColor: '#99CCCC',
					bodyBackgroundColor: '#E8E7E7',
					primaryTextColor: '#000000',
					primaryBtnColor: '#000000',
					headingSize: '16px',
					paragraphSize: '12px'
				},
				font: 'Roboto Regular',
				defaultSections: [{
					//
				}]
			}];

			function success(data) {
				console.log('SimpleSiteBuilderService requested templates: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService templates error: ' + error);
			}

			var deferred = $q.defer();
			deferred.resolve(tempTemplates);
			return ssbRequest(deferred.promise);

		}
		
		function checkForDuplicatePage(pageHandle) {
			
			function success(data) {
				console.log('SimpleSiteBuilderService checkForDuplicatePage: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService checkForDuplicatePage error: ' + error);
			}

			return (
          		ssbRequest($http({
					url: baseWebsiteAPIUrl + ssbService.website._id + '/page/' + pageHandle,
					method: 'GET',
				}).success(success).error(error))
			)

		}

		function getUserSections() {
			return [];
		}


		(function init() {

			AccountService.getAccount(function(data) {
				ssbService.websiteId = data.website.websiteId;
				ssbService.getSite(data.website.websiteId);
			});

		})();


		return ssbService;
	}

})();