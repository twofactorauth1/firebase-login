(function(){

app.directive('promotionsComponent', promotionsComponent);
/* @ngInject */
function promotionsComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/promotions/promotions.component.html',
        controller: 'PromotionsComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
