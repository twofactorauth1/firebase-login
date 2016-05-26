(function(){

app.controller('SiteBuilderComponentLoaderController', ssbComponentLoaderController);

ssbComponentLoaderController.$inject = ['$rootScope', '$scope', '$attrs', '$filter'];
/* @ngInject */
function ssbComponentLoaderController($rootScope, $scope, $attrs, $filter) {

    console.info('component-loader directive init...')

    var vm = this;

    vm.init = init;
    vm.hover = hover;

    function hover(e) {

    }

    function init(element) {
    	vm.element = element;
    }

}

})();
