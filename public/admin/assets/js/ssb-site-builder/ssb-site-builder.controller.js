app.controller('SiteBuilderController', ssbSiteBuilderController);

ssbSiteBuilderController.$inject = ['$scope', '$rootScope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams'];
/* @ngInject */
function ssbSiteBuilderController($scope, $rootScope, $attrs, $filter, SimpleSiteBuilderService, $stateParams) {

    console.info('site-build directive init...')

    var vm = this;

    vm.init = init;
    vm.uiState = {};

    $scope.$watch(function() { return SimpleSiteBuilderService.website; }, function(website){
        vm.website = website;
    }, true);

    $scope.$watch(function() { return SimpleSiteBuilderService.page; }, function(page){
        vm.page = page;
    }, true);

    $rootScope.$on('$stateChangeStart',
        function (event) {
            $rootScope.app.layout.isSidebarClosed = vm.uiState.isSidebarClosed;
        }
    );

    function init(element) {
    	vm.element = element;
        vm.uiState.isSidebarClosed = $rootScope.app.layout.isSidebarClosed;
        $rootScope.app.layout.isSidebarClosed = true;
    }

}