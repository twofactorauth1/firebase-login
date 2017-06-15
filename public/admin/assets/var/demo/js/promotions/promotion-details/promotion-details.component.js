(function(){

app.directive('promotionDetailsComponent', promotionDetailsComponent);
/* @ngInject */
function promotionDetailsComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/promotions/promotion-details/promotion-details.component.html',
        controller: 'PromotionDetailsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
