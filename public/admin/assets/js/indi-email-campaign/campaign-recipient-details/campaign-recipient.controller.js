(function(){

app.controller('CampaignRecipientDetailsController', campaignRecipientDetailsController);

campaignRecipientDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location'];
/* @ngInject */
function campaignRecipientDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.uiState = {
        loading: true
    };

    function init(element) {
        vm.element = element;
    }

}

})();
