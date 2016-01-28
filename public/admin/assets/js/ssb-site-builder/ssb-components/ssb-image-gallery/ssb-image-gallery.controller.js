(function(){

app.controller('SiteBuilderImageGalleryComponentController', ssbImageGalleryComponentController);

ssbImageGalleryComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude'];
/* @ngInject */
function ssbImageGalleryComponentController($scope, $attrs, $filter, $transclude) {

  console.info('ssb-image-gallery directive init...')

  var vm = this;

  vm.init = init;


  function init(element) {
  	vm.element = element;
  }

}


})();
