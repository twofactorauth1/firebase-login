(function(){

app.controller('CampaignRecipientDetailsController', campaignRecipientDetailsController);

campaignRecipientDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'pagingConstant', 'EmailCampaignService'];
/* @ngInject */
function campaignRecipientDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, pagingConstant, EmailCampaignService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.uiState = {
        loading: true,
        curPage: 1,
        limit: pagingConstant.numberOfRowsPerPage,
        skip: 0,
        sortBy: null,
        sortDir: null
    };
    vm.showFilter = showFilter;
    vm.numberOfPages = numberOfPages;
    vm.pagingConstant = pagingConstant;
    vm.selectPage = selectPage;
    vm.sortCampaignRecipientList = sortCampaignRecipientList;
    vm.viewSingleContact = viewSingleContact;

    vm.sortData = {
        column: '',
        details: {}
    };

    function showFilter(){
        vm.uiState.showFilter = !vm.uiState.showFilter;
    }


    function numberOfPages() {
        if (vm.state.recipients) {
            return Math.ceil(vm.state.totalFilteredRecipients / vm.uiState.limit);
        }
        return 0;
    }

    function drawPages(){
      var start = 1;
      var end;
      var i;
      var prevPage = vm.uiState.curPage;
      var totalItemCount = vm.state.totalFilteredRecipients;
      var currentPage = vm.uiState.curPage;
      var numPages = numberOfPages();

      start = Math.max(start, currentPage - Math.abs(Math.floor(vm.pagingConstant.displayedPages / 2)));
      end = start + vm.pagingConstant.displayedPages;

      if (end > numPages) {
        end = numPages + 1;
        start = Math.max(1, end - vm.pagingConstant.displayedPages);
      }

      vm.pages = [];


      for (i = start; i < end; i++) {
        vm.pages.push(i);
      }
    }

    function selectPage(page){        
        vm.uiState.pageLoading = true;
        vm.uiState.curPage = page;
        vm.uiState.skip = (page - 1) * vm.uiState.limit;
        loadCampaignRecipientList();
    }

    /********** SORTING RELATED **********/

    function sortCampaignRecipientList(col, name) {
        if (vm.sortData.column !== name) {
            vm.sortData.details = {};
        }
        vm.sortData.column = name;
        if (vm.sortData.details[name]) {
            if (vm.sortData.details[name].direction === 1) {
                vm.sortData.details[name].direction = -1;
            }
            else {
                vm.sortData.details[name].direction = 1;
            }
        }
        else {
            vm.sortData.details[name] = {
                direction: 1,
                sortColum: col
            }
        }
        vm.uiState.sortBy = col;
        vm.uiState.sortDir = vm.sortData.details[name].direction;
        loadDefaults();
        loadCampaignRecipientList();
    }

    function loadDefaults() {
        vm.uiState.curPage = 1;
        vm.uiState.skip = 0;
        vm.uiState.pageLoading = true;
    }

    function loadCampaignRecipientList(){
        EmailCampaignService.getCampaignRecipientDetails($stateParams.id, vm.uiState).then(function(response){
            vm.state.recipients = response.data.results;
            vm.state.totalFilteredRecipients = response.data.total;
            vm.state.totalRecipients = EmailCampaignService.totalRecipients;
            drawPages();
            vm.uiState.loading = false;
            vm.uiState.pageLoading = false;
            vm.uiState.loadingFilter = false;

            $("html, body").animate({
              scrollTop: 0
            }, 600);
        })
    }

    function viewSingleContact(recipient){
        var _email = recipient.receiver
        var _event = _.findWhere(recipient.events, function(item){
            return item.email === _email
        })
        if(_event){
            $state.go('app.singleContact', {
                contactId: _event.contactId
            });
        }
    }


    function init(element) {
        vm.element = element;
        loadCampaignRecipientList();
    }

}

})();
