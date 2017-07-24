(function(){

app.controller('LedgerDetailsController', ledgerDetailsController);

ledgerDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'toaster', 'LedgerService'];
/* @ngInject */
function ledgerDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, toaster, LedgerService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.customerId);
    vm.state = {};
    vm.uiState = {loading: true};
    vm.customerId = $stateParams.customerId;
    vm.backToCustomers = backToCustomers;

    vm.parseValueToFloat = parseValueToFloat;
    vm.parseValueToDate = parseValueToDate;
    vm.viewInventoryDetails = viewInventoryDetails;
    vm.calculateLedgerTotal = calculateLedgerTotal;
    vm.exportCSV = exportCSV;

    function backToCustomers(){
        $state.go("app.customers");
    }

    function exportCSV(){
        LedgerService.exportCustomerStatement(vm.customerId);
    }

    function init(element) {
        vm.element = element;

        LedgerService.getLedgerDetails(vm.customerId).then(function(response){
            var ledger = response.data.results;
            if(ledger && ledger.length){
                vm.ledger = ledger;
                vm.uiState.loading = false;
            }
            else{
                LedgerService.getCustomerDetails(vm.customerId).then(function(response){
                    vm.listledger = response.data;
                    vm.uiState.loading = false;
                })
            }
        }).catch(function(error) {
            vm.uiState.loading = false;
            if(error.data && error.data.message)
                toaster.pop('error', 'Error', error.data.message);
        });
    }

    vm.getters = {
        dueDate: function (value) {
            return value._CustStatmentDtl_DueDate ? parseValueToDate(value._CustStatmentDtl_DueDate) : -1;
        },
        invoiceDate: function (value) {
            return value._CustStatmentDtl_RefDate ? parseValueToDate(value._CustStatmentDtl_RefDate) : -1;
        }
    };

    $scope.$watch('vm.ledger', function(ledgerDetails) {
        if(angular.isDefined(ledgerDetails)){
            vm.ledgerDetails = _.uniq(ledgerDetails, function(ld){
                return ld._CustStatmentDtl_TransId;
            });

            _.each(vm.ledgerDetails, function(ledger){
                ledger.invoiceTotal = calculateInvoiceTotal(ledger);
            })
        }
    }, true);


    function calculateInvoiceTotal(ledger){
        var _sum = 0;
        if(vm.ledger){
            var invoiceDetails = _.filter(vm.ledger, function(row){
                return row._CustStatmentDtl_TransId == ledger._CustStatmentDtl_TransId
            })

            if(invoiceDetails && invoiceDetails.length){
                ledger.lineItems = invoiceDetails.length;

                _.each(invoiceDetails, function(order){
                    if(order.INV1_LineTotal)
                        _sum+= parseFloat(order.INV1_LineTotal);
                })
            }
        }
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

    function viewInventoryDetails(transId){
        $location.path('/invoices/' + vm.customerId + '/' + transId);
    }

    function calculateLedgerTotal(ledger){
        console.log('inside', ledger);
        var _sum = 0;
        _.each(ledger, function(invoice){
            if(invoice.invoiceTotal)
                _sum+= parseFloat(invoice.invoiceTotal)
        });
        vm.ledgerTotal = _sum;
        return _sum;
    }


    $scope.$watch("$parent.orgCardAndPermissions", function(permissions) {
        if(angular.isDefined(permissions)){
            vm.state.orgCardAndPermissions = permissions;
        }
    });
}

})();
