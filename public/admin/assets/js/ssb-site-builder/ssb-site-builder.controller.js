app.controller('SiteBuilderController', ssbSiteBuilderController);

ssbSiteBuilderController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams'];
/* @ngInject */
function ssbSiteBuilderController($scope, $attrs, $filter, SimpleSiteBuilderService, $stateParams) {

    console.info('site-build directive init...')

    var vm = this;

    vm.init = init;

    $scope.$watch(function() { return SimpleSiteBuilderService.website; }, function(website){
        vm.website = website;
    }, true);

    $scope.$watch(function() { return SimpleSiteBuilderService.page; }, function(page){
        vm.page = page;
    }, true);

    function init(element) {
    	vm.element = element;
    }

}