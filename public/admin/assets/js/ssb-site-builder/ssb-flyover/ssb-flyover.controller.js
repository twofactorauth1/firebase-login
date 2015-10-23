(function(){

app.controller('SiteBuilderFlyoverController', ssbSiteBuilderFlyoverController);

ssbSiteBuilderFlyoverController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilderFlyoverController($scope, $attrs, $filter, SimpleSiteBuilderService) {

    console.info('site-build flyover directive init...')

    var vm = this;

    vm.somethingFlyover = 'something flyover';
    vm.init = init;

    function init(element) {
    	console.log(element);
    	console.log(vm.website);
    	console.log(vm.page);
    }

}

})();