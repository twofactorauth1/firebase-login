(function(){

app.directive('shipmentsComponent', shipmentsComponent);
/* @ngInject */
function shipmentsComponent() {

    return {
        restrict: 'E',
        scope: {
            state: '='
        },      
        templateUrl: 'assets/var/demo/js/promotions/shipments/shipments.component.html',
        controller: 'ShipmentsComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
