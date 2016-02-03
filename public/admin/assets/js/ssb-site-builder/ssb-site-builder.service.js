'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('SimpleSiteBuilderService', SimpleSiteBuilderService);

	SimpleSiteBuilderService.$inject = ['$rootScope', '$http', '$q', '$timeout', 'AccountService', 'WebsiteService', '$modal'];
	/* @ngInject */
	function SimpleSiteBuilderService($rootScope, $http, $q, $timeout, AccountService, WebsiteService, $modal) {
		var ssbService = {};
		var baseWebsiteAPIUrl = '/api/1.0/cms/website/';
		var basePageAPIUrl = '/api/1.0/cms/page/';
		var baseComponentAPIUrl = '/api/1.0/cms/component/';
        var baseTemplateAPIUrl = '/api/1.0/cms/template/';
        var baseWebsiteAPIUrlv2 = '/api/2.0/cms/websites/'
        var basePageAPIUrlv2 = '/api/2.0/cms/pages/';
        var baseTemplateAPIUrlv2 = '/api/2.0/cms/templates/';
        var baseSiteTemplateAPIUrlv2 = '/api/2.0/cms/sitetemplates/';
        var baseThemesAPIUrlv2 = '/api/2.0/cms/themes/';
        var baseSectionAPIUrlv2 = '/api/2.0/cms/sections/';
        var baseComponentAPIUrlv2 = '/api/2.0/cms/components/';
        var basePagesWebsiteAPIUrl = '/api/2.0/cms/website/';

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
    	ssbService.setupTheme = setupTheme;
        ssbService.applyThemeToSite = applyThemeToSite;
        ssbService.createPage = createPage;
        ssbService.createDuplicatePage = createDuplicatePage;
        ssbService.getTemplates = getTemplates;
        ssbService.getSiteTemplates = getSiteTemplates;
        ssbService.setSiteTemplate = setSiteTemplate;
        ssbService.getTemplateById = getTemplateById;
        ssbService.getLegacyTemplates = getLegacyTemplates;
        ssbService.addSectionToPage = addSectionToPage;
        ssbService.getSpectrumColorOptions = getSpectrumColorOptions;
        ssbService.deletePage = deletePage;
        ssbService.openMediaModal = openMediaModal;
        ssbService.setMediaForComponent = setMediaForComponent;
        ssbService.getPagesWithSections = getPagesWithSections;
        ssbService.extendComponentData = extendComponentData;

        ssbService.contentComponentDisplayOrder = [];

        /*
         * This represents the category sorting for the add content panel
         */
        ssbService.contentSectionDisplayOrder = [
            'welcome & landing',
            'images',
            'text',
            'video',
            'mixed content',
            'about us',
            'products & services',
            'clients',
            'team',
            'testimonials',
            'contact us',
            'blog',
            'features',
            'navigation',
            'forms',
            'social',
            'misc'
        ];


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

		function getSite(id, isLoading) {

			function success(data) {
                if(!isLoading)
				    ssbService.website = data;
                else{
                    ssbService.setupTheme(data);
                }
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

        function getPagesWithSections() {

            function success(data) {
                 console.log('SimpleSiteBuilderService getPages');
            }

            function error(error) {
                console.error('SimpleSiteBuilderService getPages error: ' + error);
            }

            return ssbRequest($http.get(basePagesWebsiteAPIUrl + ssbService.websiteId + '/pages').success(success).error(error));
        }

		function getPage(id, isSettings) {
            function success(data) {
                console.log('SimpleSiteBuilderService requested page data' + data);
            }

			return ssbRequest($http.get(basePageAPIUrlv2 + id).success(
                isSettings ? success : successPage)
            .error(errorPage));
		}

		function savePage(page, isSettings) {
            function success(data) {
                if(ssbService.pages && ssbService.pages[page.handle] && data.title){
                    ssbService.pages[page.handle].title = data.title;
                }
                console.log('SimpleSiteBuilderService requested page settings saved' + data);
            }
            if(!isSettings)
                page.ssb = true;
			return (
				ssbRequest($http({
					url: basePageAPIUrlv2 + page._id,
					method: 'POST',
					data: angular.toJson(page)
				}).success(isSettings ? success : successPage).error(errorPage))
			)
		}

        function deletePage(page) {
            function success(data) {
                console.log('SimpleSiteBuilderService requested page deleted');
                delete ssbService.pages[page.handle];
            }

            function error(error) {
                console.error('SimpleSiteBuilderService page delete error: ' + error);
            }

            return (
                ssbRequest($http({
                    url: basePageAPIUrlv2 + page._id,
                    method: 'DELETE',
                    data: angular.toJson(page)
                }).success(success).error(error))
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

        function createDuplicatePage(page) {
            function success(data) {
                console.log('SimpleSiteBuilderService requested page created');
            }

            function error(error) {
                console.error('SimpleSiteBuilderService page error: ' + error);
            }
            return (
                ssbRequest($http({
                  url: baseWebsiteAPIUrlv2 + ssbService.website._id + '/duplicate/page/',
                  method: 'POST',
                  data: angular.toJson(page)
                }).success(success).error(error))
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
                        components: [component],
                        visibility: true
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

            if (!version) {
                version = 1;
            }

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

        function getSiteTemplates() {

          function success(data) {
            ssbService.siteTemplates = data;
            console.log('SimpleSiteBuilderService getSiteTemplates: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService getSiteTemplates error: ' + error);
          }

          return (
            ssbRequest($http({
              url: baseSiteTemplateAPIUrlv2,
              method: 'GET',
            }).success(success).error(error))
          )

        }

        function setSiteTemplate(siteTemplate) {

            function success(data) {
                console.log('SimpleSiteBuilderService setSiteTemplate: ' + data);
            }

            function error(error) {
                console.error('SimpleSiteBuilderService setSiteTemplate error: ' + error);
            }

            return (
                ssbRequest($http({
                    url: baseWebsiteAPIUrlv2 + ssbService.website._id + '/sitetemplates/' + siteTemplate._id,
                    method: 'POST',
                    data: {
                        siteTemplateId: siteTemplate._id,
                        siteThemeId: siteTemplate.defaultTheme
                    }
                }).success(success).error(error))
            )
        }

        function getTemplateById(id) {

          return _.where(ssbService.templates, {
            _id: id
          });

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

        function addSectionToPage(section, version, replaceAtIndex, oldSection) {
            var insertAt;
            var numSections;
            var hasHeader = false;
            var hasFooter = false;

            if (!ssbService.page.sections) {
                ssbService.page.sections = [];
            } else {
                hasHeader = pageHasHeader(ssbService.pages.sections);
                hasFooter = pageHasFooter(ssbService.page.sections);
                console.debug(hasFooter);
            }

            numSections = ssbService.page.sections.length;

            insertAt = hasFooter ? numSections - 1 : numSections;

            return (
                ssbService.getSection(section, version || 1).then(function(response) {
                    if (response) {

                        if (replaceAtIndex) {
                            var extendedData = ssbService.extendComponentData(oldSection, response);
                            ssbService.setActiveSection(null);
                            ssbService.page.sections.splice(replaceAtIndex, 1, extendedData);
                            ssbService.setActiveSection(replaceAtIndex);
                            ssbService.setActiveComponent(null);
                        } else {
                            ssbService.page.sections.splice(insertAt, 0, response);
                            ssbService.setActiveSection(insertAt);
                            ssbService.setActiveComponent(null);
                        }

                    } else {
                        console.error("Error loading section/component:", section);
                    }
                })
            )

        }

        /*
         * extendComponentData
         * - extend authored data onto new components
         * - match component order of newSection
         * - omit keys we don't want transfered
         *
         * @param {} oldSection - section being replaced
         * @param {} newSection - section from server
         *
         * @returns {*} newSection with any authored data
         *
         */
        function extendComponentData(oldSection, newSection) {

            var keysToOmit = ['$$hashKey', '_id', 'anchor', 'accountId', 'version', 'type', 'layout', 'spacing'];
            var newComponents = angular.copy(newSection.components);
            var newComponentsOrder = _.invert(_.object(_.pairs(_.pluck(newComponents, 'type')))); // ['componentType1', 'componentType2', ...]
            var oldComponents = _(angular.copy(oldSection.components)).chain()

                                    .sortBy(function(x) { // sort by order of newComponents
                                        return newComponentsOrder[x.type] && parseInt(newComponentsOrder[x.type], 10)
                                    })

                                    .value(); // return the new array

            delete newSection.components;
            delete oldSection.components;

            newSection.components = _.map(newComponents, function(c, index) {
                return $.extend({}, c, _.omit(oldComponents[index], keysToOmit));
            });

            return $.extend({}, newSection, _.omit(oldSection, keysToOmit));

        }

        /*
         * Determine if page has a header
         * - TODO: implement if needed
         *
         *
         */
        function pageHasHeader(sections) {
            return false
        }

        /*
         * Determine if page has a footer
         *
         *
         *
         */
        function pageHasFooter(sections) {
            var hasSectionFooter = false;
            var hasComponentFooter = false;
            var match = _.filter(sections, function(s){

                if (s.name && s.components) {
                    hasSectionFooter = s.name.toLowerCase() === 'footer';
                    hasComponentFooter = _.where(s.components, { type: 'footer' }).length !== 0;
                }

                return hasSectionFooter || hasComponentFooter

            });

            return match.length !== 0
        }

        /*
         * setup Theme
         *
         * - get latest theme data based on website's themeId
         *
         */
        function setupTheme(website) {
            var _website = website || ssbService.website;
            return ssbService.getThemes().then(function(themes) {
                var theme = themes.data.filter(function(t) { return t._id === _website.themeId })[0] || {};
                var defaultTheme;

                if (theme._id) {
                    ssbService.applyThemeToSite(theme, true, _website);
                } else {
                    defaultTheme = themes.data.filter(function(t) { return t.handle === 'default' })[0] || {};
                    ssbService.applyThemeToSite(defaultTheme, false, _website);
                    _website.themeId = defaultTheme._id;
                    ssbService.saveWebsite(_website);
                }
                $timeout(function() {
                    ssbService.website = _website;
                }, 100);
            });
        }

        /*
         * Apply theme fonts, styles and default themeoverrides for theme
         *
         * @param theme - theme obj
         * @param keepCurrentOverrides - when not changing themes, should not set new themeOverrides
         *
         */
        function applyThemeToSite(theme, keepCurrentOverrides, website) {
            // Load web font loader

                var _website = website || ssbService.website;
                var unbindWatcher = $rootScope.$watch(function() {
                    return angular.isDefined(window.WebFont);
                }, function(newValue, oldValue) {
                    if (newValue) {
                        var defaultFamilies = ["Roboto", "Oswald", "Montserrat", "Open+Sans+Condensed"];
                        if (theme.name && theme.hasCustomFonts) {
                          var _fontStack = theme.defaultFontStack.split(',')[0].replace(/"/g, '');
                          if(defaultFamilies.indexOf(_fontStack) === -1)
                            defaultFamilies.push(_fontStack);
                        }
                        window.WebFont.load({
                            google: {
                                families: defaultFamilies
                            }
                        });
                        unbindWatcher();
                    }
                });

                window.WebFontConfig = {
                    active: function() {
                        sessionStorage.fonts = true;
                    }
                }


            _website.themeId = theme._id;
            _website.theme = theme;

            if (keepCurrentOverrides === undefined || !angular.isDefined(_website.themeOverrides.styles)) {
                $timeout(function() {
                    _website.themeOverrides = theme;
                });
            }

        }

        function getSpectrumColorOptions() {
            return {
                showPalette: true,
                clickoutFiresChange: true,
                showInput: true,
                showButtons: true,
                allowEmpty: true,
                hideAfterPaletteSelect: false,
                showPaletteOnly: false,
                togglePaletteOnly: true,
                togglePaletteMoreText: 'more',
                togglePaletteLessText: 'less',
                preferredFormat: 'hex',
                appendTo: 'body',
                palette: [
                  ["#C91F37", "#DC3023", "#9D2933", "#CF000F", "#E68364", "#F22613", "#CF3A24", "#C3272B", "#8F1D21", "#D24D57"],
                  ["#f47998", "#F47983", "#DB5A6B", "#C93756", "#FCC9B9", "#FFB3A7", "#F62459", "#F58F84", "#875F9A", "#5D3F6A"],
                  ["#89729E", "#763568", "#8D608C", "#A87CA0", "#5B3256", "#BF55EC", "#8E44AD", "#9B59B6", "#BE90D4", "#4D8FAC"],
                  ["#5D8CAE", "#22A7F0", "#19B5FE", "#59ABE3", "#48929B", "#317589", "#89C4F4", "#4B77BE", "#1F4788", "#003171"],
                  ["#044F67", "#264348", "#7A942E", "#8DB255", "#5B8930", "#6B9362", "#407A52", "#006442", "#87D37C", "#26A65B"],
                  ["#26C281", "#049372", "#2ABB9B", "#16A085", "#36D7B7", "#03A678", "#4DAF7C", "#D9B611", "#F3C13A", "#F7CA18"],
                  ["#E2B13C", "#A17917", "#F5D76E", "#F4D03F", "#FFA400", "#E08A1E", "#FFB61E", "#FAA945", "#FFA631", "#FFB94E"],
                  ["#E29C45", "#F9690E", "#CA6924", "#F5AB35", "#BFBFBF", "#F2F1EF", "#BDC3C7", "#ECF0F1", "#D2D7D3", "#757D75"],
                  ["#EEEEEE", "#ABB7B7", "#6C7A89", "#95A5A6", "#9ACCCB", "#E8E7E7", "#000000", "#FFFFFF", "#50c7e8"]
                ]
            }
        }

        function openMediaModal(modal, controller, index, size, vm, component, componentItemIndex, update) {
            console.log('openModal >>> ', modal, controller, index);
            var _modal = {
                templateUrl: modal,
                keyboard: false,
                backdrop: 'static',
                size: 'md',
                resolve: {
                    vm: function() {
                        return vm;
                    },
                    showInsert: function () {
                        return true
                    },
                    insertMedia: function () {
                        return function(asset) {

                            ssbService.setMediaForComponent(asset, component, componentItemIndex, update);

                        }
                    },
                    component: function() {
                        return component;
                    },
                    componentItemIndex: function() {
                        return componentItemIndex;
                    },
                    update: function() {
                        return update;
                    }
                }
            };

            if (controller) {
                _modal.controller = controller;
            }

            if (size) {
                _modal.size = 'lg';
            }

            return $modal.open(_modal);

            // vm.modalInstance = $modal.open(_modal);

            // vm.modalInstance.result.then(null, function () {
            //     angular.element('.sp-container').addClass('sp-hidden');
            // });

        }

        //TODO: this is legacy code adapted from editorCtrl.js, needs to be removed when we no longer support these components
        function setMediaForComponent(asset, component, index, update) {

            var obj = {};
            var type = component.type;

            //if image/text component
            if (type === 'image-text') {

                component.imgurl = asset.url;

            } else if (type === 'image-gallery') {

                if (update) {

                    component.images[index].url = asset.url;

                } else {

                    component.images.splice(index + 1, 0, {
                        url: asset.url
                    });

                }

            } else if (type === 'thumbnail-slider') {

                if (update) {

                    component.thumbnailCollection[index].url = asset.url;

                } else {

                    component.thumbnailCollection.splice(index + 1, 0, {
                        url: asset.url
                    });

                }

            } else if (type === 'meet-team') {

                component.teamMembers[index].profilepic = asset.url;

            } else {

                console.log('unknown component or image location');

            }

        }


		(function init() {

			AccountService.getAccount(function(data) {
				ssbService.websiteId = data.website.websiteId;
                ssbService.getSite(data.website.websiteId, true);
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
