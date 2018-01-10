'use strict';
/*global app, window,console,_, $, angular ,Image */
/*jslint unparam:true*/

/* eslint-disable no-console */
(function () {

    app.factory('SimpleSiteBuilderService', SimpleSiteBuilderService);

    SimpleSiteBuilderService.$inject = ['$rootScope', '$compile', '$http', '$q', '$timeout', 'AccountService', 'WebsiteService', '$modal', 'pageConstant'];
    /* @ngInject */
    function SimpleSiteBuilderService($rootScope, $compile, $http, $q, $timeout, AccountService, WebsiteService, $modal, pageConstant) {
        var ssbService = {},
			baseWebsiteAPIUrl = '/api/1.0/cms/website/',
			//basePageAPIUrl = '/api/1.0/cms/page/',
			baseComponentAPIUrl = '/api/1.0/cms/component/',
			baseTemplateAPIUrl = '/api/1.0/cms/template/',
			baseWebsiteAPIUrlv2 = '/api/2.0/cms/websites/',
			basePageAPIUrlv2 = '/api/2.0/cms/pages/',
			baseTemplateAPIUrlv2 = '/api/2.0/cms/templates/',
			baseSiteTemplateAPIUrlv2 = '/api/2.0/cms/sitetemplates/',
			baseThemesAPIUrlv2 = '/api/2.0/cms/themes/',
			baseSectionAPIUrlv2 = '/api/2.0/cms/sections/',
			baseComponentAPIUrlv2 = '/api/2.0/cms/components/',
			basePagesWebsiteAPIUrl = '/api/2.0/cms/website/',
            baseAssetsAPIUrl = '/api/1.0/assets/custom/fonts/',
			baseAccountAPIUrl = '/api/1.0/account/';

        ssbService.getSite = getSite;
        ssbService.getPage = getPage;
        ssbService.getPages = getPages;
        ssbService.loadDataFromPage = loadDataFromPage;
        ssbService.getPagesWithSections = getPagesWithSections;
        ssbService.savePage = savePage;
        ssbService.saveWebsite = saveWebsite;
        ssbService.updateScriptResource = updateScriptResource;
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
        ssbService.websiteLoading = false;
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
        ssbService.addSectionToPageToIndex = addSectionToPageToIndex;
        ssbService.removeSectionFromPage = removeSectionFromPage;
        ssbService.removeSectionFromLayoutArea = removeSectionFromLayoutArea;
        ssbService.getSpectrumColorOptions = getSpectrumColorOptions;
        ssbService.getFontFamilyOptions = getFontFamilyOptions;
        ssbService.getFontWeightOptions = getFontWeightOptions;
        ssbService.bodyFontWeightOptions = bodyFontWeightOptions;
        ssbService.getLocationFinderRanges = getLocationFinderRanges;
        ssbService.deletePage = deletePage;
        ssbService.openMediaModal = openMediaModal;
        ssbService.setMediaForComponent = setMediaForComponent; //legacy re-impl
        ssbService.extendComponentData = extendComponentData;
        ssbService.getTempUUID = getTempUUID;
        ssbService.setTempUUIDForSection = setTempUUIDForSection;
        ssbService.setPermissions = setPermissions;
        ssbService.addCompiledElement = addCompiledElement;
        ssbService.addCompiledElementEditControl = addCompiledElementEditControl;
        ssbService.getCompiledElement = getCompiledElement;
        ssbService.getCompiledElementEditControl = getCompiledElementEditControl;
        ssbService.compileEditorElements = compileEditorElements;
        ssbService.addUnderNavSetting = addUnderNavSetting; //legacy re-impl
        ssbService.contentComponentDisplayOrder = [];
        ssbService.inValidPageHandles = pageConstant.inValidPageHandles;
        ssbService.getPageVersions = getPageVersions;
        ssbService.publishPage = publishPage;
        ssbService.revertPage = revertPage;
        ssbService.updateBlogPages = updateBlogPages;
        ssbService.permissions = {};
        ssbService.compiledElements = {};
        ssbService.compiledElementEditControls = {};
        ssbService.detectIENotEdge = detectIENotEdge;
        ssbService.isIENotEdge = ssbService.detectIENotEdge();
        ssbService.getBlogListPage = getBlogListPage;
        ssbService.getBlogPostPage = getBlogPostPage;
        ssbService.returnInvalidPost = returnInvalidPost;
        ssbService.checkAndSetGlobalHeader = checkAndSetGlobalHeader;
        ssbService.checkDuplicateGlobalHeader = checkDuplicateGlobalHeader;
        ssbService.getTempComponent = getTempComponent;
        ssbService.deletedNavLinks = [];
        ssbService.setDeletedPageFromLinkList = setDeletedPageFromLinkList;
        ssbService.saveOtherPageLinks = saveOtherPageLinks;
        ssbService.getAccount = getAccount;
        ssbService.isImage = isImage;
        ssbService.getAccountTemplates = getAccountTemplates;
        ssbService.copyAccountTemplate = copyAccountTemplate;
        ssbService.getCustomFonts = getCustomFonts;
        /**
         * This represents the category sorting for the add content panel
         */

        ssbService.contentSectionDisplayOrder = [
            'navigation',
            'welcome hero',
            'products & services',
            'donations',
            'forms',
            'gallery',
            'text',
            'video',
            'mixed content',
            'team',
            'testimonials',
            'contact',
            'social',
            'footer',
            'blog',
            'misc'
        ];


        ssbService.contentSectionDisplayOrderLeadSource = [
            'navigation',
            'carousels',
            'services',
            'forms',
            'gallery',
            'text',
            'team',
            'contact',
            'social',
            'footer',
            'blog'
        ];

        ssbService.contentSectionIcons = {
            'navigation':{
                'icon': 'fa-reorder'
            },
            'welcome hero':{
                'icon': 'fa-bullhorn'
            },
            'carousels':{
                'icon': 'fa-bullhorn'
            },
            'products & services':{
                'icon': 'fa-shopping-cart'
            },
            'services':{
                'icon': 'fa-shopping-cart'
            },
            'donations':{
                'icon': 'fa-heart-o'
            },
            'forms':{
                'icon': 'fa-at'
            },
            'gallery':{
                'icon': 'fa-file-image-o'
            },
            'text':{
                'icon': 'fa-text-width'
            },
            'video':{
                'icon': 'fa-video-camera'
            },
            'mixed content':{
                'icon': 'fa-object-ungroup'
            },
            'team':{
                'icon': 'fa-users'
            },
            'testimonials':{
                'icon': 'fa-commenting'
            },
            'contact':{
                'icon': 'fa-map-marker'
            },
            'social':{
                'icon': 'fa-thumbs-o-up'
            },
            'footer':{
                'icon': 'fa-copyright'
            },
            'blog':{
                'icon': 'fa-rss'
            },
            'misc':{
                'icon': 'fa-puzzle-piece'
            },
            'all':{
                'icon': 'fa-sort-amount-asc'
            }
        };

        ssbService.manageComponentIcons = {
            'navigation': {
                icon: 'fa-align-justify'
            },
            'social-link': {
                icon: 'fa-bullhorn'
            },
            'text': {
                icon: 'fa-text-height'
            },
            'image': {
                icon: 'fa-file-image-o'
            },
            'ssb-image': {
                icon: 'fa-file-image-o'
            },
            'ssb-text': {
                icon: 'fa-text-height'
            }
        };

        // function to get component sort order
        function getComponentSortOrder(newComponents, newSection){
            if(newSection && newSection.componentSortOrder)
               return newSection.componentSortOrder;
            else
               return _.invert(_.object(_.pairs(_.pluck(newComponents, 'type'))));
        }

        /**
         * Events for compiled editor elememts
         */
        $rootScope.$on('$ssbElementAdded', function(event, componentId, editorId, elementId) {
            console.log('$ssbElementAdded', componentId, editorId, elementId);
        });

        $rootScope.$on('$ssbElementRemoved', function(event, componentId, editorId, elementId) {
            removeCompiledElement(componentId, editorId, elementId);
            removeCompiledElementEditControl(componentId, editorId, elementId);
            console.log('$ssbElementRemoved', componentId, editorId, elementId);
        });


        /**
         * A wrapper around API requests
         * @param {function} fn - callback
         *
         * @returns {function} fn - callback
         *
         */
        function ssbRequest(fn) {
            ssbService.loading.value = ssbService.loading.value + 1;
            console.info('service | loading +1 : ' + ssbService.loading.value);
            fn.finally(function() {
                ssbService.loading.value = ssbService.loading.value - 1;
                console.info('service | loading -1 : ' + ssbService.loading.value);
            });
            return fn;
        }

        /**
         * Active section is the section focused for editing
         * @param {integer} sectionIndex - index of section to set active
         */
        function setActiveSection(sectionIndex) {
            ssbService.activeSectionIndex = sectionIndex;
        }

        /**
         * Active component is the component within a section that is focused for editing
         * @param {integer} componentIndex - index of component to set active
         */
        function setActiveComponent(componentIndex) {
            ssbService.activeComponentIndex = componentIndex;
        }

        /**
         * Get latest website object for this account
         * @param {string} id - website _id
         * @param {boolean} isLoading - if loading this data is in progress
         */
        function getSite(id) {

            function success(data) {
                ssbService.website = data;
            }

            function error(error) {
                console.error('SimpleSiteBuilderService getSite error: ', JSON.stringify(error));
            }

            return ssbRequest($http.get(baseWebsiteAPIUrlv2 + id).success(success).error(error));
        }

        /**
         * Get all pages for this account's website
         *
         */
        function getPages() {

            var deferred = $q.defer();

            // if (!ssbService.pages) {
            //     var pages = ssbService.loadDataFromPage('script#indigenous-precache-sitedata-pages');
            //     if (pages.length) {
            //         ssbService.pages = pages;
            //         deferred.resolve(ssbService.pages);
            //         return ssbRequest(deferred.promise);
            //     }
            // }

            function success(data) {
                ssbService.pages = data;
            }

            function error(error) {
                console.error('SimpleSiteBuilderService getPages error: ', JSON.stringify(error));
            }

            return ssbRequest($http.get(baseWebsiteAPIUrlv2 + ssbService.websiteId + '/pages').success(success).error(error));
        }

        function loadDataFromPage(scriptId) {
            console.log('loadDataFromPage:' + scriptId);
            var data = $(scriptId).html();

            var unescapeMap = {
                "&amp;":"&",
                "&lt;":"<",
                "&gt;":">",
                '&quot;':'"',
                '&#39;':"'",
                '&#x2F;':"/",
                '&apos;': "'"
            };

            function unescapeHTML(string) {
                return String(string).replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2f;|&apos;)/g, function(s) {
                    return unescapeMap[s] || s;
                });
            }

            var parsedData = JSON.parse(unescapeHTML(data));

            return parsedData;
        }

        /**
         * TODO: @sanjeev to document
         *
         */
        function getPagesWithSections() {


            function success(data) {
                 console.log('SimpleSiteBuilderService getPages with sections',data);
            }

            function error(error) {
                console.error('SimpleSiteBuilderService getPages with sections: ', JSON.stringify(error));
            }

            return ssbRequest($http.get(basePagesWebsiteAPIUrl + ssbService.websiteId + '/pages').success(success).error(error));

        }

        /**
         * Get page
         * @param {string} id - page _id
         * @param {boolean} isSettings - is settings request
         * TODO: @sanjeev to document "isSettings" param
         */
        function getPage(id, isSettings) {
            function success(data) {
                console.log('SimpleSiteBuilderService requested page data' + data);
            }

            return ssbRequest($http.get(basePageAPIUrlv2 + id).success(
                isSettings ? success : successPage)
            .error(errorPage));
        }

        /**
         * Save page to db, update client instance with response from server
         * @param {object} page - page data
         * @param {boolean} isSettings - is settings request
         * TODO: @sanjeev to document "isSettings" param
         */
        function savePage(page, isSettings) {
            function success(data) {
                if(ssbService.pages && ssbService.pages[page.handle] && data.title){
                    ssbService.pages[page.handle].title = data.title;
                }
                console.log('SimpleSiteBuilderService requested page settings saved' + data);
            }
            if(!isSettings){
                page.ssb = true;
            }
            return (
                ssbRequest($http({
                    url: basePageAPIUrlv2 + page._id,
                    method: 'POST',
                    data: angular.toJson(page)
                }).success(isSettings ? success : successPage).error(errorPage))
            );
        }

        /**
         * Delete page from db, delete client instance
         * @param {object} page - page data
         */
        function deletePage(page) {
            function success(data) {
                console.log('SimpleSiteBuilderService requested page deleted',data);
                delete ssbService.pages[page.handle];
            }

            function error(err) {
                console.error('SimpleSiteBuilderService page delete error: ', JSON.stringify(err));
            }

            return (
                ssbRequest($http({
                    url: basePageAPIUrlv2 + page._id,
                    method: 'DELETE',
                    data: angular.toJson(page)
                }).success(success).error(error))
            );
        }

        /**
         * Create a page from a page template
         * @param {string} templateId - template's _id
         */
        function createPage(templateId) {

            return (
                ssbRequest($http({
                  url: baseWebsiteAPIUrlv2 + ssbService.website._id + '/page/',
                  method: 'POST',
                  data: { templateId: templateId }
                }).success(success).error(error))
            );

            function success(data) {
                console.log('SimpleSiteBuilderService requested page created',data);
            }

            function error(er) {
                console.error('SimpleSiteBuilderService page creation error: ', JSON.stringify(er));
            }

        }


        function saveOtherPageLinks() {
            function success(data) {
                resetDeletedPageLinkList();
                console.log('SimpleSiteBuilderService requested pages saved' + data);
            }


            if(ssbService.deletedNavLinks.length){
                return (
                    ssbRequest($http({
                        url: basePageAPIUrlv2 + "update/linked/navigation",
                        method: 'POST',
                        data: angular.toJson(ssbService.deletedNavLinks)
                    }).success(success).error(errorPage))
            );
            }

        }

        /**
         * Create a page from an existing page
         * @param {object} page - page data
         */
        function createDuplicatePage(page) {
            function success(data) {
                console.log('SimpleSiteBuilderService requested page created',data);
            }

            function error(error) {
                console.error('SimpleSiteBuilderService page error: ', JSON.stringify(error));
            }
            return (
                ssbRequest($http({
                  url: baseWebsiteAPIUrlv2 + ssbService.website._id + '/duplicate/page/',
                  method: 'POST',
                  data: angular.toJson(page)
                }).success(success).error(error))
            );

        }

        /**
         * Shared success callback for page API requests
         * @param {object} data - page data response from server
         */
        function successPage(data) {
            var page = transformComponentsToSections(data);
            console.log("page loaded");
            ssbService.page = page;
            // Refresh page list with updated page
            if(ssbService.pages && ssbService.pages[page.handle]){
              ssbService.pages[page.handle] = page;
            }
        }

        /**
         * Shared error callback for page API requests
         * @param {object} error - error response from server
         */
        function errorPage(error) {
            console.error('SimpleSiteBuilderService page error: ', JSON.stringify(error));
        }

        /**
         * Transform legacy component objects into section objects with a single component child
         * @param {object} page - page data
         */
        function transformComponentsToSections(page) {
            /*
             *
             * Transform legacy pages to new section/component model format
             */
            if (page.components && page.components.length && !page.ssb) {
                page.sections = angular.copy(page.components);
                for (var i = 0; i < page.sections.length; i++) {
                    var component = angular.copy(page.sections[i]);
                    var id = Math.random().toString(36).replace('0.','');
                    var defaultSectionObj = {
                        _id: id,
                        accountId: ssbService.account._id,
                        layout: '1-col',
                        components: [component],
                        visibility: true
                    };

                    defaultSectionObj.name = sectionName(defaultSectionObj) + ' Section';

                    page.sections[i] = defaultSectionObj;

                }
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

            page.ssb = true;

            return page;
        }

        /**
         * Save website to db, update client instance with response from server
         * @param {object} webite - website data
         */
        function saveWebsite(website) {

            function success(data) {
                ssbService.website = data;
            }

            function error(error) {
                console.error('SimpleSiteBuilderService saveWebsite error: ', JSON.stringify(error));
            }

            return (
                ssbRequest($http({
                    url: baseWebsiteAPIUrlv2 + website._id,
                    method: 'POST',
                    data: angular.toJson(website)
                }).success(success).error(error))
            );

        }

    /**
         * Save website script resources to db, update client instance with response from server
         * @param {object} webite - website data
         */
    function updateScriptResource(website) {

            function success(data) {
                ssbService.website = data;
            }

            function error(error) {
                console.error('SimpleSiteBuilderService updateScriptResource error: ', JSON.stringify(error));
            }

            return (
                ssbRequest($http({
                    url: baseWebsiteAPIUrlv2 + website._id + '/userScripts',
                    method: 'POST',
                    data: angular.toJson(website)
                }).success(success).error(error))
            );

        }

        /**
         * Get component data from server
         * @param {object} component - default component data
         * @param {integer} version - version number of component
         */
        function getComponent(component, version) {

            if (!version) {
                version = 1;
            }

            function success(data) {
                console.log('SimpleSiteBuilderService requested component: ' + data);
            }

            function error(error) {
                console.error('SimpleSiteBuilderService component error: ', JSON.stringify(error));
            }

            return (
                ssbRequest($http({
                    url: baseComponentAPIUrl + component.type,
                    method: "POST",
                    data: angular.toJson({
                        version: version
                    })
                }).success(success).error(error))
            );

        }

        /**
         * Get section data from server
         * @param {object} section - default section data
         * @param {integer} version - version number of section
         */
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
                console.error('SimpleSiteBuilderService section error: ', JSON.stringify(error));
            }

            return ssbRequest(deferred.promise);

        }

        /**
         * Infer a decent name for a content section
         * @param {object} section - section data
         */
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

        /**
         * Get legacy (Pages) component as a section
         * @param {object} section - section data
         * @param {integer} version - version number of section
         */
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
            };

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
                    };
                }

                return sectionDefault;
            });
        }

        /**
         * Get list of content sections available for adding to a page
         *
         */
        function getPlatformSections() {

            function success(data) {
                // Special case to handle platform sections on basis of orgId
                _.each(data, function(section){
                    if(ssbService.orgId){
                        if(section.orgConfig){
                            var orgConfig = _.find(section.orgConfig, function(config){
                                return config.orgId == ssbService.orgId
                            });
                            if(orgConfig){
                                if(orgConfig.filter){
                                    section.filter = orgConfig.filter;
                                }
                                if(orgConfig.preview){
                                    section.preview = orgConfig.preview;
                                }
                            }
                        }
                    }
                })
                ssbService.platformSections = data;
                //console.log('SimpleSiteBuilderService requested getPlatformSections: ' + data);
            }

            function error(error) {
                console.error('SimpleSiteBuilderService getPlatformSections error: ', JSON.stringify(error));
            }

            return (ssbRequest($http({
                url: baseSectionAPIUrlv2 + 'platform',
                method: 'GET'
            }).success(success).error(error)));

        }

        /**
         * Get list of content sections created by current user available for re-using on multiple pages
         *
         */
        function getUserSections() {

            function success(data) {
                ssbService.userSections = data;
                console.log('SimpleSiteBuilderService getUserSections: ' + data);
            }

            function error (error) {
                console.error('SimpleSiteBuilderService getUserSections error: ', JSON.stringify(error));
            }

            return (ssbRequest($http({
                url: baseSectionAPIUrlv2 + 'user',
                method: 'GET'
            }).success(success).error(error)));

        }

        /**
         * Get list of components available for adding to a section
         *
         */
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
                console.error('SimpleSiteBuilderService getPlatformComponents error: ', JSON.stringify(error));
            }

            return (
                    ssbRequest($http({
                        url: baseComponentAPIUrlv2,
                        method: 'GET'
                    }).success(success).error(error))
                );
        }

        /**
         * Get list of themes available for applying to a website
         *
         */
        function getThemes() {

            function success(data) {
                console.log('SimpleSiteBuilderService requested themes: ' + data);
                ssbService.themes = data;
            }

            function error(error) {
                console.error('SimpleSiteBuilderService themes error: ', JSON.stringify(error));
            }

            return (
                ssbRequest($http({
                    url: baseThemesAPIUrlv2,
                    method: 'GET',
                }).success(success).error(error))
            );

        }

        /**
         * Check for existing page with given handle
         * @param {string} pageHandle - page handle
         */
        function checkForDuplicatePage(pageHandle) {

            function success(data) {
                console.log('SimpleSiteBuilderService checkForDuplicatePage: ' + data);
            }

            function error(error) {
                console.error('SimpleSiteBuilderService checkForDuplicatepage error: ', JSON.stringify(error));
            }

            return (
                ssbRequest($http({
                    url: baseWebsiteAPIUrl + ssbService.website._id + '/page/' + pageHandle,
                    method: 'GET',
                }).success(success).error(error))
            );

        }

        /**
         * Get list of page templates
         *
         */
        function getTemplates() {

          function success(data) {
            ssbService.templates = data.sort(function(a, b) {
                return a.modified.date > b.modified.date;
            });
            console.log('SimpleSiteBuilderService getTemplates: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService getTemplates error: ', JSON.stringify(error));
          }

          return (
            ssbRequest($http({
              url: baseTemplateAPIUrlv2,
              method: 'GET',
            }).success(success).error(error))
          );

        }

        /**
         * Get list of site templates
         *
         */
        function getSiteTemplates() {

          function success(data) {
            ssbService.siteTemplates = data;
            console.log('SimpleSiteBuilderService getSiteTemplates: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService getSiteTemplates error: ', JSON.stringify(error));
          }

          return (
            ssbRequest($http({
              url: baseSiteTemplateAPIUrlv2,
              method: 'GET'
            }).success(success).error(error))
          );

        }


        /**
         * Get list of site templates
         *
         */
        function getAccountTemplates() {

          function success(data) {
            ssbService.accountTemplates = data;
            console.log('SimpleSiteBuilderService getAccountTemplates: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService getAccountTemplates error: ', JSON.stringify(error));
          }

          return (
            ssbRequest($http({
              url: baseAccountAPIUrl + "templates",
              method: 'GET'
            }).success(success).error(error))
          );

        }

        /**
         * Apply the site template to the website, results in:
         *   - creating a set of pages defined in the site template
         *   - applying the theme defined in the site template
         *
         * @param {object} siteTemplate - site template data obj
         */
        function setSiteTemplate(siteTemplate) {

            function success(data) {
                console.log('SimpleSiteBuilderService setSiteTemplate: ' + data);
            }

            function error(error) {
                console.error('SimpleSiteBuilderService setSiteTemplate error: ', JSON.stringify(error));
            }

            return (
                ssbRequest($http({
                    url: baseWebsiteAPIUrlv2 + ssbService.website._id + '/sitetemplates/' + siteTemplate._id,
                    method: 'POST',
                    data: {
                        siteTemplateId: siteTemplate._id,
                        siteThemeId: siteTemplate.siteThemeId,
                        siteThemeOverrides: siteTemplate.siteThemeOverrides
                    }
                }).success(success).error(error))
            );
        }


        function copyAccountTemplate(accountTemplateId) {

            function success(data) {
                console.log('SimpleSiteBuilderService copyAccountTemplate: ' + data);
            }

            function error(error) {
                console.error('SimpleSiteBuilderService copyAccountTemplate error: ', JSON.stringify(error));
            }

            return (
                ssbRequest($http({
                    url: baseAccountAPIUrl + accountTemplateId + '/copy',
                    method: 'POST'
                }).success(success).error(error))
            );
        }

        /**
         * Get a page template by _id
         * @param {string} id - page template _id
         *
         */
        function getTemplateById(id) {

          return _.where(ssbService.templates, {
            _id: id
          });

        }

        /**
         * Get list of legacy templates
         *
         */
        function getLegacyTemplates() {

          function success(data) {
            ssbService.legacyTemplates = data;
            console.log('SimpleSiteBuilderService getLegacyTemplates: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService getLegacyTemplates error: ', JSON.stringify(error));
          }

          return (
            ssbRequest($http({
              url: baseTemplateAPIUrl,
              method: 'GET',
            }).success(success).error(error))
          );

        }

        /**
         * Add a section to the current page
         * @param {object} section - section data
         * @param {integer} version - section version number
         * @param {integer} replaceAtIndex - optional, index of page section to replace with new section
         * @param {object} oldSection - optional, the data of the existing section to be replaced
         * @param {integer} copyAtIndex - optional, index to insert section copy
         *
         */
        function addSectionToPage(section, version, replaceAtIndex, oldSection, copyAtIndex) {
            var insertAt,
				numSections,
				hasHeader = false,
				hasFooter = false,
				deferred = $q.defer(),
				promise;

            if (!ssbService.page.sections) {
                ssbService.page.sections = [];
            } else {
                //hasHeader = pageHasHeader(ssbService.page.sections);
                hasFooter = pageHasFooter(ssbService.page.sections);
                console.debug(hasFooter);
            }

            numSections = ssbService.page.sections.length;

            insertAt = hasFooter ? numSections - 1 : numSections;

            if (copyAtIndex === undefined) {

                promise = ssbService.getSection(section, version || 1).then(function(response) {

                    if (response) {

                        if (angular.isDefined(replaceAtIndex)) {
                            var extendedData = ssbService.extendComponentData(oldSection, response);
                            ssbService.setActiveSection(null);
                            ssbService.page.sections.splice(replaceAtIndex, 1, extendedData);
                            ssbService.setActiveSection(replaceAtIndex);
                            ssbService.setActiveComponent(null);
                        } else {
                            // Set unique _id's for section and component.
                            var _section = checkAndSetGlobalHeader(response);
                            var insertSection = ssbService.setTempUUIDForSection(_section);
                            ssbService.page.sections.splice(insertAt, 0, insertSection);
                            ssbService.setActiveSection(insertAt);
                            ssbService.setActiveComponent(null);
                        }

                    } else {
                        console.error("Error loading section/component:", section);
                    }

                });

            } else {
                section = checkAndSetGlobalHeader(section);
                ssbService.page.sections.splice(copyAtIndex, 0, section);
                ssbService.setActiveSection(copyAtIndex);
                deferred.resolve();
                promise = deferred.promise;

            }

            return promise;

        }

        function addSectionToPageToIndex(section, insertAtIndex) {
            var insertAt;
            var numSections;
            var hasHeader = false;
            var hasFooter = false;
            var deferred = $q.defer();
            var promise;

            if (!ssbService.page.sections) {
                ssbService.page.sections = [];
            } else {

                hasFooter = pageHasFooter(ssbService.page.sections);
                console.debug(hasFooter);
            }

            numSections = ssbService.page.sections.length;

            insertAt = hasFooter ? numSections - 1 : numSections;

            if(angular.isDefined(insertAtIndex)){

                insertAt = insertAtIndex;
            }

            promise = ssbService.getSection(section, 1).then(function(response) {

                if (response) {

                    var _section = checkAndSetGlobalHeader(response);
                    var insertSection = ssbService.setTempUUIDForSection(_section);

                    //setting opacity for testimonial slider dots
                    if(insertSection.name && insertSection.components[0].slider && insertSection.name == "testimonials"){
                        insertSection.components[0].slider['sliderDotColorOpacity'] = 1;
                    }
                    //setup opacity for image-gallery
                    if(insertSection.components[0] && insertSection.components[0].type == "image-gallery"){
                        insertSection.components[0].slider = {
                                sliderDotColorOpacity : 1
                        }    ;
                    }
                    //setting opacity for nav + hero
                    if(insertSection.name && insertSection.components[0].slider && insertSection.name == "Nav + Hero"){
                        insertSection.components[0].slider['sliderDotColorOpacity'] = 1;
                    }
                    ssbService.page.sections.splice(insertAt, 0, insertSection);
                    ssbService.setActiveSection(insertAt);
                    ssbService.setActiveComponent(null);

                } else {
                    console.error("Error loading section/component:", section);
                }

            });

            return promise;

        }


        /**
         * Remove a section from the current page
         * @param {integer} index - index of page section to be removed
         *
         */

        function removeSectionFromPage(pageSectionIndex) {

            if (ssbService.page.layout === 'ssb-layout__header_2-col_footer' && ssbService.page.layoutModifiers) {
                ssbService.removeSectionFromLayoutArea(pageSectionIndex);
            }

            ssbService.page.sections.splice(pageSectionIndex, 1);

            ssbService.setActiveSection(null);
            ssbService.setActiveComponent(null);

        }

        /**
         * Remove a section from the specific layout area of page
         * @param {obj} section - section of page to be removed
         * @param {integer} index - index of page section to be removed
         *
         * Note: layoutModifiers for custom layouts look like:
         *       {
         *          "header" : [
         *              0
         *          ],
         *          "2-col-1" : [
         *              1
         *          ],
         *          "2-col-2" : [
         *              2,
         *              3,
         *              4,
         *              5,
         *              6,
         *              7
         *          ],
         *          "footer" : [
         *              8
         *          ]
         *      }
         */
        function removeSectionFromLayoutArea(pageSectionIndex) {

            var decrementProceedingValues = false,
				//sectionId = ssbService.page.sections[pageSectionIndex]._id,
				sectionLayoutName = _.filter(ssbService.page.layoutModifiers._layoutAreas, function(val) {
                return ssbService.page.layoutModifiers[val].indexOf(pageSectionIndex) !== -1;
            })[0];
            var sectionLayoutIndex = ssbService.page.layoutModifiers[sectionLayoutName].indexOf(pageSectionIndex);


            console.debug('sectionLayoutName before:', sectionLayoutName);
            console.debug('ssbService.page.layoutModifiers[sectionLayoutName]:', ssbService.page.layoutModifiers[sectionLayoutName]);

            //remove this section's index value from the layout area array that its in
            ssbService.page.layoutModifiers[sectionLayoutName].splice(sectionLayoutIndex, 1);

            //decrement all index values that come after the one just removed
            _.each(ssbService.page.layoutModifiers._layoutAreas, function(layoutName) {

                if (layoutName === sectionLayoutName) {
                    decrementProceedingValues = true;
                }

                if (decrementProceedingValues) {

                    console.debug('layoutName before:', layoutName);
                    console.debug('ssbService.page.layoutModifiers[layoutName]:', ssbService.page.layoutModifiers[layoutName]);

                    ssbService.page.layoutModifiers[layoutName] = _.map(ssbService.page.layoutModifiers[layoutName], function(val) {
                        return (val - 1);
                    });

                    console.debug('layoutName after:', layoutName);
                    console.debug('ssbService.page.layoutModifiers[layoutName]:', ssbService.page.layoutModifiers[layoutName]);
                }

            });

        }

        /*
         * extendComponentData
         * - extend authored data onto new components
         * - match component order of newSection
         * - omit keys we don't want transfered
         *
         * @param {object} oldSection - section being replaced
         * @param {object} newSection - section from server
         *
         * @returns {*} newSection with any authored data
         *
         */
        function extendComponentData(oldSection, newSection) {
            var keysToOmitSection = ['$$hashKey', 'anchor', 'version', 'type', 'layout', 'visibility', 'bg', 'border', 'layoutModifiers', 'componentSortOrder', 'thumbnailCollection'];
            var keysToOmitComponent = ['$$hashKey', 'anchor', 'accountId', 'version', 'type', 'layout', 'visibility', 'bg', 'border', 'layoutModifiers', 'componentSortOrder', 'thumbnailCollection', 'nav'];
            var newComponents = angular.copy(newSection.components);

            var newComponentsOrder =  getComponentSortOrder(newComponents, newSection); // ['componentType1', 'componentType2', ...]

            var oldComponents = _(angular.copy(oldSection.components)).chain()

                                    .sortBy(function(x) { // sort by order of newComponents
                                        return newComponentsOrder[x.type] && parseInt(newComponentsOrder[x.type], 10);
                                    })

                                    .value(); // return the new array

            if(newSection.componentSortOrder){
                // get current sort order
                var componentOrder =  angular.copy(getComponentSortOrder(newComponents));
                //arrange components in requested order
                newComponents = _(newComponents).chain()
                                    .sortBy(function(x) { // sort by order of newComponents
                                        return newComponentsOrder[x.type] && parseInt(newComponentsOrder[x.type], 10);
                                    }).value(); // return the new array
            }


            delete newSection.components;
            var oldSectionComponentCopy = newSection.components;
            delete oldSection.components;


            if(newSection.componentSortOrder){

                newSection.components = _.map(newComponents, function(c, index) {
                    var component = _.findWhere(oldComponents, { type: c.type });
                    if(!component){
                        component={};
                        component._id = ssbService.getTempUUID();
                        component.anchor = component._id;
                    }
                    return $.extend({}, c, _.omit(component || oldComponents[index], keysToOmitComponent));
                });

                // set current sort order
                newSection.components = _(newSection.components).chain().sortBy(function(section){
                    return componentOrder[section.type] && parseInt(componentOrder[section.type], 10);
                }).value();
            }
            else if(checkIfDiffrentLenthSection(newSection)){

                newSection.components = _.map(newComponents, function(c, index) {
                    var component = _.findWhere(oldComponents, { type: c.type });
                    return $.extend({}, c, _.omit(component || oldComponents[index], keysToOmitComponent));
                });

            }
            else{

                newSection.components = _.map(newComponents, function(c, index) {

                  if(newSection.layout==="nav-hero" && c.type === "ssb-text" ){

                    return $.extend({}, c, _.omit(newComponents[index], keysToOmitComponent));

                 }else{
                   return $.extend({}, c, _.omit(oldComponents[index], keysToOmitComponent));
                 }

                });


            }


            return $.extend({}, newSection, _.omit(oldSection, keysToOmitSection));



        }

        function getGlobalHeaders(sections){
            return _.filter(sections, function(section){
                return (section.globalHeader === true || section.title === "Header") && section.global === true;
            });
        }

        /*
         * Determine if page has a header
         *
         *
         */
        function pageHasHeader(sections) {
            var match = getGlobalHeaders(sections);
            return match.length !== 0;
        }

        /*
         * Determine if page has a footer
         *
         * @returns {boolean}
         *
         */
        function pageHasFooter(sections) {
            var hasSectionFooter = false;
            var hasComponentFooter = false;
            var match = _.filter(sections, function(s){

                if (s && s.name && s.components) {
                    hasSectionFooter = s.name.toLowerCase() === 'footer';
                    hasComponentFooter = _.where(s.components, { type: 'footer' }).length !== 0;
                }

                return hasSectionFooter || hasComponentFooter;

            });

            return match.length !== 0;
        }


        /*
         * Determine if section is a header
         *
         */
        function isHeaderSection(section) {
            return (section.globalHeader === true || section.title === "Header") && section.global === true;
        }

        function checkAndSetGlobalHeader(section){
            if(isHeaderSection(section) && pageHasHeader(ssbService.page.sections)){
                section.global = false;
            }
            return section;
        }

        function checkDuplicateGlobalHeader(section){
            var _duplicate = false;
            if(section){
                if(section.globalHeader === true || section.title === "Header"){
                   var globalHeaders = getGlobalHeaders(ssbService.page.sections);
                   if(globalHeaders && globalHeaders.length){
                        var _index = _.findIndex(globalHeaders, { _id: section._id });
                        _duplicate = _index === -1;
                   }
                }
            }

            return _duplicate;
        }

        /*
         * setup Theme
         *
         * - get latest theme data based on website's themeId
         * @param {object} website - website data
         *
         */
        function setupTheme() {
            return ssbService.getThemes().then(function(themes) {
                var theme = themes.data.filter(function(t) { return t._id === ssbService.website.themeId; })[0] || {};
                var defaultTheme;

                if (theme._id) {
                    ssbService.applyThemeToSite(theme);
                } else {
                    defaultTheme = themes.data.filter(function(t) { return t.handle === 'default'; })[0] || {};
                    ssbService.applyThemeToSite(defaultTheme, false);
                    ssbService.website.themeId = defaultTheme._id;
                    ssbService.saveWebsite(ssbService.website);
                }
            });
        }

        /*
         * Apply theme fonts, styles and default themeoverrides for theme
         *
         * @param {object} theme - theme obj
         * @param {boolean} keepCurrentOverrides - when not changing themes, should not set new themeOverrides
         * @param {object} website - website data
         *
         */
        function applyThemeToSite(theme, keepCurrentOverrides) {
            // Load web font loader
            var unbindWatcher = $rootScope.$watch(function() {
                return angular.isDefined(window.WebFont);
            }, function(newValue, oldValue) {
                if (newValue) {
                    var defaultFamilies = ['Roboto:200,400,700', 'Roboto Condensed:200,400,700', 'Roboto Slab:200,400,700', 'Oswald:200,400,700', 'Montserrat:200,400,700', 'Droid Serif:200,400,700', 'Open Sans:200,400,700', 'Open Sans Condensed:200,400,700', 'Lato:200,400,700', 'Raleway:200,400,700', 'Quicksand:200,400,700', 'Ubuntu:200,400,700', 'Merriweather:200,400,700', 'Quattrocento:200,400,700', 'Lora:200,400,700', 'Playfair Display:200,400,700', 'Pacifico:200,400,700', 'Satisfy:200,400,700', 'Parisienne:200,400,700', 'Petit Formal Script:200,400,700', 'Indie Flower:200,400,700', 'Shadows Into Light Two:200,400,700', 'Amatic SC:200,400,700', 'Delius Swash Caps:200,400,700', 'Itim:200,400,700', 'Neucha:200,400,700', 'Patrick Hand SC:200,400,700', 'Schoolbell:200,400,700', 'PT Sans:200,400,700','Nunito:200,400,700','Cinzel:200,400,700','Titillium Web:200,400,700','Source Sans Pro:200,400,700'];
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
                    ssbService.website.themeId = theme._id;
                    ssbService.website.theme = theme;

                    if (keepCurrentOverrides || !ssbService.website.themeOverrides || (ssbService.website.themeOverrides && !angular.isDefined(ssbService.website.themeOverrides.styles))) {
                        $timeout(function() {
                            ssbService.website.themeOverrides = theme;
                        },0);
                    }
                    if(!ssbService.websiteLoading)
                        $timeout(function() {
                            ssbService.websiteLoading = true;
                        },100);
                }
            });

            window.WebFontConfig = {
                active: function() {
                    sessionStorage.fonts = true;
                }
            };

        }

        /*
         * Provide list of colors to use in color pickers
         *
         * @returns {array}
         *
         */
        function getSpectrumColorOptions() {
            return {
                showPalette: true,
                showAlpha: true,
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
            };
        }

        /*
         * Provide list of font family
         *
         * @returns {object}
         *
         */
        function getFontFamilyOptions() {
            var fonts =  {
                "'Arial',Helvetica,sans-serif": "Arial",
                "'Amatic SC', cursive": "Amatic SC",
                "'Berlin', sans-serif": "Berlin",
                "'Calibri','Open Sans',sans-serif": "Calibri",
                "'Cinzel',serif": "Cinzel",
                "'Delius Swash Caps', cursive": 'Delius Swash Caps',
                "'Droid Serif',serif": 'Droid Serif',
                "'Georgia',serif": "Georgia",
                "'Helvetica Neue', Helvetica, Arial, sans-serif": "Helvetica Neue",
                "'Impact',Charcoal,sans-serif": "Impact",
                "'Indie Flower', cursive": 'Indie Flower',
                "'Itim', cursive": 'Itim',
                "'Lato',sans-serif": 'Lato',
                "'Lora',serif": 'Lora',
                "'Merriweather',serif": 'Merriweather',
                "'Montserrat',sans-serif": 'Montserrat',
                "'Montserrat:200',sans-serif": 'Montserrat Light',
                "'Neucha',cursive": 'Neucha',
                "'Open Sans Condensed',sans-serif": 'Open Sans Condensed',
                "'Open Sans',sans-serif": 'Open Sans',
                "'Oswald',sans-serif": 'Oswald',
                "'Pacifico',cursive" : 'Pacifico',
                "'Parisienne', cursive": 'Parisienne',
                "'Patrick Hand SC', cursive": 'Patrick Hand SC',
                "'Playfair Display',serif": 'Playfair Display',
                "'Petit Formal Script', cursive": 'Petit Formal Script',
                "'Quattrocento',serif": 'Quattrocento',
                "'Quicksand',sans-serif": 'Quicksand',
                "'PT Sans',sans-serif": 'PT Sans',
                "'Raleway',sans-serif": 'Raleway',
                "'Roboto Condensed',sans-serif": 'Roboto Condensed',
                "'Roboto Slab',serif": 'Roboto Slab',
                "'Roboto',sans-serif": 'Roboto',
                "'Satisfy', cursive": 'Satisfy',
                "'Schoolbell', cursive": 'Schoolbell',
                "'Shadows Into Light Two', cursive": 'Shadows Into Light Two',
                "'Source Sans Pro', sans-serif": 'Source Sans Pro',
                "'Tahoma',Geneva,sans-serif": "Tahoma",
                "'Times New Roman',Times,serif": "Times New Roman",
                "'Titillium Web', sans-serif": "Titillium Web",
                "'Trebuchet MS'":"Trebuchet MS",
                "'Ubuntu',sans-serif": 'Ubuntu',
                "'Verdana',Geneva,sans-serif": "Verdana"
            };

            if(ssbService.customFonts){
                _.each(ssbService.customFonts, function(font){
                    var _font = font.filename.substring(0, font.filename.indexOf('.'));
                    var _fontValue = _font.replace(/ /g, "_");
                    fonts[_fontValue] = _font;
                })
            }

            return fonts;

        }



        /*
         * Provide list of font weight
         *
         * @returns {object}
         *
         */
        function getFontWeightOptions() {
            return {
                "bold": "bold",
                "bolder": "bolder",
                "normal": 'normal',
                "lighter": 'Lighter'
            };
        }

        function bodyFontWeightOptions(){
            return {
                "200": "Light",
                "400": "Normal",
                "700": 'Bold'
            };
        }


        /*
         * Provide list of font weight
         *
         * @returns {object}
         *
         */
        function getLocationFinderRanges() {

            return [{
                "description": "5 miles",
                "value": 5
            },{
                "description": "10 miles",
                "value": 10
            },
            {
                "description": "25 miles",
                "value": 25
            },
            {
                "description": "50 miles",
                "value": 50
            },
            {
                "description": "100 miles",
                "value": 100
            },{
                "description": "200 miles",
                "value": 200
            }];
        }

        /*
         * Open the media modal
         *
         * @param {string} modal - name of modal
         * @param {string} controller - name of controller
         * @param {integer} index - null (TODO: remove)
         * @param {string} size - layout of modal 'lg', 'md', 'sm'
         * @param {object} vm - view model of parent controller, to pass into modal
         * @param {object} component - component to insert media into
         * @param {integer} componentIndex - index of component within the section
         * @param {boolean} update - update existing media
         *
         *
         * @returns {object} $modal instance
         *
         */
        function openMediaModal(modal, controller, index, size, vm, component, componentItemIndex, update, fields) {
            console.log('openModal >>> ', modal, controller, index);
            ssbService.asset = undefined;
            var _modal = {
                templateUrl: modal,
                keyboard: true,
                backdrop: 'static',
                size: 'md',
                resolve: {
                    vm: function() {
                        return vm;
                    },
                    showInsert: function () {
                        return true;
                    },
                    insertMedia: function () {
                        return function(asset) {
                            if(component)
                              ssbService.setMediaForComponent(asset, component, componentItemIndex, update, fields);
                            else{
                                ssbService.asset = asset;
                            }

                        };
                    },
                    component: function() {
                        return component;
                    },
                    componentItemIndex: function() {
                        return componentItemIndex;
                    },
                    update: function() {
                        return update;
                    },
                    isSingleSelect: function () {
                        return true;
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

        }

        /*
         * Open the media modal
         *
         * @param {object} asset - asset data from media modal (S3)
         * @param {object} component - component to insert media into
         * @param {integer} componentIndex - index of component within the section
         * @param {boolean} update - update existing media
         *
         * TODO: this is legacy code adapted from editorCtrl.js, needs to be removed when we no longer support these components
         *
         * @returns {object} $modal instance
         *
         */
        function setMediaForComponent(asset, component, index, update, fields) {
			var type = component.type;

            //if image/text component
            if (type === 'image-text') {
				component.imgurl = asset.url;
			} else if (type === 'image-gallery') {
				isImage(asset.url).then(function(response){
					if (response === false) {
						return;
					}else if (update) {
						component.images[index].url = asset.url;
					} else {
                        $rootScope.$broadcast('$refreshSlickSlider', index + 1);
                        component.images.splice(index + 1, 0, {
                            url: asset.url,
                            title: '<span style="font-size: 30px;">Service Title Here</span>'
                        });
                        if(fields && component.images[index + 1]){
                            angular.forEach(fields, function(v, k) {
                                component.images[index + 1][k] = v;
                            });
                        }
                    }
                });

            } else if (type === 'thumbnail-slider') {
                isImage(asset.url).then(function(response){
                    if(response === false){
                        console.log("Not a valid image.");
                        return;
                    }else if (update) {
                        component.thumbnailCollection[index].url = asset.url;
                        component.thumbnailCollection[index].img = "<img src='"+ asset.url +"'/>";
                    } else {
                        if(component.elementStyles){
                            var thumbnailCollectionSize = component.thumbnailCollection.length;
                            var data = { "img": {}, "details": {} };
                            for (var t = 0; t < thumbnailCollectionSize; t++) {
                                var newIndex=t;
                                if (t > index) {
                                    newIndex += 1;
                                }
                                if (component.elementStyles["image/img"] &&
                                        component.elementStyles["image/img"][t]) {
                                        data["img"][newIndex] = component.elementStyles["image/img"][t];
                                        if(t!==newIndex){
                                            delete data["img"][newIndex]["_id"];
                                            delete data["img"][newIndex]["id"];
                                            delete data["img"][newIndex]["anchor"];
                                        }
                                }
                                if (component.elementStyles["image/details"] &&
                                        component.elementStyles["image/details"][t]) {
                                        data["details"][newIndex] = component.elementStyles["image/details"][t];
                                        if(t!==newIndex){
                                            delete data["details"][newIndex]["_id"];
                                            delete data["details"][newIndex]["id"];
                                            delete data["details"][newIndex]["anchor"];
                                        }
                                }
                            }
                            component.elementStyles["image/details"] = data["details"];
                            component.elementStyles["image/img"] = data["img"];
                        }
                        component.thumbnailCollection.splice(index + 1, 0, {
                            url: asset.url,
                            img: "<img src='"+ asset.url +"'/>"
                        });
                    }
                });
			} else if (type === 'meet-team') {
                component.teamMembers[index].profilepic = asset.url;
            } else {
                console.log('unknown component or image location');
            }
		}

        function isImage(src) {
              var deferred = $q.defer();
              var image = new Image();
              image.onerror = function() {
                  console.log("Not a valid image");
                  deferred.resolve(false);
              };
              image.onload = function() {
                  deferred.resolve(true);
              };
              image.src = src;
              return deferred.promise;
        }

        function getTempUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }

        function setTempUUIDForSection(section) {
            var duplicateSection = angular.copy(section);

            duplicateSection._id = ssbService.getTempUUID();
            duplicateSection.anchor = duplicateSection._id;
            if (duplicateSection.components.length) {
                duplicateSection.components.forEach(function(component) {
                    component._id = ssbService.getTempUUID();
                    component.anchor = component._id;
                    if(angular.isObject(component.elementStyles) && Object.keys(component.elementStyles).length){
                        _.each(component.elementStyles, function(value){
                            if(value){
                                delete value._id;
                                delete value.id;
                                delete value.anchor;
                            }
                        });
                    }
                });
            }

            duplicateSection = JSON.parse(angular.toJson(duplicateSection));

            return duplicateSection;
        }

        function setPermissions() {

            var unbindWatcher = $rootScope.$watch(function() {
                return angular.isDefined($.FroalaEditor) && angular.isObject($.FroalaEditor.config);
            }, function(newValue) {
                if (newValue) {
                    unbindWatcher();
                    $timeout(function() {
                        if (ssbService.account.showhide.editHTML === true && $.FroalaEditor.config.toolbarButtons.indexOf('html') === -1) {
                            $.FroalaEditor.config.toolbarButtons.push('html');
                            ssbService.permissions.html = true;
                            //todo: better permissions-based script loading
                            $.getScript('//cdnjs.cloudflare.com/ajax/libs/codemirror/5.12.0/codemirror.min.js', function() {
                                console.log('loaded codemirror main');
                                $.getScript('//cdnjs.cloudflare.com/ajax/libs/codemirror/5.12.0/mode/xml/xml.min.js', function() {
                                    console.log('loaded codemirror mode');
                                });
                            });
                        }
                    });
                }
            });

            if (ssbService.account.showhide.ssbFeatureFixedElements) {
                ssbService.permissions.ssbFeatureFixedElements = true;
            }

        }

        function addCompiledElement(componentId, editorId, elementId, el) {
            ssbService.compiledElements[componentId] = ssbService.compiledElements[componentId] || {};
            ssbService.compiledElements[componentId][editorId] = ssbService.compiledElements[componentId][editorId] || {};
            ssbService.compiledElements[componentId][editorId][elementId] = el;
        }

        function addCompiledElementEditControl(componentId, editorId, elementId, el) {
            ssbService.compiledElementEditControls[componentId] = ssbService.compiledElementEditControls[componentId] || {};
            ssbService.compiledElementEditControls[componentId][editorId] = ssbService.compiledElementEditControls[componentId][editorId] || {};
            ssbService.compiledElementEditControls[componentId][editorId][elementId] = el;
        }

        function getCompiledElement(componentId, editorId, elementId) {
            return angular.element('#' + componentId + ' [data-compiled=' + elementId + ']');
            // return ssbService.compiledElements[componentId] &&
            //         ssbService.compiledElements[componentId][editorId] &&
            //         ssbService.compiledElements[componentId][editorId][elementId];
        }

        function getCompiledElementEditControl(componentId, editorId, elementId) {
            // return angular.element('#' + componentId + ' [data-compiled-control-id=control_' + elementId + ']');
            return ssbService.compiledElementEditControls[componentId] &&
                    ssbService.compiledElementEditControls[componentId][editorId] &&
                    ssbService.compiledElementEditControls[componentId][editorId][elementId];
        }

        /**
         * For special elements that are added to sections via drag and drop or Froala
         *  - TODO: support other element types (currently only buttons)
         *  - Need to be compiled, so:
         *  - Find the matching markup and $compile to Angular directive
         *  - Don't recompile
         *
         * @param {object} editor - editor instance (froala)
         * @param {boolean} initial - compile all if true
         * @param {string} componentId - id of parent text component/directive
         * @param {string} editorId - id of parent text editor
         * @param {object} scope - initial scope from editor.js
         *
         */
        function compileEditorElements(editor, initial, componentId, editorId, scope) {

            if (initial) {
                ssbService.compiledElements[componentId] = ssbService.compiledElements[componentId] || {};
                ssbService.compiledElements[componentId][editorId] = {};
            }
           // editor.$el.find('.fr-deletable').remove();
            editor.$el.find('.ssb-theme-btn').each(function() {
                var btn = $(this);
                var btnHTML;
                if (initial || undefined === btn.attr('data-compiled')) {
                    btn.removeClass('ssb-theme-btn-active-element');
                    btn.attr('ng-class', 'vm.elementClass()');
                    btn.attr('ng-attr-style', '{{vm.elementStyle()}}');
                    // btn.attr('ng-click', '$event.stopImmediatePropagation()');
                    btn.removeClass("ng-scope");
                    btnHTML = btn.get(0).outerHTML.replace('ng-scope', '');
                    $compile(btnHTML)(scope, function(cloned, scope) {
                        var tempId = ssbService.getTempUUID();
                        cloned.attr('data-compiled', tempId);
                        btn.replaceWith(cloned);
                        ssbService.addCompiledElement(componentId, editorId, tempId, angular.element('[data-compiled=' + tempId + ']'));
                        $rootScope.$broadcast('$ssbElementAdded', componentId, editorId, tempId);
                    });
                }
            });

            Object.keys(ssbService.compiledElements[componentId][editorId]).forEach(function(elementId) {
                if (editor.$el.find('[data-compiled=' + elementId + ']').length === 0) {
                    $rootScope.$broadcast('$ssbElementRemoved', componentId, editorId, elementId);
                }
            });

            $rootScope.$broadcast('$ssbElementsChanged', componentId, editorId);

        }

        function removeCompiledElement(componentId, editorId, elementId) {
            var item = ssbService.compiledElements[componentId][editorId][elementId];
            if (item) {
                item.remove();
                item = null;
                delete ssbService.compiledElements[componentId][editorId][elementId];
            }
        }

        function removeCompiledElementEditControl(componentId, editorId, elementId) {
            var item;

            try {
                item = ssbService.compiledElementEditControls[componentId][editorId][elementId];
            } catch(e) {
                item = null;
            }

            if (item) {

                item.remove();
                item = null;
                delete ssbService.compiledElementEditControls[componentId][editorId][elementId];

            }
        }

        function addUnderNavSetting(masthead_id, fn) {
            var data = {
                allowUndernav : false,
                navComponent: null
            };

            if (ssbService.page && ssbService.page.sections) {
                ssbService.page.sections.forEach(function (sectionValue, sectionIndex) {
                    sectionValue.components.forEach(function (value) {
                        if (value && value.type === 'masthead' && value._id == masthead_id && ssbService.page.sections[sectionIndex - 1]) {
                            var navComponent = _.findWhere(ssbService.page.sections[sectionIndex - 1].components, { type: 'navigation' });
                            if (
                                sectionIndex !== 0 &&
                                navComponent !== undefined
                            ) {
                                data.allowUndernav = true;
                                data.navComponent = navComponent;
                            } else {
                                data.allowUndernav = false;
                            }
                        }
                    });
                });
            }

            fn(data);
        }

        /**
         * Get list of page versions
         *
         */
        function getPageVersions(pageId, fn) {

          function success(data) {
            console.log('SimpleSiteBuilderService getPageVersions: ' + data);
            fn(data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService getPageVersions error: ', JSON.stringify(error));
          }

          return (
            ssbRequest($http({
              url: basePageAPIUrlv2 + [pageId, 'versions'].join('/'),
              method: 'GET',
            }).success(success).error(error))
          );
        }

        /**
         *Revert page
         *
         */
        function revertPage(pageId, versionId, fn) {

          function success(data) {

            console.log('SimpleSiteBuilderService revertPage: ' + data);
            fn(data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService revertPage error: ', JSON.stringify(error));
          }

          return (
            ssbRequest($http({
              url: basePageAPIUrlv2 + [pageId, 'version', versionId].join('/'),
              method: 'POST',
            }).success(success).error(error))
          );
        }

        /**
         * Publish page
         *
         */
        function publishPage(pageId) {

          function success(data) {
            console.log('SimpleSiteBuilderService publishPage: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService publishPage error: ', JSON.stringify(error));
          }

          return (
            ssbRequest($http({
              url: basePageAPIUrlv2 + [pageId, 'publish'].join('/'),
              method: 'POST',
            }).success(success).error(error))
          );
        }

        function updateBlogPages() {

          function success(data) {
            console.log('SimpleSiteBuilderService updateBlogPages: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService updateBlogPages error: ', JSON.stringify(error));
          }

          return (
            ssbRequest($http({
              url: baseWebsiteAPIUrlv2 + [ssbService.websiteId, 'updateBlogPages'].join('/'),
              method: 'POST',
            }).success(success).error(error))
          );
        }
        /**
         * detect IE
         * returns version of IE or false, if browser is not Internet Explorer
         *
         * Note: remove me
         *  - found here: http://codepen.io/gapcode/pen/vEJNZN
         */
        function detectIENotEdge() {
            var ua = window.navigator.userAgent;

            // Test values; Uncomment to check result …

            // IE 10
            // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

            // IE 11
            // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

            // IE 12 / Spartan
            // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

            // Edge (IE 12+)
            // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                // return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
                return true;
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                //var rv = ua.indexOf('rv:');
                // return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
                return true;
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                // return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
                return false;
            }

            // other browser
            return false;
        }

        function getBlogListPage() {
            return _.where(ssbService.pages, {
                handle: 'blog-list'
            });
        }

        function getBlogPostPage() {
            return _.where(ssbService.pages, {
                handle: 'blog-post'
            });
        }

        function returnInvalidPost(){
            var deferred = $q.defer();
            deferred.resolve(false);
            return deferred.promise;
        }

        function getTempComponent(component){
            return getComponent(component, component.version || 1).then(function(result) {
                return result.data;
            });
        }

        function setDeletedPageFromLinkList(handle){
            // Special case for blog link
            if(handle === "blog")
            {
                handle = "blog-list";
            }
            ssbService.deletedNavLinks.push(handle);
        }

        function resetDeletedPageLinkList(){
            ssbService.deletedNavLinks = [];
        }

        function checkIfDiffrentLenthSection(section){
            return section && section.title === 'Donate Button';
        }

        function getAccount(){
            AccountService.getAccount(function(data) {
                ssbService.account = null;
                $timeout(function() {
                    ssbService.account = data;
                },0);
            });
        }


        $rootScope.$on('$ssbAccountUpdated', function(event, account) {
            AccountService.getAccount(function(data) {
                ssbService.account = null;
                $timeout(function() {
                    ssbService.account = data;
                },0);
            });
        });

        $rootScope.$on('$refreshCustomFonts', function(event, account) {
            ssbService.getCustomFonts(true);
        });


        function getCustomFonts(reload) {

          function success(data) {
            ssbService.customFonts = data;
            console.log('SimpleSiteBuilderService getCustomFonts: ' + data);
          }

          function error(error) {
            console.error('SimpleSiteBuilderService getCustomFonts error: ', JSON.stringify(error));
          }

          return (
            ssbRequest($http({
              url: baseAssetsAPIUrl,
              method: 'GET',
            }).success(success).error(error))
          );

        }


        (function init() {

            AccountService.getAccount(function(data) {
                ssbService.account = data;
                ssbService.orgId = data.orgId;
                ssbService.setPermissions();
                        ssbService.websiteId = data.website.websiteId;
                ssbService.getSite(data.website.websiteId).then(function(website){
                    ssbService.setupTheme(website);
                });
                ssbService.getPages();
                ssbService.getTemplates();
                ssbService.getLegacyTemplates();
                ssbService.getPlatformSections();
                ssbService.getCustomFonts();

            });

        })();


        return ssbService;
    }

})();
