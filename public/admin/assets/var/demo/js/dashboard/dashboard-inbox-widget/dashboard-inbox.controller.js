(function(){

app.controller('DashboardInboxComponentController', dashboardInboxComponentController);

dashboardInboxComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', 'DashboardService'];
/* @ngInject */
function dashboardInboxComponentController($scope, $attrs, $filter, $modal, $timeout, DashboardService) {

    var vm = this;

    vm.init = init;

    vm.setSelectedMessage = setSelectedMessage;

    function setSelectedMessage(index){
        vm.selectedMessage =  vm.inboxMessages[index];
        vm.selectedMessageIndex = index;
    }


    var unbindMessageWatcher = $scope.$watch(function() { return DashboardService.broadcastMessages }, function(messages) {          
        if(messages){
            vm.inboxMessages = messages; 
            vm.setSelectedMessage(0)  
        }
    }, true);

    function init(element) {
        vm.element = element;
    }

}

})();
