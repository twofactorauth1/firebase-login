(function(){

app.controller('SiteBuilderThemeBtnController', ssbThemeBtnController);

ssbThemeBtnController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$sce', '$timeout'];
/* @ngInject */
function ssbThemeBtnController($scope, $attrs, $filter, $transclude, $sce, $timeout) {

    console.info('ssb-theme-btn directive init...')

    var vm = this;

    vm.init = init;
    vm.btnClass = btnClass;

    //TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components

    function btnClass(btn) {
        var classString = ' ';

        if (btn) {

            // if (false) {
                classString += ' ssb-theme-btn-' + 'something';
            // }

        }

        return classString;
    }

    function init(element) {
        vm.element = element;

        vm.element.on('mouseover', function() {
            console.log('mouseover');
        });

        vm.element.on('click', function() {
            console.log('click');
        });

    }

}


})();
