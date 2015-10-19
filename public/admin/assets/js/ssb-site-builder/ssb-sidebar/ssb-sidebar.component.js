app.directive('ssbSidebar', ['$filter', function($filter) {

    return {
        scope: {},
        templateUrl: 'assets/js/ssb-site-builder/ssb-sidebar/ssb-sidebar.component.html',
        controller: function() {
            var vm = this;
            console.info('site-build sidebar directive init...')
            vm.somethingSidebar = 'something sidebar';
        },
        controllerAs: 'vm',
        // bindToController: true
    };

}]);