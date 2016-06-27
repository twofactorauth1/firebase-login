(function () {

    app.controller('EmailBuilderComponentLoaderController', emailbComponentLoaderController);

    emailbComponentLoaderController.$inject = ['$rootScope', '$scope', '$attrs', '$filter'];
    /* @ngInject */
    function emailbComponentLoaderController($rootScope, $scope, $attrs, $filter) {

        console.info('component-loader directive init...');

        var vm = this;

        vm.init = init;
        vm.hoverFn = hoverFn;
        vm.clickFn = clickFn;

        function hoverFn(e) {
            console.log('Hovered', e);
        }
        
        function clickFn(e) {
            console.info('Clicked', e);
        }

        function init(element) {
            vm.element = element;
        }

    }

})();
