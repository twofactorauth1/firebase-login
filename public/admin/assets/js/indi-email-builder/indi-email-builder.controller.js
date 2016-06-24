(function () {

    app.controller('EmailBuilderController', indiEmailBuilderController);

    indiEmailBuilderController.$inject = ['$scope', 'EmailBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal'];
    /* @ngInject */
    function indiEmailBuilderController($scope, EmailBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal) {

        console.info('email-builder directive init...');

        var vm = this;

        vm.init = init;
        vm.emailId = $stateParams.id;
        vm.dataLoaded = false;
        vm.account = null;
        vm.website = null;
        vm.email = null;
        vm.modalInstance = null;
        vm.openModalFn = openModalFn;
        vm.closeModalFn = closeModalFn;

        vm.froalaConfig = angular.copy($.FroalaEditor.config);
        _.extend(vm.froalaConfig, {toolbarInline: false, scrollableContainer: '#email-froala-scrollable-container', placeholderText: 'Type your email here'});

        function openModalFn(modalId) {
            vm.modalInstance = $modal.open({
                templateUrl: modalId,
                keyboard: true,
                size: 'lg',
                scope: $scope
            });
        }

        function closeModalFn() {
            if (vm.modalInstance) {
                vm.modalInstance.close();
            }
        }

        function init(element) {
            vm.element = element;
            vm.element.find('#email-froala-editor').froalaEditor(vm.froalaConfig);

            AccountService.getAccount(function (data) {
                vm.account = data;
            });

            WebsiteService.getWebsite(function (data) {
                vm.website = data;
            });

            EmailBuilderService.getEmail(vm.emailId)
                    .then(function (res) {
                        if (!res.data._id) {
                            toaster.pop('error', 'Email not found');
                            $state.go('app.emails');
                        }
                        vm.email = res.data;
                        vm.dataLoaded = true;
                    }, function (err) {
                        $state.go('app.emails');
                    });
        }


    }

})();
