(function(){

app.directive('siteTrafficComponent', siteTrafficComponent);

function siteTrafficComponent() {

    return {
        restrict: 'E',        
        templateUrl: 'assets/js/traffic/site-traffic/site-traffic.component.html',
        controller: 'SiteTrafficController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
