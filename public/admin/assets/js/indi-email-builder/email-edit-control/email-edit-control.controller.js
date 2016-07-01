(function () {

  app.controller('EmailBuilderEditControlController', indiEmailBuilderEditControlController);

  indiEmailBuilderEditControlController.$inject = ['$scope'];
  /* @ngInject */
  function indiEmailBuilderEditControlController($scope) {

    var vm = this;

    vm.init = init;
    vm.moveComponentFn = moveComponentFn;
    vm.duplicateComponentFn = duplicateComponentFn;

    function moveComponentFn(direction, index) {
      var toIndex;
      var fromIndex = index;

      if (direction === 'up') {
        toIndex = fromIndex - 1;
      }

      if (direction === 'down') {
        toIndex = fromIndex + 1;
      }

      vm.components.splice(toIndex, 0, vm.components.splice(fromIndex, 1)[0]);
    }

    function duplicateComponentFn(index) {
      $scope.$emit('email.duplicate.component', {index: index});
    }

    function init(element) {
      vm.element = element;
    }

  }

})();
