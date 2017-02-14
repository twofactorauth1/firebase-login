(function(){

app.controller('SiteBuilderAccountTemplatesController', ssbSiteBuilderAccountTemplatesController);

ssbSiteBuilderAccountTemplatesController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert', 'ContactService' ];
/* @ngInject */
function ssbSiteBuilderAccountTemplatesController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert, ContactService) {

    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.init = init;
    vm.selectAccountTemplate = selectAccountTemplate;
    vm.getAccountTemplates = getAccountTemplates;
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
            pages = _.reject(pages, function(page){ return page.handle === "blog" || page.handle === "single-post"
                || page.handle === "coming-soon" || page.handle === "signup" || page.handle === 'blog-list' || page.handle === 'blog-post'});
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
    function getAccountTemplates() {
        SimpleSiteBuilderService.getAccountTemplates().then(function(accountTemplates) {
            if (accountTemplates.data) {
                vm.state.accountTemplates = accountTemplates.data.reverse();
            }
        });
    }

    /*
     * Select Account Template
     *     
     */
    function selectAccountTemplate(templateId) {
        vm.uiState.loading = true;
        SimpleSiteBuilderService.copyAccountTemplate(templateId).then(function(response) {
            console.log(response.data);
            if (response.data) {
                //get all pages
                SimpleSiteBuilderService.getPages().then(function(pages){
                    vm.state.pages = pages.data;
                    //get latest website
                    SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){

                        //set theme
                        SimpleSiteBuilderService.setupTheme(vm.state.website).then(function() {

                            //forward to editor
                            vm.redirectToEditor();

                            //clear loading var
                            $timeout(function() {
                                vm.uiState.loading = false;
                            }, 5000);

                        });
                    });
                })

                
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

        if (id) {
            $location.path('/website/site-builder/pages/' + id);
        } else {
            vm.uiState.loading = false;
        }

    }

    function init(element) {

        vm.element = element;

        vm.getAccountTemplates();

        if(SimpleSiteBuilderService.pages === null){
            SimpleSiteBuilderService.getPages();
        }

    }
}

})();
