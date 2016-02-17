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
    indiService.enqueueFailed401Request = enqueueFailed401Request;
    indiService.resolveFailed401Requests = resolveFailed401Requests;

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
        indiService.resolveFailed401Requests();
    }

    function enqueueFailed401Request(request) {
        indiService.queue.push(request);
    }

    function resolveFailed401Requests() {
        debugger;
        var requests = indiService.queue.map(function(request) {
            return $http(request.config);
        });

        indiService.queue = [];

        debugger;

        return $q.all(requests);
    }

    return indiService;

}

})();
