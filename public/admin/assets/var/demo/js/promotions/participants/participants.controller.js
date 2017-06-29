(function(){

app.controller('ParticipantsComponentController', participantsComponentController);

participantsComponentController.$inject = ['$scope', '$attrs', '$window', '$filter', '$stateParams', '$modal', '$timeout', '$location', 'pagingConstant', 'toaster', 'SecurematicsParticipantsService', 'UtilService'];
/* @ngInject */
function participantsComponentController($scope, $attrs, $window, $filter, $stateParams, $modal, $timeout, $location, pagingConstant, toaster, SecurematicsParticipantsService, UtilService) {

    var vm = this;

    vm.init = init;
    vm.pagingConstant = pagingConstant;

    vm.state = {};
    
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
    vm.promotion.participants = vm.promotion.participants || [];
    vm.selectPage = selectPage;
    vm.showPages = vm.pagingConstant.displayedPages;
    vm.numberOfPages = numberOfPages;
    vm.checkIfSelected = checkIfSelected;
    vm.participantSelectClickFn = participantSelectClickFn;
    vm.selectAllClickFn = selectAllClickFn;
    
    vm.filterParticipants = filterParticipants;
    
    function drawPages(){
      var start = 1;
      var end;
      var i;
      var prevPage = vm.uiState.curPage;
      var totalItemCount = vm.state.totalParticipants;
      var currentPage = vm.uiState.curPage;
      var numPages = numberOfPages();

      start = Math.max(start, currentPage - Math.abs(Math.floor(vm.showPages / 2)));
      end = start + vm.showPages;

      if (end > numPages) {
        end = numPages + 1;
        start = Math.max(1, end - vm.showPages);
      }

      vm.pages = [];


      for (i = start; i < end; i++) {
        vm.pages.push(i);
      }
    }

    function selectPage(page){
        if(page != vm.uiState.curPage){
            vm.uiState.pageLoading = true;
            vm.uiState.curPage = page;
            vm.uiState.skip = (page - 1) * vm.uiState.limit;
            loadParticipants();
        }
    }

    function numberOfPages() {
        if (vm.state.totalParticipants) {
            return Math.ceil(vm.state.totalParticipants / vm.uiState.limit);
        }
        return 0;
    }

    function loadParticipants(){
        SecurematicsParticipantsService.getParticipants(vm.uiState).then(function(response){
            
            vm.state.participants = _.map(response.data.results, 
                function(participant) {
                    return {
                        OCRD_CardCode: participant.OCRD_CardCode,
                        OCRD_CardName: participant.OCRD_CardName,
                        _cardName: participant._cardName                        
                    };
                }
            );
            vm.state.totalParticipants = response.data.total;
            vm.uiState.loading = false;
            vm.uiState.pageLoading = false;
            drawPages();
        })
    }

    function filterParticipants(value){
        loadDefaults();
        vm.uiState.globalSearch = angular.copy(value);
        loadParticipants();
    };

    function checkIfSelected(participant){
        return _.contains(_.pluck(vm.promotion.participants, "cardCode"), participant.OCRD_CardCode);
    }

    function participantSelectClickFn($event, participant) {       
        if(_.contains(_.pluck(vm.promotion.participants, "cardCode"), participant.OCRD_CardCode)){
            vm.promotion.participants = _.reject(vm.promotion.participants, function(item){
              return participant.OCRD_CardCode == item.cardCode
            });
        }
        else{            
            vm.promotion.participants.push({
              cardCode: participant.OCRD_CardCode,
              name: participant._cardName
            });
        }
    };

    function selectAllClickFn($event){
        vm.selectAllChecked = !vm.selectAllChecked;
        if(vm.selectAllChecked){
            // Need to add all VARs to promtion
        }
        else{
            vm.promotion.participants = [];
        }
    }

    function loadDefaults() {
        vm.uiState.curPage = 1;
        vm.uiState.skip = 0;
        vm.uiState.pageLoading = true;
    }

    function init(element) {
        vm.element = element;
        loadParticipants();
    }
}

})();
