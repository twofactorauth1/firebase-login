(function () {

    app.controller('EmailBuilderComponentLoaderController', emailbComponentLoaderController);

    emailbComponentLoaderController.$inject = ['$rootScope', '$scope', '$attrs', '$filter', '$timeout'];
    /* @ngInject */
    function emailbComponentLoaderController($rootScope, $scope, $attrs, $filter, $timeout) {

        console.info('component-loader directive init...');

        var vm = this;

        vm.init = init;
//        vm.hoverFn = hoverFn;
//        vm.clickFn = clickFn;
//        vm.selector = '#email-component_' + vm.component._id;
//
//        vm.froalaConfig = angular.copy($.FroalaEditor.config);
////        vm.froalaConfig.scrollableContainer = '#email-froala-scrollable-container';
//        _.extend(vm.froalaConfig, {toolbarInline: false, scrollableContainer: '#email-froala-scrollable-container',  toolbarContainer: '#email-froala-container', placeholderText: 'Type your email here'});
//
//        function hoverFn(e) {}
//
//        function clickFn(e) {
////            $('.email-component').froalaEditor('destroy');
//            e.stopPropagation();
//            if (!$(vm.selector).data('froala.editor')) {
//                $(vm.selector).froalaEditor(vm.froalaConfig);
//                console.info('froala initiated for', vm.selector);
//            }
//        }

        function init(element) {
            vm.element = element;
        }

    }

})();
