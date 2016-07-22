(function () {

  app.controller('EmailBuilderComponentLoaderController', emailbComponentLoaderController);

  emailbComponentLoaderController.$inject = ['$rootScope', '$scope', '$attrs', '$filter', '$timeout'];
  /* @ngInject */
  function emailbComponentLoaderController($rootScope, $scope, $attrs, $filter, $timeout) {

    console.info('component-loader directive init...');

    var vm = this;
    var pVm = $scope.$parent.vm;

    vm.ssbEditor = true;
    vm.components = pVm.state.email.components;

    $scope.component = vm.component;
    $scope.isEditing = true;
    $scope.website = vm.state.website;

    vm.init = init;
    vm.componentStyleFn = componentStyleFn;


    function componentStyleFn(component) {

        var styleString = ' ';

        if (component.bg) {

            if (component.bg.color) {
                styleString += 'background-color: ' + component.bg.color + ';';
            }

            if (component.bg.img && component.bg.img.show && component.bg.img.url !== '') {
                styleString += 'background-image: url("' + component.bg.img.url + '");';
            }

        }

        return styleString;

    }


    function init(element) {
      vm.element = element;
    }

  }

})();
