(function(){

app.controller('DashboardInboxComponentController', dashboardInboxComponentController);

dashboardInboxComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', 'DashboardService'];
/* @ngInject */
function dashboardInboxComponentController($scope, $attrs, $filter, $modal, $timeout, DashboardService) {

    var vm = this;

    vm.init = init;

    vm.setSelectedMessage = setSelectedMessage;
    vm.stripHTML = stripHTML;

    function setSelectedMessage(index){
        vm.selectedMessage =  vm.inboxMessages[index];
        vm.selectedMessageIndex = index;
    }


    var unbindMessageWatcher = $scope.$watch(function() { return DashboardService.broadcastMessages }, function(messages) {
        if(messages){
            vm.inboxMessages = $filter('orderBy')(messages, '-modified.date');
            vm.setSelectedMessage(0);
           $timeout(function() {
               $(".slick-swipe").slick({ adaptiveHeight: true, slidesToShow:1, dots:false, arrows:true, autoplay:false, touchMove:true, draggable:true });
           }, 500);
        }
    }, true);

    function init(element) {
        vm.element = element;
    }

    function stripHTML(msg) {
        return msg.replace(/<\/?[^>]+(>|$)/g, "");
    }

}

})();
