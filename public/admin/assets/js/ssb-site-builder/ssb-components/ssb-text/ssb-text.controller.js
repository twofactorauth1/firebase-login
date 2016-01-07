(function(){

app.controller('SiteBuilderTextComponentController', ssbTextComponentController);

ssbTextComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude'];
/* @ngInject */
function ssbTextComponentController($scope, $attrs, $filter, $transclude) {

  console.info('ssb-text directive init...')

  var vm = this;

  vm.init = init;


  function init(element) {
  	vm.element = element;
  }

}


})();
