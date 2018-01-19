(function(){

app.directive('customerTrafficComponent', customerTrafficComponent);

function customerTrafficComponent() {

    return {
        restrict: 'E',        
        templateUrl: 'assets/js/traffic/customer-traffic/customer-traffic.component.html',
        controller: 'CustomerTrafficController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
