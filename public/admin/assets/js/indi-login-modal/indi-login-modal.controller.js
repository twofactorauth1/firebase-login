(function(){

app.controller('IndiLoginModalController', indiLoginModalController);

indiLoginModalController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'toaster'];
/* @ngInject */
function indiLoginModalController($scope, $attrs, $filter, $document, $timeout, toaster) {

    console.info('indi-login-modal directive init...')

    var vm = this;

    vm.init = init;

    function init(element) {

        vm.element = element;

    }
}

})();
