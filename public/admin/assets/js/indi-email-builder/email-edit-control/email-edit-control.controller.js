(function () {

  app.controller('EmailBuilderEditControlController', indiEmailBuilderEditControlController);

  indiEmailBuilderEditControlController.$inject = ['$scope'];
  /* @ngInject */
  function indiEmailBuilderEditControlController($scope) {

    var vm = this;

    vm.init = init;

    function init(element) {
      vm.element = element;
    }

  }

})();
