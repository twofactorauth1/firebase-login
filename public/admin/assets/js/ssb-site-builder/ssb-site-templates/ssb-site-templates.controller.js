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
    vm.uiState = {
        loading: true
    };


    var unbindWatcher = $scope.$watchGroup([
        function() { return SimpleSiteBuilderService.pages },
        function() { return SimpleSiteBuilderService.website }
        ], function(values) {

        var pages = values[0];
        if(pages)
        {
            delete pages["blog"];
            delete pages["single-post"];
            delete pages["coming-soon"];
        }
        var website = values[1];

        if (pages && website && website._id) {

            unbindWatcher();

            vm.state.pages = pages;
            vm.state.website = website;

            if (Object.keys(pages).length !== 0 || website.siteTemplateId) {
                vm.redirectToEditor();
            } else {
                vm.uiState.loading = false;
            }

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
     * - get latest pages from server
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
                //get all pages
                SimpleSiteBuilderService.getPages();

                //get latest website
                SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){

                    //set theme
                    SimpleSiteBuilderService.setupTheme(vm.state.website).then(function() {

                        //forward to editor
                        $timeout(function() {
                            $location.path('/website/site-builder/pages/' + response.data.indexPageId);
                        }, 500);

                        //clear loading var
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
