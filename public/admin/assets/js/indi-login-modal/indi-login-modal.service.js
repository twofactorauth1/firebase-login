(function(){

app.factory('IndiLoginModalService', indiLoginModalService);

indiLoginModalService.$inject = ['$rootScope', '$http', '$q', '$timeout',];
/* @ngInject */
function indiLoginModalService($rootScope, $http, $q, $timeout) {

    console.info('indi-login-modal service init...');

    var indiService = this;
    indiService.setModalInstance = setModalInstance;
    indiService.getModalInstance = getModalInstance;
    indiService.closeModal = closeModal;

    indiService.queue = [];


    function setModalInstance(modalInstance) {
        indiService.modalInstance = modalInstance;
    }

    function getModalInstance() {
        return indiService.modalInstance
    }

    function closeModal() {
        indiService.modalInstance.close();
        indiService.modalInstance = undefined;
    }

    return indiService;

}

})();
