(function(){

app.controller('SiteBuilderCustomComponentLoaderController', ssbCustomComponentLoaderController);

ssbCustomComponentLoaderController.$inject = ['$rootScope', '$scope', '$attrs', '$filter'];
/* @ngInject */
function ssbCustomComponentLoaderController($rootScope, $scope, $attrs, $filter) {

    console.info('custom-component-loader directive init...')

    var vm = this;

    vm.init = init;

    function init(element) {
    	vm.element = element;
    }

}

})();
