(function(){

app.controller('ParticipantsComponentController', participantsComponentController);

participantsComponentController.$inject = ['$scope', '$attrs', '$window', '$filter', '$stateParams', '$modal', '$timeout', '$location', 'pagingConstant', 'toaster', 'PromotionsService', 'UtilService'];
/* @ngInject */
function participantsComponentController($scope, $attrs, $window, $filter, $stateParams, $modal, $timeout, $location, pagingConstant, toaster, PromotionsService, UtilService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.uiState = {
        loading: true
    };


    function init(element) {
        
    }
}

})();
