(function(){

app.controller('DashboardInboxComponentController', dashboardInboxComponentController);

dashboardInboxComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout'];
/* @ngInject */
function dashboardInboxComponentController($scope, $attrs, $filter, $modal, $timeout) {

    var vm = this;

    vm.init = init;

    vm.getInboxMessages = getInboxMessages;

    vm.setSelectedMessage = setSelectedMessage;

    function setSelectedMessage(index){
        vm.selectedMessage =  vm.inboxMessages[index];
        vm.selectedMessageIndex = index;
    }


    function getInboxMessages(){
        var messages = [];

        messages.push({
            title: 'Site Outage',
            description: 'There will be a brief site outage this Saturday, 22-April, from 02:00 - 04:00 Pacific Time. If you encounter any issues after this window, please contact our support team via Intercom.',
            messageDate: '19 Apr 2017',
            detailedTime: '19 Apr 2017',
            userName: "Indigenous Admin"
        },{
            title: 'Our Phone Number has changed',
            description: 'Our front desk phone number changed to 415-999-8888. If you have trouble reaching us, don\'t hesitate to email or use the Intercom link (lower right hand corner)',
            messageDate: '10 Apr 2017',
            detailedTime: '10 Apr 2017',
            userName: 'Securematics Admin'
        },{
            title: 'Email Outage - Resolved',
            description: 'Email services have recovered.',
            messageDate: '1 Apr 2017',
            detailedTime: '1 Apr 2017',
            userName: 'Securematics Admin'
        });
        vm.inboxMessages = messages;

    }

    function init(element) {
        vm.element = element;

        $timeout(function() {
            vm.getInboxMessages();
            vm.setSelectedMessage(0)
        }, 0);

    }

}

})();
