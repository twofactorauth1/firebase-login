(function(){

app.controller('SiteBuilderThemeBtnController', ssbThemeBtnController);

ssbThemeBtnController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$sce', '$timeout', '$compile'];
/* @ngInject */
function ssbThemeBtnController($scope, $attrs, $filter, $transclude, $sce, $timeout, $compile) {

    console.info('ssb-theme-btn directive init...')

    var vm = this;

    vm.init = init;
    vm.compile = compile;
    vm.btnClass = btnClass;

    function compile() {
        // var template = '<a class="btn btn-primary ssb-theme-btn">' + vm.element.html() + '</a>';
        // vm.element.replace($compile(template)($scope));

        // $compile(template)($scope, function(cloned, scope){
        //     vm.element.append(cloned);
        // });

    }

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

        // debugger;

        vm.element = element;

        // vm.compile();

        vm.element.on('mouseenter', function() {
            console.log('mouseenter');
        });

        vm.element.on('click', function() {
            console.log('click');
        });

    }

}


})();
