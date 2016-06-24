(function () {

    app.controller('EmailBuilderComponentLoaderController', emailbComponentLoaderController);

    emailbComponentLoaderController.$inject = ['$rootScope', '$scope', '$attrs', '$filter'];
    /* @ngInject */
    function emailbComponentLoaderController($rootScope, $scope, $attrs, $filter) {

        console.info('component-loader directive init...');

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
