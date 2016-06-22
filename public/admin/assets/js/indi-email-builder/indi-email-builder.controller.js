(function () {

    app.controller('EmailBuilderController', indiEmailBuilderController);

    indiEmailBuilderController.$inject = ['$scope', '$rootScope', 'EmailBuilderService', '$stateParams'];
    /* @ngInject */
    function indiEmailBuilderController($scope, $rootScope, EmailBuilderService, $stateParams) {

        console.info('email-builder directive init...');

        var vm = this;

        vm.init = init;
        vm.emailId = $stateParams.id;
        vm.dataLoaded = false;
        vm.email = null;
        vm.froalaConfig = angular.copy($.FroalaEditor.config);
        _.extend(vm.froalaConfig, {toolbarInline: false, scrollableContainer: '#email-froala-scrollable-container', placeholderText: 'Type your email here'});

        function init(element) {
            vm.element = element;
            vm.element.find('#email-froala-editor').froalaEditor(vm.froalaConfig);
            EmailBuilderService.getEmail(vm.emailId)
                    .then(function (res) {
                        vm.email = res.data;
                        vm.dataLoaded = true;
                    });
        }


    }

})();
