(function(){

app.directive('dashboardInboxDemoComponent', dashboardInbox);
/* @ngInject */
function dashboardInbox() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '='
        },
        replace: true,
        templateUrl: 'assets/var/demo/js/dashboard/dashboard-inbox-widget/dashboard-inbox.component.html',
        controller: 'DashboardInboxDemoComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
