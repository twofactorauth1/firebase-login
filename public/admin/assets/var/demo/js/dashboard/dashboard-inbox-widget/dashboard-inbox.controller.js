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
            title: 'Notification of constraint juniper product.',
            description: 'Notification of constraint juniper product. Notification of constraint juniper product. Notification of constraint juniper product. Notification of constraint juniper product. Notification of constraint juniper product',
            messageDate: '3 Feb 2017',
            detailedTime: 'Today at 15:45',
            userName: "Jenet Erickson"
        },{
            title: 'Notification of sonicWall Inventory arrival.',
            description: 'Notification of sonicWall Inventory arrival. Notification of sonicWall Inventory arrival. Notification of sonicWall Inventory arrival. Notification of sonicWall Inventory arrival. Notification of sonicWall Inventory arrival. ',
            messageDate: 'Yesterday',
            detailedTime: 'Yesterday at 16:25',
            userName: "Jacob BROWN"
        },{
            title: 'Order status changed.',
            description: 'Order number 32312 status changed from pending to complete.',
            messageDate: 'Yesterday',
            detailedTime: 'Yesterday at 12:30',
            userName: 'Kein Williams'
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
