(function(){

app.controller('IndiLoginModalController', indiLoginModalController);

indiLoginModalController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'toaster'];
/* @ngInject */
function indiLoginModalController($scope, $attrs, $filter, $document, $timeout, toaster) {

    console.info('indi-login-modal directive init...')

    var vm = this;

    vm.init = init;

    function overrideLoginStyles() {

        var loginContainer = vm.element.find('iframe').contents().find('.main-login');

        loginContainer.css({
            margin: '0',
            padding: '0',
            width: '100%',
            overflow: 'hidden'
        });

    }

    function init(element) {

        vm.element = element;

        overrideLoginStyles();

    }
}

})();
