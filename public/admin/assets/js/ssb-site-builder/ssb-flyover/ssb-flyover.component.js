app.directive('ssbFlyover', ['$filter', function($filter) {

    return {
        scope: {},
        templateUrl: 'assets/js/ssb-site-builder/ssb-flyover/ssb-flyover.component.html',
        controller: function() {
            var vm = this;
            console.info('site-build flyover directive init...')
            vm.somethingFlyover = 'something flyover';
        },
        controllerAs: 'vm',
        // bindToController: true
    };

}]);