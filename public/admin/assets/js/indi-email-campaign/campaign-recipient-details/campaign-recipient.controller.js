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
        skip: 0
    };
    vm.showFilter = showFilter;
    vm.numberOfPages = numberOfPages;
    vm.pagingConstant = pagingConstant;
    vm.selectPage = selectPage;


    function showFilter(){
        vm.uiState.showFilter = !vm.uiState.showFilter;
    }


    function numberOfPages() {
        if (vm.state.recipients) {
            return Math.ceil(vm.state.totalRecipients / vm.uiState.limit);
        }
        return 0;
    }

    function drawPages(){
      var start = 1;
      var end;
      var i;
      var prevPage = vm.uiState.curPage;
      var totalItemCount = vm.state.totalRecipients;
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

    function loadCampaignRecipientList(){
        EmailCampaignService.getCampaignRecipientDetails($stateParams.id, vm.uiState).then(function(response){
            vm.state.recipients = response.data.results;
            vm.state.totalRecipients = response.data.total;
            drawPages();
            vm.uiState.loading = false;
            vm.uiState.pageLoading = false;
            vm.uiState.loadingFilter = false;

            $("html, body").animate({
              scrollTop: 0
            }, 600);
        })
    }

    function init(element) {
        vm.element = element;
        loadCampaignRecipientList();
    }

}

})();
