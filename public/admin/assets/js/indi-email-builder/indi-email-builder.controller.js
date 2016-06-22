(function () {

    app.controller('EmailBuilderController', indiEmailBuilderController);

    indiEmailBuilderController.$inject = ['$scope', '$rootScope', 'EmailBuilderService', '$stateParams'];
    /* @ngInject */
    function indiEmailBuilderController($scope, $rootScope, EmailBuilderService, $stateParams) {

        console.info('email-builder directive init...');

        var vm = this;

        vm.init = init;
        vm.emailId = $stateParams.id;
        vm.email = null;

        function init(element) {
            vm.element = element;
            vm.element.find('#email-froala-editor').froalaEditor($.FroalaEditor.configEmail);
            EmailBuilderService.getEmail(vm.emailId)
                    .then(function (res) {
                        vm.email = res.data;
                    });
        }


    }

})();
