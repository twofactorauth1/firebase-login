(function(){

app.controller('InvoiceComponentController', invoiceComponentController);

invoiceComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'InvoiceService'];
/* @ngInject */
function invoiceComponentController($scope, $attrs, $filter, $modal, $timeout, $location, InvoiceService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    function init(element) {
        vm.element = element;
    }

}

})();