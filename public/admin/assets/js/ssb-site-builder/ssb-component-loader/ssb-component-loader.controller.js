(function(){

app.controller('SiteBuilderComponentLoaderController', ssbComponentLoaderController);

ssbComponentLoaderController.$inject = ['$scope', '$attrs', '$filter'];
/* @ngInject */
function ssbComponentLoaderController($scope, $attrs, $filter) {

    console.info('component-loader directive init...')

    var vm = this;

    vm.init = init;

    function init(element) {
    	vm.element = element;
    }

}

})();