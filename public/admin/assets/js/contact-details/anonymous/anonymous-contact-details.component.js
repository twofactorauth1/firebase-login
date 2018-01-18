(function(){

app.directive('anonymousContactDetailsComponent', anonymousContactDetailsComponent);

function anonymousContactDetailsComponent() {

    return {
        restrict: 'E',        
        templateUrl: 'assets/js/contact-details/anonymous/anonymous-contact-details.component.html',
        controller: 'AnonymousContactDetailsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
