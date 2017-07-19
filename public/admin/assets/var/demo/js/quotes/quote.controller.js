(function(){

app.controller('QuoteComponentController', quoteComponentController);

quoteComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'SweetAlert', 'toaster', 'pagingConstant', 'formValidations', 'QuoteService', 'UtilService', 'UserPermissionsConfig'];
/* @ngInject */
function quoteComponentController($scope, $attrs, $filter, $modal, $timeout, $location, SweetAlert, toaster, pagingConstant, formValidations, QuoteService, UtilService, UserPermissionsConfig) {

    var vm = this;

    vm.state = {
        newQuote: {},
        orgCardAndPermissions: UserPermissionsConfig.orgConfigAndPermissions
    };

    vm.uiState ={
        loading: true,
        globalSearch: QuoteService.globalSearch,
        fieldSearch: QuoteService.fieldSearch
    }
    

    vm.getItems = getItems;
    vm.getVendors = getVendors;
    
    vm.init = init;

    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.viewQuoteDetails = viewQuoteDetails;
    /********** GLOBAL SEARCH RELATED **********/

    $scope.$watch('vm.uiState.globalSearch', function (term) {
        if(angular.isDefined(term)){
            if(!angular.equals(term, QuoteService.globalSearch)){
                QuoteService.globalSearch = angular.copy(term);
            }
        }
    }, true);


    $scope.$watch('vm.uiState.fieldSearch', function (search) {
        if(angular.isDefined(search)){
            if(!angular.equals(search, QuoteService.fieldSearch)){
                QuoteService.fieldSearch = angular.copy(search);
            }
        }
    }, true);


    function showFilteredRecords(){
        return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
    }

    function getQuotes(){
        QuoteService.getQuotes().then(function(response){
            vm.state.quotes = response.data;
            vm.uiState.loading = false;
        })
    }

    function getItems(quote){
        return _.pluck(quote.items, "OITM_ItemName").join(", ");
    }

    function getVendors(quote){
        return _.uniq(_.pluck(quote.items, "_shortVendorName")).join(", ");
    }

    function openModal(modal, controller, size){

        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'lg',
            scope: $scope,
            resolve: {
                parentVm: function() {
                    return vm;
                }
            }
        };

        if (controller) {
            _modal.controller = controller  + ' as vm';
        }


        vm.modalInstance = $modal.open(_modal);

        vm.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });
    }

    function closeModal() {
        if(vm.modalInstance)
            vm.modalInstance.close();
    }

    function viewQuoteDetails(quote){
        vm.state.cartDetails = quote;
        vm.openModal('quote-details-modal','QuoteDetailsController','lg')
    }
    
    function init(element) {
        vm.element = element;

        $timeout(function() {
            var params = {
                globalSearch: vm.uiState.globalSearch,
                fieldSearch: vm.uiState.fieldSearch
            }
            $scope.$broadcast('refreshTableData', params);
        }, 0);
        
        getQuotes();
    }

}

})();
