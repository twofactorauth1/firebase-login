(function(){

app.controller('SiteBuilderTopbarController', ssbSiteBuilderTopbarController);

ssbSiteBuilderTopbarController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$modal', '$location', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderTopbarController($scope, $attrs, $filter, SimpleSiteBuilderService, $modal, $location, SweetAlert) {

    console.info('site-build topbar directive init...')

    var vm = this;

    vm.init = init;


    function init(element) {
    	vm.element = element;
    }

}

})();
