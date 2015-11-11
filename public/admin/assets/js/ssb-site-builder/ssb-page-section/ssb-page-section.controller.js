(function(){

app.controller('SiteBuilderPageSectionController', ssbPageSectionController);

ssbPageSectionController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams', '$transclude'];
/* @ngInject */
function ssbPageSectionController($scope, $attrs, $filter, SimpleSiteBuilderService, $stateParams, $transclude) {

    console.info('page-section directive init...')

    var vm = this;

    vm.init = init;
    vm.componentClass = componentClass;
    vm.sectionClass = sectionClass;
    

    function sectionClass(layout) {
        var ngClass = {};

        ngClass['ssb-page-section-layout-' + layout] = true;

        return ngClass;
    }

    function componentClass(index) {
        var ngClass = {};

        if (vm.section.layout === '1-col') {
            ngClass['col-md-12'] = true;
        }

        if (vm.section.layout === '2-col') {
            ngClass['col-md-6'] = true;
        }

        if (vm.section.layout === '3-col') {
            ngClass['col-md-4'] = true;
        }

        ngClass['ssb-component-index-' + index] = true;

        return ngClass;
    }

    function init(element) {
    	vm.element = element;
    }

}

})();