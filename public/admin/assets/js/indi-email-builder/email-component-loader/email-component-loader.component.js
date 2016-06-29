(function () {

  app.directive('emailComponentLoader', emailComponentLoader);

  emailComponentLoader.$inject = ['$compile', '$timeout'];
  /* @ngInject */
  function emailComponentLoader($compile, $timeout) {
    return {
      restrict: 'A',
      controller: 'EmailBuilderComponentLoaderController',
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        component: "=",
        website: "=",
        account: '=',
        componentClass: '&',
        componentStyle: '&',
        componentIndex: '=',
        componentCount: '='
      },
      replace: false,
      templateUrl: '/admin/assets/js/indi-email-builder/email-component-loader/email-component-loader.component.html',
      link: function (scope, element, attrs, ctrl) {


      }
    }

  }

})();
