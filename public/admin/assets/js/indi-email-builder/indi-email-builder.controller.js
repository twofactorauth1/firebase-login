(function () {

    app.controller('EmailBuilderController', indiEmailBuilderController);

    indiEmailBuilderController.$inject = ['$scope', '$rootScope', 'EmailBuilderService'];
    /* @ngInject */
    function indiEmailBuilderController($scope, $rootScope, EmailBuilderService) {

        console.info('email-builder directive init...');

        var vm = this;

        vm.init = init;

        function init(element) {
            vm.element = element;
            vm.element.find('#email-froala-editor').froalaEditor($.FroalaEditor.configEmail);
        }


    }

})();
