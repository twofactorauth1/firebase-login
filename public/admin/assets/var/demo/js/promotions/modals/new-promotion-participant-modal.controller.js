'use strict';
/*global app*/
app.controller('PromotionParticipantModalController', ['$timeout', 'parentVm', 'pagingConstant', 'toaster', 'SecurematicsParticipantsService', function ($timeout, parentVm, pagingConstant, toaster, SecurematicsParticipantsService) {

    var vm = this;

    vm.parentVm = parentVm;
    vm.pagingConstant = pagingConstant;

    vm.state = {};
    vm.participants = [];

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
    //vm.participants = vm.participants || [];
    vm.selectPage = selectPage;
    vm.showPages = vm.pagingConstant.displayedPages;
    vm.numberOfPages = numberOfPages;
    vm.checkIfSelected = checkIfSelected;
    vm.participantSelectClickFn = participantSelectClickFn;
    vm.selectAllClickFn = selectAllClickFn;
    vm.addParticipant = addParticipant;
    vm.filterParticipants = filterParticipants;
    vm.setBulkActionChoiceFn = setBulkActionChoiceFn;
    vm.parentVm.state.promotion.participants = vm.parentVm.state.promotion.participants || [];

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
            vm.selectAllChecked = false;          
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
        return _.contains(_.pluck(vm.participants, "OCRD_CardCode"), participant.OCRD_CardCode);
    }

    function participantSelectClickFn($event, participant) {       
        vm.participants.push(participant);
    };

    function selectAllClickFn($event){
        vm.selectAllChecked = !vm.selectAllChecked;
        if(vm.selectAllChecked){
            var participants = _.map(vm.state.participants, 
                function(participant) {
                    return {
                        OCRD_CardCode: participant.OCRD_CardCode,
                        OCRD_CardName: participant.OCRD_CardName,
                        _cardName: participant._cardName  
                    };
                }
            );
            vm.participants = _.union(participants, vm.participants);
        }
        else{
            vm.participants = _.filter(vm.participants, function(participant){
                return !_.contains(_.pluck(vm.state.participants, "OCRD_CardCode"), participant.OCRD_CardCode)
            })
        }
    }

    vm.bulkActionChoices = [
    {
        data: 'add',
        label: 'Add'
    }];

    function setBulkActionChoiceFn(){
        _.each(vm.participants, function(participant){
            addParticipant(participant);
        })
        vm.participants = [];
        vm.selectAllChecked = false;
    }

    function addParticipant(participant){
        if(!_.contains(_.pluck(vm.parentVm.state.promotion.participants, "cardCode"), participant.OCRD_CardCode)){
            vm.parentVm.state.promotion.participants.push({
              cardCode: participant.OCRD_CardCode,
              name: participant._cardName
            });
        }
    }

    function loadDefaults() {
        vm.uiState.curPage = 1;
        vm.uiState.skip = 0;
        vm.uiState.pageLoading = true;
        
    }

    (function init() {
        loadParticipants();
    })();

}]);
