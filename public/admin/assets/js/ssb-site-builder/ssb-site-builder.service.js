'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('SimpleSiteBuilderService', SimpleSiteBuilderService);

	SimpleSiteBuilderService.$inject = ['$http', '$q', '$timeout', 'AccountService', 'WebsiteService'];
	/* @ngInject */
	function SimpleSiteBuilderService($http, $q, $timeout, AccountService, WebsiteService) {
		var ssbService = {};
		var baseWebsiteAPIUrl = '/api/1.0/cms/website/';
		var basePageAPIUrl = '/api/1.0/cms/page/';
		var baseComponentAPIUrl = '/api/1.0/cms/component/';
        var baseTemplateAPIUrl = '/api/1.0/cms/template/';
        var baseWebsiteAPIUrlv2 = '/api/2.0/cms/websites/'
        var basePageAPIUrlv2 = '/api/2.0/cms/pages/';
        var baseTemplateAPIUrlv2 = '/api/2.0/cms/templates/';
        var baseThemesAPIUrlv2 = '/api/2.0/cms/themes/';
        var baseSectionAPIUrlv2 = '/api/2.0/cms/sections/';
        var baseComponentAPIUrlv2 = '/api/2.0/cms/components/';

		ssbService.getSite = getSite;
		ssbService.getPage = getPage;
		ssbService.getPages = getPages;
		ssbService.savePage = savePage;
		ssbService.saveWebsite = saveWebsite;
		ssbService.setActiveSection = setActiveSection;
		ssbService.setActiveComponent = setActiveComponent;
		ssbService.activeSectionIndex = undefined;
		ssbService.activeComponentIndex = undefined;
		ssbService.getPlatformSections = getPlatformSections;
		ssbService.getPlatformComponents = getPlatformComponents;
		ssbService.getComponent = getComponent;
		ssbService.getSection = getSection;
        ssbService.getUserSections   = getUserSections;
		ssbService.checkForDuplicatePage = checkForDuplicatePage;
		ssbService.loading = { value: 0 };
    	ssbService.getThemes = getThemes;
        ssbService.applyThemeToSite = applyThemeToSite;
        ssbService.createPage = createPage;
        ssbService.getTemplates = getTemplates;
        ssbService.getLegacyTemplates = getLegacyTemplates;
        ssbService.addSectionToPage = addSectionToPage;
        // ssbService.createPageFromTemplate = createPageFromTemplate;


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

			return ssbRequest($http.get(baseWebsiteAPIUrlv2 + id).success(success).error(error));
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

			return ssbRequest($http.get(basePageAPIUrlv2 + id).success(successPage).error(errorPage));

		}

		function savePage(page) {

			return (
				ssbRequest($http({
					url: basePageAPIUrlv2 + page._id,
					method: 'POST',
					data: angular.toJson(page)
				}).success(successPage).error(errorPage))
			)

		}

        function createPage(templateId) {

          return (
            ssbRequest($http({
              url: baseWebsiteAPIUrlv2 + ssbService.website._id + '/page/',
              method: 'POST',
              data: { templateId: templateId }
            }).success(successPage).error(errorPage))
          )

        }

		function successPage(data) {

			var page = transformComponentsToSections(data);
			ssbService.page = page;

		}

		function errorPage(error) {
			console.error('SimpleSiteBuilderService page error: ' + error);
		}

        function transformComponentsToSections(page) {
            /*
             *
             * Transform legacy pages to new section/component model format
             */
            if (page.components && page.components.length && !page.sections.length) {
                page.sections = angular.copy(page.components);
                for (var i = 0; i < page.sections.length; i++) {
                    var component = angular.copy(page.sections[i]);
                    var defaultSectionObj = {
                        layout: '1-col',
                        components: [component]
                    };

                    defaultSectionObj.name = sectionName(defaultSectionObj) + ' Section';

                    page.sections[i] = defaultSectionObj;

                }
                // delete page.components;
            }

            /*
            *
            * Name sections without a name (can be edited in UI)
            */
            for (var i = 0; i < page.sections.length; i++) {
                if (page.sections[i] && !page.sections[i].name) {
                  page.sections[i].name = sectionName(page.sections[i]) + ' Section';
                }
            }

            return page;
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
					url: baseWebsiteAPIUrlv2 + website._id,
					method: 'POST',
					data: angular.toJson(website)
				}).success(success).error(error))
			)

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

			var deferred = $q.defer();

			if (section.type.indexOf('ssb-') === -1) {
				getLegacySection(section, section.version).then(function(wrappedLegacyComponent){
					deferred.resolve(wrappedLegacyComponent);
				});
			} else {
                ssbRequest($http({
                    url: baseSectionAPIUrlv2 + section._id,
                    method: 'GET'
                }).success(success).error(error));
			}

			function success(data) {
                deferred.resolve(data);
				console.log('SimpleSiteBuilderService requested section: ' + data);
			}

			function error(error) {
                deferred.reject(error);
				console.error('SimpleSiteBuilderService section error: ' + error);
			}

			return ssbRequest(deferred.promise);

		}


        function sectionName(section) {
          var sectionName = section.layout;

          if (section.components) {
            if (section.components.length === 1 && section.components[0].header_title) {
              sectionName = section.components[0].header_title;
            } else if (section.components[0]) {
              sectionName = section.components[0].type;
            }
          }

          return sectionName;

        }

		function getLegacySection(section, version) {
			var sectionDefault = {
				"layout": "1-col",
				"txtcolor": undefined,
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
					"color": undefined
				},
				"visibility": true,
				"spacing": {
					"mt": "0",
					"ml": "0",
					"mr": "0",
					"mb": "0",
					"pt": "0",
					"pb": "0",
					"pl": "0",
					"pr": "0"
				}
			}

			return getComponent(section, version).then(function(component) {
				sectionDefault.components = [component.data];

                sectionDefault.name = sectionName(sectionDefault);

                if (!sectionDefault.spacing) {
                    sectionDefault.spacing = {
                        "mt": "0",
                        "ml": "0",
                        "mr": "0",
                        "mb": "0",
                        "pt": "0",
                        "pb": "0",
                        "pl": "0",
                        "pr": "0"
                    }
                }

				return sectionDefault;
			});
		}

		function getPlatformSections() {

			function success(data) {
                ssbService.platformSections = data;
				console.log('SimpleSiteBuilderService requested getPlatformSections: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService getPlatformSections error: ' + error);
			}

			return (ssbRequest($http({
                url: baseSectionAPIUrlv2 + 'platform',
                method: 'GET'
            }).success(success).error(error)));

		}

        function getUserSections() {

            function success(data) {
                ssbService.userSections = data;
                console.log('SimpleSiteBuilderService getUserSections: ' + data);
            }

            function error (error) {
                console.error('SimpleSiteBuilderService getUserSections error: ' + error);
            }

            return (ssbRequest($http({
                url: baseSectionAPIUrlv2 + 'user',
                method: 'GET'
            }).success(success).error(error)));

        }

		function getPlatformComponents() {

            function success(data) {
                console.log('Success from call to 2.0 get components', data);
                var ret = [];
                data.forEach(function(cmp) {
                    ret.push(getComponent(cmp));
                });

                $q.all(ret).then(function(data){
                    ssbService.platformComponents = data.map(function(component) {
                        return component.data;
                    });
                });
            }
            function error(error) {
                console.error('SimpleSiteBuilderService getPlatformComponents error: ' + error);
            }

            return (
                    ssbRequest($http({
                        url: baseComponentAPIUrlv2,
                        method: 'GET'
                    }).success(success).error(error))
                );
		}

		function getThemes() {

			function success(data) {
				console.log('SimpleSiteBuilderService requested themes: ' + data);
                ssbService.themes = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService themes error: ' + error);
			}

            return (
                ssbRequest($http({
                    url: baseThemesAPIUrlv2,
                    method: 'GET',
                }).success(success).error(error))
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
                ssbRequest($http({
					url: baseWebsiteAPIUrl + ssbService.website._id + '/page/' + pageHandle,
					method: 'GET',
				}).success(success).error(error))
			)

		}

        function getTemplates() {

          function success(data) {
            ssbService.templates = data;
            console.log('SimpleSiteBuilderService getTemplates: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService getTemplates error: ' + error);
          }

          return (
            ssbRequest($http({
              url: baseTemplateAPIUrlv2,
              method: 'GET',
            }).success(success).error(error))
          )

        }

        function getLegacyTemplates() {

          function success(data) {
            ssbService.legacyTemplates = data;
            console.log('SimpleSiteBuilderService getLegacyTemplates: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService getLegacyTemplates error: ' + error);
          }

          return (
            ssbRequest($http({
              url: baseTemplateAPIUrl,
              method: 'GET',
            }).success(success).error(error))
          )

        }

        function addSectionToPage(section, version, modalInstance) {

            if (!ssbService.page.sections) {
                ssbService.page.sections = [];
            }

            var numSections = ssbService.page.sections.length;

            return (
                ssbService.getSection(section, version || 1).then(function(response) {
                    ssbService.page.sections.push(response);
                    ssbService.setActiveSection(numSections);
                    ssbService.setActiveComponent(null);
                    modalInstance.close();
                })
            )

        }

        function applyThemeToSite(theme) {
            // Load web font loader
            if (theme.name && theme.name !== 'Default') {
                WebFont.load({
                    google: {
                        families: [theme.defaultFontStack.split(',')[0].replace(/"/g, '')]
                    }
                });
                window.WebFontConfig = {
                    active: function() {
                        sessionStorage.fonts = true;
                    }
                }
            }

            ssbService.website.themeId = theme._id;
            ssbService.website.theme = theme;
            ssbService.website.themeOverrides = theme;
        }

        // function createPageFromTemplate(template) {
        //   //       $scope.validateCreatePage(page, true);

        //   // $scope.titleError = false;
        //   // $scope.handleError = false;
        //   // if (!$scope.createPageValidated) {
        //   //   $scope.titleError = true;
        //   //   $scope.handleError = true;
        //   //   $scope.saveLoading = false;
        //   //   return false;
        //   // }

        //   // if ($scope.createpage.homepage)
        //   //   page.handle = 'index';

        //   // var pageData = {
        //   //   title: page.title,
        //   //   handle: page.handle,
        //   //   mainmenu: page.mainmenu
        //   // };


        //   // var hasHandle = false;
        //   // _.each($scope.pages, function (_page) {
        //   //   if (_page.handle === page.handle) {
        //   //     hasHandle = true;
        //   //   }
        //   // });

        //   // function createPageCallback(_newPage, error) {
        //   //   if(error && !_newPage) {
        //   //     toaster.pop('error', error.message);
        //   //     $event.preventDefault();
        //   //     $event.stopPropagation();
        //   //     $scope.saveLoading = false;
        //   //     return;
        //   //   }
        //   //   var newpage = angular.copy(_newPage);
        //   //   toaster.pop('success', 'Page Created', 'The ' + newpage.title + ' page was created successfully.');
        //   //   $scope.minRequirements = true;
        //   //   $scope.saveLoading = false;
        //   //   if(newpage.handle == 'index'){
        //   //     $scope.createpage.showhomepage = false;
        //   //   }
        //   //   $scope.closeModal();

        //   //   // if (newpage.components) {
        //   //   //   newpage.components = newpage.components.length;
        //   //   // } else if (newpage.sections) {
        //   //   //   newpage.sections = newpage.sections.length;
        //   //   // }


        //   //   $scope.pages.unshift(newpage);
        //   //   $scope.displayedPages.unshift(newpage);
        //   //   page.title = "";
        //   //   page.handle = "";
        //   //   $scope.checkAndSetIndexPage($scope.pages);
        //   //   $scope.resetTemplateDetails();

        //   //   $scope.viewSimpleSiteBuilder(newpage);
        //   // }


        // // if (page.ssb) {

        //   // WebsiteService.getWebsite(function(data) {
        //     ssbService.createPage(template._id).then(function(data) {
        //       $scope.closeModal();
        //       $scope.viewSimpleSiteBuilder(data.data);
        //     });
        //   // });

        // }


		(function init() {

			AccountService.getAccount(function(data) {
				ssbService.websiteId = data.website.websiteId;
                ssbService.getSite(data.website.websiteId).then(function() {
                    ssbService.getThemes().then(function(themes) {
                        var theme = themes.data.filter(function(t) { return t._id === ssbService.website.themeId })[0] || {};
                        ssbService.applyThemeToSite(theme);
                    });
                });
                ssbService.getPages();
                ssbService.getTemplates();
                ssbService.getLegacyTemplates();
                ssbService.getPlatformSections();
				ssbService.getUserSections();
			});

		})();


		return ssbService;
	}

})();
