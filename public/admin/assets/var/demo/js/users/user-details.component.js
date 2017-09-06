(function(){

app.directive('userDetailsComponent', userDetailsComponent);
/* @ngInject */
function userDetailsComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/users/users.html',
        controller: 'usersCtrl',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
