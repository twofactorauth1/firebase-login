(function () {

  app.directive('emailEditControl', emailEditControl);

  function emailEditControl() {

    return {
      restrict: 'E',
      scope: {
        component: '=',
        componentIndex: '=',
        components: '=',
        state: '=',
        uiState: '='
      },
      templateUrl: '/admin/assets/js/indi-email-builder/email-edit-control/email-edit-control.component.html',
      controller: 'EmailBuilderEditControlController',
      controllerAs: 'vm',
      bindToController: true,
      link: function (scope, element, attrs, ctrl) {
        ctrl.init(element);
      }
    };

  }

})();
