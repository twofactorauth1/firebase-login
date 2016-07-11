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
    $scope.website = vm.website;
    $scope.primaryColor = $scope.website.settings.primary_color;
    $scope.secondaryColor = $scope.website.settings.secondary_color;
    $scope.primaryHighlight = $scope.website.settings.primary_highlight;
    $scope.primaryTextColor = $scope.website.settings.primary_text_color;
    $scope.primaryFontFamily = $scope.website.settings.font_family;
    $scope.secondaryFontFamily = $scope.website.settings.font_family_2;
    $scope.googleFontFamily = $scope.website.settings.google_font_family;

    $scope.primaryFontStack = $scope.website.settings.font_family;
    $scope.secondaryFontStack = $scope.website.settings.font_family_2;

    vm.init = init;

    function init(element) {
      vm.element = element;
    }

  }

})();
