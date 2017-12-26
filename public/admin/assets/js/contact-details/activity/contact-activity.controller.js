(function(){

app.controller('ContactActivityController', contactActivityController);

contactActivityController.$inject = ['$scope', '$state', '$window', '$modal', '$stateParams', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'ContactService'];
/* @ngInject */
function contactActivityController($scope, $state, $window, $modal, $stateParams, $attrs, $filter, $document, $timeout, toaster, ContactService) {

    console.info('contact-activity directive init...')

    var vm = this;
    vm.state ={

    };
    vm.init = init; 

    function init(element) {
        vm.element = element;
        ContactService.getContact(vm.contactId, function (contact, error) {
    		vm.state.contact = contact;
    	})
    }

}

})();
