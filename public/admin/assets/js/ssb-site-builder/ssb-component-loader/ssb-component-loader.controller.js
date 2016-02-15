(function(){

app.controller('SiteBuilderComponentLoaderController', ssbComponentLoaderController);

ssbComponentLoaderController.$inject = ['$scope', '$attrs', '$filter'];
/* @ngInject */
function ssbComponentLoaderController($scope, $attrs, $filter) {

    console.info('component-loader directive init...')

    var vm = this;

    vm.init = init;
    vm.hover = hover;

    function hover(e) {

        if (vm.state && vm.uiState) {

            vm.uiState.hoveredSectionIndex = _(vm.state.page.sections).chain()
                .pluck('components')
                .map(function(components){
                    return _.pluck(components, '_id')
                })
                .findIndex(function(component) {
                    return -1 !== _.indexOf(component, vm.component._id)
                })
                .value()

            vm.uiState.hoveredComponentIndex = _(vm.state.page.sections[vm.uiState.hoveredSectionIndex].components).chain()
                .findIndex(function(component) {
                    return component._id === vm.component._id
                })
                .value()

            vm.uiState.hoveredComponentOffset = vm.element.offset();
            vm.uiState.hoveredComponentPosition = vm.element.position();
            vm.uiState.hoveredComponentParent = vm.element.offsetParent();

            // console.log('hovered on ' + vm.component.type);
            // console.log('vm.uiState.hoveredSectionIndex', vm.uiState.hoveredSectionIndex);
            // console.log('vm.uiState.hoveredComponentIndex', vm.uiState.hoveredComponentIndex);
            // console.log('vm.uiState.hoveredComponentOffset', vm.uiState.hoveredComponentOffset);
            // console.log('vm.uiState.hoveredComponentParent', vm.uiState.hoveredComponentParent);

        }

    }

    function init(element) {
    	vm.element = element;
    }

}

})();
