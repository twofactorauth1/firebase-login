(function(){

app.directive('contactActivityComponent', contactActivityComponent);

function contactActivityComponent() {

    return {
        restrict: 'E',        
        templateUrl: 'assets/js/contact-details/activity/contact-activity.component.html',
        controller: 'ContactActivityController',
        controllerAs: 'vm',
        bindToController: true,
        scope: {
            contactId: '=',
            contact: '=',
            contactDeviceDetails: '='
        },
        replace: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
