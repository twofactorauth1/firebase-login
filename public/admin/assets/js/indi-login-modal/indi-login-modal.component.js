(function(){

app.directive('indiLoginModal', indiLoginModal);

function indiLoginModal() {

    return {
        restrict: 'E',
        // scope: {
        //     state: '=',
        //     uiState: '='
        // },
        templateUrl: 'assets/js/indi-login-modal/indi-login-modal.component.html',
        controller: 'IndiLoginModalController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
