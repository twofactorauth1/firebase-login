(function(){

app.controller('IndiLoginModalController', indiLoginModalController);

indiLoginModalController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'IndiLoginModalService', 'authService'];
/* @ngInject */
function indiLoginModalController($scope, $attrs, $filter, $document, $timeout, toaster, IndiLoginModalService, authService) {

    console.info('indi-login-modal directive init...')

    var vm = this;

    vm.init = init;
    vm.onload = onload;
    vm.setupModalEvents = setupModalEvents;
    vm.closeModal = closeModal;

    vm.uiState = {
        loading: true
    }

    vm.unbindModalWatcher = $scope.$watch(function() { IndiLoginModalService.getModalInstance(); }, function(modalInstance) {
        if (modalInstance) {
            vm.setupModalEvents(modalInstance);
        }
    });

    function setupModalEvents(modalInstance) {
        vm.modalInstance = modalInstance;
        vm.modalInstance.result.then(
            function(results){
                console.log('modal closed', results);
            },
            function(error){
                console.log('modal error', error);
            }
        );
    }

    function closeModal() {
        IndiLoginModalService.closeModal();
        vm.unbindModalWatcher();
        vm.loginIframe = null;
        vm.loginIframeContentWindow = null;
    }

    function login(e) {

        console.debug('login');

        $timeout(function() {
            vm.uiState.loading = true;
        });

    }

    function onload(e) {

        vm.loginIframeContentWindow = vm.loginIframe.get(0).contentWindow;

        $timeout(function() {

            vm.uiState.loading = false;

            //if iframe is at login screen
            if (vm.loginIframeContentWindow.location.pathname === '/login') {

                overrideLoginStyles();

            //if iframe is at any other admin page
            } else if(vm.loginIframeContentWindow.location.pathname.indexOf('/admin') !== -1) {

                authService.loginConfirmed();

                vm.closeModal();

                toaster.pop('success', 'Signed in', 'Sign in successful.');

            } else {

                vm.closeModal();

                toaster.pop('success', 'Not Signed in', 'Sign in failed. Please try again.');

            }

        });

    }

    function overrideLoginStyles() {
        var contents = vm.element.find('iframe').contents();
        var loginHTMLEl = contents.find('html');
        var loginButton = contents.find('button[type="submit"');

        loginHTMLEl.addClass('is-indi-modal');
        loginButton.on('click', login);

    }

    function init(element) {

        vm.element = element;
        vm.loginIframe = vm.element.find('iframe');
        vm.loginIframe.on('load', vm.onload);

    }

}

})();
