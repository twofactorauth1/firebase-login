(function(){

app.directive('customersComponent', customersComponent);
/* @ngInject */
function customersComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/customers/customers.component.html',
        controller: 'CustomersComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
