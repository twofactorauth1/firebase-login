(function(){

app.controller('SiteBuilderImageComponentController', ssbImageComponentController);

ssbImageComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude'];
/* @ngInject */
function ssbImageComponentController($scope, $attrs, $filter, $transclude) {

  console.info('ssb-image directive init...')

  var vm = this;

  vm.init = init;

  function init(element) {
  	vm.element = element;
  }

}


})();
