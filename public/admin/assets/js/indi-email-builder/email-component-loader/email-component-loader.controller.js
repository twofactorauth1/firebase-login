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
        vm.selector = '#email-component_' + vm.component._id;

        vm.froalaConfig = angular.copy($.FroalaEditor.config);
        _.extend(vm.froalaConfig, {toolbarInline: false, scrollableContainer: '#email-froala-scrollable-container', placeholderText: 'Type your email here'});

        function hoverFn(e) {}

        function clickFn(e) {
            $('.email-component').froalaEditor('destroy');
            $(vm.selector).froalaEditor(vm.froalaConfig);
        }

        function init(element) {
            vm.element = element;
        }

    }

})();
