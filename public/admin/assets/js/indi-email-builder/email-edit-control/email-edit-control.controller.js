(function () {

  app.controller('EmailBuilderEditControlController', indiEmailBuilderEditControlController);

  indiEmailBuilderEditControlController.$inject = ['$scope'];
  /* @ngInject */
  function indiEmailBuilderEditControlController($scope) {

    var vm = this;

    vm.init = init;
    vm.moveComponentFn = moveComponentFn;
    vm.duplicateComponentFn = duplicateComponentFn;
    vm.removeComponentFn = removeComponentFn;
    vm.openMenuPanelFn = openMenuPanelFn;

    function moveComponentFn(direction, index) {
      $scope.$emit('email.move.component', {direction: direction, component: vm.component});
    }

    function duplicateComponentFn() {
      $scope.$emit('email.duplicate.component', {component: vm.component});
    }

    function removeComponentFn() {
      $scope.$emit('email.remove.component', {component: vm.component});
    }

    function openMenuPanelFn(index) {

        vm.uiState.navigation.sectionPanel.reset();
        vm.uiState.showSectionPanel = false;
        vm.uiState.activeComponentIndex = null;

        vm.uiState.showSectionPanel = true;
        vm.uiState.activeComponentIndex = index;

    }


    function init(element) {
      vm.element = element;
    }

  }

})();
