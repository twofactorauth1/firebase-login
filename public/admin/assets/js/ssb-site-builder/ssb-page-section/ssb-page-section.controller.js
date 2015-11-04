(function(){

app.controller('SiteBuilderPageSectionController', ssbPageSectionController);

ssbPageSectionController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams', '$transclude'];
/* @ngInject */
function ssbPageSectionController($scope, $attrs, $filter, SimpleSiteBuilderService, $stateParams, $transclude) {

    console.info('page-section directive init...')

    var vm = this;

    console.info('page-section components:')
    console.info(vm.components);
    console.info('page-section layout:');
    console.info(vm.layout);

    vm.init = init;

    function init(element) {
    	vm.element = element;
    }

}

})();