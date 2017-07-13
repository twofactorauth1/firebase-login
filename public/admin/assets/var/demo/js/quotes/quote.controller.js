(function(){

app.controller('QuoteComponentController', quoteComponentController);

quoteComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'SweetAlert', 'toaster', 'pagingConstant', 'formValidations', 'QuoteService', 'UtilService'];
/* @ngInject */
function quoteComponentController($scope, $attrs, $filter, $modal, $timeout, $location, SweetAlert, toaster, pagingConstant, formValidations, QuoteService, UtilService) {

    var vm = this;

    vm.state = {
        newQuote: {}
    };
    vm.uiState ={
        loading: true,
        globalSearch: QuoteService.globalSearch,
        fieldSearch: QuoteService.fieldSearch
    }
    
    
    vm.openModal = openModal;
     
    vm.closeModal = closeModal;
    
    vm.init = init;


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


    function openModal(size){
        
        var templateUrl = 'new-purchase-order-modal';
        
        $scope.modalInstance = $modal.open({
            templateUrl: templateUrl,
            size: size,
            keyboard: false,
            backdrop: 'static',
            scope: $scope
        });
    }


    function closeModal() {
        if($scope.modalInstance)
            $scope.modalInstance.close();
    }

    function showFilteredRecords(){
        return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
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

        vm.state.quotes = [];
        vm.uiState.loading = false;
    }

}

})();
