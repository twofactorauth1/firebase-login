(function(){

app.controller('ParticipantsComponentController', participantsComponentController);

participantsComponentController.$inject = ['$scope', '$attrs', '$window', '$filter', '$stateParams', '$modal', '$timeout', '$location', 'pagingConstant', 'toaster', 'SecurematicsParticipantsService', 'UtilService', 'PromotionsService'];
/* @ngInject */
function participantsComponentController($scope, $attrs, $window, $filter, $stateParams, $modal, $timeout, $location, pagingConstant, toaster, SecurematicsParticipantsService, UtilService, PromotionsService) {

    var vm = this;

    vm.init = init;
    vm.pagingConstant = pagingConstant;

    vm.uiState = {
        loading: true,
        limit: vm.pagingConstant.numberOfRowsPerPage,
        skip: 0,
        curPage: 1,
        sortData: {
            column: '',
            details: {}
        }
    };
      
    vm.checkIfSelected = checkIfSelected;
    vm.participantSelectClickFn = participantSelectClickFn;
    vm.selectAllClickFn = selectAllClickFn;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    
    vm.participants = [];
    vm.setBulkActionChoiceFn = setBulkActionChoiceFn;
    vm.removeParticipant = removeParticipant;
    function checkIfSelected(participant){
        return _.contains(_.pluck(vm.participants, "cardCode"), participant.cardCode);
    }

    function participantSelectClickFn($event, participant) {       
        vm.participants.push(participant);
    };

    function removeParticipant(participant){
        if(_.contains(_.pluck(vm.state.promotion.participants, "cardCode"), participant.cardCode)){
            vm.state.promotion.participants = _.reject(vm.state.promotion.participants, function(item){
              return participant.cardCode == item.cardCode
            });
        }
    }

    vm.bulkActionChoices = [
    {
        data: 'remove',
        label: 'Remove'
    }];

    function selectAllClickFn($event){
        vm.selectAllChecked = !vm.selectAllChecked;
        if(vm.selectAllChecked){
            vm.participants = _.map(vm.state.promotion.participants, 
                function(participant) {
                    return {
                        cardCode: participant.cardCode,
                        name: participant.name  
                    };
                }
            );
        }
        else{
            vm.participants = [];
        }
    }

    function setBulkActionChoiceFn(){
        _.each(vm.participants, function(participant){
            removeParticipant(participant);
        })
        vm.participants = [];
    }
    
    function openModal(modal, controller, size){
        var isVendor = vm.state.orgCardAndPermissions && vm.state.orgCardAndPermissions.isVendor;
        
        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'lg',
            resolve: {
                parentVm: function() {
                    return vm;
                }
            }
        };

        if (controller) {
            _modal.controller = controller + ' as vm';
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
    function init(element) {
        vm.element = element;
        //$scope.$watch(function() { return PromotionsService.customers }, function(customers) {        
            //if(angular.isDefined(customers)){
                vm.uiState.loading = false;
            //}
        //}, true);
    }

    
}

})();
