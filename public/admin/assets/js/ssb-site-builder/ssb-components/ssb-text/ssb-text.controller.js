(function(){

app.controller('SiteBuilderTextComponentController', ssbTextComponentController);

ssbTextComponentController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams', '$transclude'];
/* @ngInject */
function ssbTextComponentController($scope, $attrs, $filter, SimpleSiteBuilderService, $stateParams, $transclude) {

  console.info('ssb-text directive init...')

  var vm = this;

  vm.init = init;


  function init(element) {
  	vm.element = element;
  }

}


})();
