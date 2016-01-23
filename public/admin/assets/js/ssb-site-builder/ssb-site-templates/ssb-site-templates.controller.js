(function(){

app.controller('SiteBuilderSiteTemplatesController', ssbSiteBuilderSiteTemplatesController);

ssbSiteBuilderSiteTemplatesController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert', 'CustomerService' ];
/* @ngInject */
function ssbSiteBuilderSiteTemplatesController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert, CustomerService) {

    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.init = init;
    vm.selectSiteTemplate = selectSiteTemplate;
    vm.getSiteTemplates = getSiteTemplates;
    vm.redirectToEditor = redirectToEditor;


    vm.state = {};
    vm.uiState = {};


    var unbindPagesWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.pages }, function(pages) {
        if (pages) {

            unbindPagesWatcher();

            vm.state.pages = pages;

        }
    }, true);

    var unbindWebsiteWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.website }, function(website) {
        if (website && website._id) {

            unbindWebsiteWatcher();

            if (website.siteTemplateId) {
                vm.redirectToEditor();
            }

            vm.state.website = website;

        }
    }, true);

    /*
     * Get Site Templates
     */
    function getSiteTemplates() {
        SimpleSiteBuilderService.getSiteTemplates().then(function(siteTemplates) {
            if (siteTemplates.data) {
                vm.state.siteTemplates = siteTemplates.data;
            }
        });
    }

    /*
     * Select Site Template
     *
     * - set template on website
     * - check response has created index page handle
     * - get latest website from server (so it includes latest linkLists and themeId)
     * - get latest theme data for that theme
     * - forward to editor with index page active
     *
     * - TODO: can optimize this when theme is materialized on website response
     */
    function selectSiteTemplate(templateId) {
        vm.uiState.loading = true;
        SimpleSiteBuilderService.setSiteTemplate(templateId).then(function(response) {
            console.log(response.data);
            if (response.data.ok && response.data.indexPageId) {
                SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                    SimpleSiteBuilderService.setupTheme().then(function() {

                        $timeout(function() {
                            $location.path('/website/site-builder/pages/' + response.data.indexPageId);
                        }, 500);

                        $timeout(function() {
                            vm.uiState.loading = false;
                        }, 2000);

                    });
                });
            }
        });
    }

    function redirectToEditor() {
        var id = '';
        var homePage = null;
        var pagesArray = [];

        if (vm.state.pages) {
           pagesArray =  Object.keys(vm.state.pages);
        }

        if (pagesArray.length) {

            homePage = _.filter(vm.state.pages, function(page) {
              return page.handle === 'index'
            })[0];

            //if we have a home page
            if (homePage && homePage._id) {
                id = homePage._id;
            // else return first page in object
            } else {
                id = vm.state.pages[pagesArray[0]]._id;
            }

        }

        $location.path('/website/site-builder/pages/' + id);
    }

    function init(element) {

        vm.element = element;

        vm.getSiteTemplates();

    }
}

})();
