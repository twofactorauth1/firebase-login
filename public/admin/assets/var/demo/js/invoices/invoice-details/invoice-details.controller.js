(function(){

app.controller('InvoiceDetailsController', invoiceDetailsController);

invoiceDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'InvoiceService', 'CustomersService'];
/* @ngInject */
function invoiceDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, InvoiceService, CustomersService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.customerId);

    vm.uiState = {loading: true};

    vm.backToInvoices = backToInvoices;
    vm.calculateTotal = calculateTotal;
    vm.parseValueToFloat = parseValueToFloat;
    vm.parseValueToDate = parseValueToDate;


    function backToInvoices(){
        $state.go("app.customers");
    }

    function init(element) {
        vm.element = element;
        InvoiceService.viewCustomerInvoice($stateParams.customerId).then(function(response){
            var invoice = response.data.response.payload.querydata.data;
            if(invoice && invoice.row){
                if(angular.isArray(invoice.row)){
                    vm.invoice = invoice
                }
                else{
                    vm.invoice = {
                        row: [
                            invoice.row
                        ]
                    }
                }
                vm.totalLineOrder = calculateTotal(vm.invoice);
                vm.uiState.loading = false;
            }
            else{
                $scope.$watch(function() { return CustomersService.customers }, function(customers) {
                    if(angular.isDefined(customers)){
                        vm.listInvoice = _.find(CustomersService.customers, function(customer){
                            return customer.OCRD_CardCode.toLowerCase() == $stateParams.customerId.toLowerCase()
                        })
                    }
                    vm.uiState.loading = false;
                }, true);
            }
            
        })
    }

    function calculateTotal(orders){
        var _sum = 0;
        _.each(orders.row, function(order){
            _sum+= parseFloat(order.INV1_LineTotal)
        })
        return _sum;
    }

    function parseValueToFloat(value){
        if(value){
            return parseFloat(value);
        }
    }

    function parseValueToDate(value){
        if(value){
            var formattedDate = Date.parse(value); // "M/d/yyyy h:mm:ss a"
            return formattedDate;
        }
    }


}

})();
