(function(){

app.directive('anonymousContactActivityComponent', anonymousContactActivityComponent);

function anonymousContactActivityComponent() {

    return {
        restrict: 'E',        
        templateUrl: 'assets/js/contact-details/anonymous/anonymous-contact-activity/anonymous-contact-activity.component.html',
        controller: 'AnonymousContactActivityController',
        controllerAs: 'vm',
        bindToController: true,
        scope: {
            fingerprintId: '=',
            anonymousContactDeviceDetails: '=',
            anonymousContactSessionDetails: '=',
            anonymousContactAttributionDetails: '='
        },
        replace: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
