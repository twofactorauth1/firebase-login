(function(){

app.controller('LedgerDetailsController', ledgerDetailsController);

ledgerDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'toaster', 'CustomersService'];
/* @ngInject */
function ledgerDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, toaster, CustomersService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.customerId);
    vm.state = {};
    vm.uiState = {loading: true};

    vm.backToCustomers = backToCustomers;

    vm.parseValueToFloat = parseValueToFloat;
    vm.parseValueToDate = parseValueToDate;
    vm.viewInventoryDetails = viewInventoryDetails;
    vm.calculateLedgerTotal = calculateLedgerTotal;


    function backToCustomers(){
        $state.go("app.customers");
    }

    function init(element) {
        vm.element = element;

        CustomersService.getLedgerDetails($stateParams.customerId).then(function(response){
            var ledger = response.data.response && response.data.response.payload.querydata.data;
            if(ledger && ledger.row){
                if(angular.isArray(ledger.row)){
                    vm.ledger = ledger
                }
                else{
                    vm.ledger = {
                        row: [
                            ledger.row
                        ]
                    }
                }
                vm.uiState.loading = false;
            }
            else{
                $scope.$watch(function() { return CustomersService.customers }, function(customers) {
                    if(angular.isDefined(customers)){
                        vm.listledger = _.find(CustomersService.customers, function(customer){
                            return customer.OCRD_CardCode.toLowerCase() == $stateParams.customerId.toLowerCase()
                        })
                    }
                    vm.uiState.loading = false;
                }, true);
            }
        }).catch(function(error) {
            vm.uiState.loading = false;
            if(error.data && error.data.message)
                toaster.pop('error', 'Error', error.data.message);
        });
    }

    $scope.$watch('vm.ledger.row', function(ledgerDetails) {
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
        if(vm.ledger && vm.ledger.row){
            var invoiceDetails = _.filter(vm.ledger.row, function(row){
                return row._CustStatmentDtl_TransId == ledger._CustStatmentDtl_TransId
            })

            if(invoiceDetails && invoiceDetails.length){
                ledger.lineItems = invoiceDetails.length;

                _.each(invoiceDetails, function(order){
                    _sum+= parseFloat(order.INV1_LineTotal)
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
        $location.path('/invoices/' + $stateParams.customerId + '/' + transId);
    }

    function calculateLedgerTotal(ledger){
        console.log('inside', ledger);
        var _sum = 0;
        _.each(ledger, function(invoice){
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
