(function(){

app.directive('promotionParticipantsComponent', promotionParticipantsComponent);
/* @ngInject */
function promotionParticipantsComponent() {

    return {
        restrict: 'E',
        scope: {
            promotion: '='
        },      
        templateUrl: 'assets/var/demo/js/promotions/participants/participants.component.html',
        controller: 'ParticipantsComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
