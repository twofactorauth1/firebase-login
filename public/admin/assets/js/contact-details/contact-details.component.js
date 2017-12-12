(function(){

app.directive('contactDetailsComponent', contactDetailsComponent);

function contactDetailsComponent() {

    return {
        restrict: 'E',        
        templateUrl: 'assets/js/contact-details/contact-details.component.html',
        controller: 'ContactDetailsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
