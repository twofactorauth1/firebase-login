(function(){

app.directive('quoteComponent', quoteComponent);
/* @ngInject */
function quoteComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/quotes/quote.component.html',
        controller: 'QuoteComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
