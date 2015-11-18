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

        // {'padding-top': component.spacing.pt + 'px',
        // 'padding-bottom': component.spacing.pb + 'px',
        // 'padding-left': component.spacing.pl + 'px',
        // 'padding-right': component.spacing.pr + 'px',
        // 'margin-top': component.spacing.mt + 'px',
        // 'margin-bottom': component.spacing.mb + 'px',
        // 'margin-left': component.spacing.ml == 'auto' ? component.spacing.ml: component.spacing.ml + 'px',
        // 'margin-right': component.spacing.mr == 'auto' ? component.spacing.mr : component.spacing.mr + 'px',
        // 'max-width': component.spacing.mw == '100%' ? component.spacing.mw : component.spacing.mw  + 'px'}

        return ngClass;
    }

    function componentClass(index) {
        // console.log('index: ' + index);
        // console.log('vm.uiState.activeComponentIndex: ' + vm.uiState.activeComponentIndex);
        var ngClass = {
            'ssb-active-component': (index === vm.uiState.activeComponentIndex)
            // 'ssb-active-component': (index === vm.page.sections[vm.uiState.activeComponentIndex].components[vm.uiState.activeComponentIndex])
        };

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