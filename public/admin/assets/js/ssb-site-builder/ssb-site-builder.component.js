app.directive('ssbSiteBuilder', ssbSiteBuilder);

ssbSiteBuilder.$inject = ['$filter', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilder($filter, SimpleSiteBuilderService) {

    return {
        scope: {},
        templateUrl: 'assets/js/ssb-site-builder/ssb-site-builder.component.html',
        controller: function($scope) {
            
            console.info('site-build directive init...')

            var vm = this;
            
            $scope.$watch(function() { return SimpleSiteBuilderService.website; }, function(website){
                vm.website = website;
            }, true);

        },
        controllerAs: 'vm',
        bindToController: true
    };

}