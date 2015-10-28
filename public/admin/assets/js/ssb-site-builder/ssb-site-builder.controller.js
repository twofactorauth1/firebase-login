(function(){

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
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.page; }, function(page){
        vm.page = page;
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.activeSection; }, function(activeSection){
        vm.activeSection = activeSection;
    });

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

})();