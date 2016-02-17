(function(){

app.controller('IndiLoginModalController', indiLoginModalController);

indiLoginModalController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'IndiLoginModalService'];
/* @ngInject */
function indiLoginModalController($scope, $attrs, $filter, $document, $timeout, toaster, IndiLoginModalService) {

    console.info('indi-login-modal directive init...')

    var vm = this;

    vm.init = init;
    vm.onload = onload;
    vm.onunload = onunload;
    vm.setupModalEvents = setupModalEvents;
    vm.closeModal = closeModal;

    vm.uiState = {
        loading: true
    }

    $scope.$watch(function() { IndiLoginModalService.getModalInstance(); }, function(modalInstance) {
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
    }

    function login(e) {
        console.debug('login');
        vm.uiState.loading = true;
    }

    function onload(e) {
        debugger;
        vm.uiState.loading = false;
        overrideLoginStyles();
    }

    function onunload(e) {
        debugger;
        // IndiLoginModalService.closeModal();
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
        vm.loginIframe.on('load', onload);
        vm.loginIframe.on('unload', onunload);

    }

}

})();
