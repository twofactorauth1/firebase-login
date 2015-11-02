(function(){

app.controller('SiteBuilderController', ssbSiteBuilderController);

ssbSiteBuilderController.$inject = ['$scope', '$rootScope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams'];
/* @ngInject */
function ssbSiteBuilderController($scope, $rootScope, $attrs, $filter, SimpleSiteBuilderService, $stateParams) {

    console.info('site-build directive init...')

    var vm = this;

    vm.init = init;
    vm.state = {};
    vm.uiState = {
        show: {
            flyover: true,
            sidebar: true
        }
    };
    vm.toggleSidebarFlyover = toggleSidebarFlyover;

    $scope.$watch(function() { return SimpleSiteBuilderService.website; }, function(website){
        vm.state.originalWebsite = angular.copy(website);
        vm.state.pendingChanges = false;
        vm.state.website = website;
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.page; }, function(page){
        vm.state.originalPage = angular.copy(page);
        vm.state.pendingChanges = false;
        vm.state.page = page;
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.activeSection; }, function(activeSection){
        vm.state.activeSection = activeSection;
    });

    $scope.$watch('vm.state.page', function(page) {
        if (!angular.equals(page, vm.state.originalPage)) {
            vm.state.pendingChanges = true;
        } else {
            vm.state.pendingChanges = false;
        }
    }, true);

    $scope.$watch('vm.state.website', function(website) {
        if (!angular.equals(website, vm.state.originalWebsite)) {
            vm.state.pendingChanges = true;
        } else {
            vm.state.pendingChanges = false;
        }
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

    function toggleSidebarFlyover() {
        vm.uiState.show.flyover = !vm.uiState.show.flyover;
    	vm.uiState.show.sidebar = !vm.uiState.show.sidebar;
    }

}

})();