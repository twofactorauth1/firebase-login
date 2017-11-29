(function () {

  app.controller('EmailBuilderEditControlController', indiEmailBuilderEditControlController);

  indiEmailBuilderEditControlController.$inject = ['$scope', '$filter', '$timeout'];
  /* @ngInject */
  function indiEmailBuilderEditControlController($scope, $filter, $timeout) {

    var vm = this;

    vm.init = init;
    vm.moveComponentFn = moveComponentFn;
    vm.duplicateComponentFn = duplicateComponentFn;
    vm.removeComponentFn = removeComponentFn;
    vm.setActive = setActive;
    vm.uiState.activeElementHistory = [];

    function moveComponentFn(direction, index) {
      $scope.$emit('email.move.component', {direction: direction, component: vm.component});
    }

    function duplicateComponentFn() {
      $scope.$emit('email.duplicate.component', {component: vm.component});
    }

    function removeComponentFn() {
      $scope.$emit('email.remove.component', {component: vm.component});
    }

    function setActive(componentIndex, compiled) {

        vm.uiState.showSectionPanel = false;
        vm.uiState.navigation.sectionPanel.reset();
        vm.uiState.activeComponentIndex = undefined;

        if (compiled || (componentIndex === null && sectionIndex === null)) {
            setActiveElement();
        } else if (componentIndex !== undefined) {
            setActiveComponent(componentIndex);
        } else {
            vm.uiState.navigation.sectionPanel.reset();
            vm.uiState.showSectionPanel = false;
            vm.uiState.activeComponentIndex = null;
            vm.uiState.showSectionPanel = true;
        }

    }

    function setActiveComponent(componentIndex) {

        var component = vm.state.email.components[componentIndex];
        var name = $filter('cleanType')(component.type).toLowerCase().trim().replace(' ', '-');
        var sectionPanelLoadConfig = {
            name: name,
            id: component._id,
            componentId: component._id
        };

        $timeout(function() {

            vm.uiState.activeComponentIndex = componentIndex;

            vm.uiState.navigation.sectionPanel.loadPanel(sectionPanelLoadConfig);

            if (componentIndex !== undefined) {
                vm.uiState.showSectionPanel = true;
            }

        });

    }

    function setActiveElement() {

        console.log('vm.uiState.activeElement', vm.uiState.activeElement);

        var previousActiveElement = vm.uiState.activeElementHistory[vm.uiState.activeElementHistory.length - 1];

        if (vm.uiState.activeElement && vm.uiState.activeElement.type) {
            vm.uiState.activeElementHistory.push(vm.uiState.activeElement);
        } else {
            vm.uiState.activeElement = previousActiveElement;
        }

        var sectionPanelLoadConfig = {
            name: vm.uiState.activeElement.name,
            id: vm.uiState.activeElement.id
        };

        vm.uiState.navigation.sectionPanel.loadPanel(sectionPanelLoadConfig);
        vm.uiState.showSectionPanel = true;
    }


    function init(element) {
      vm.element = element;
    }

  }

})();
