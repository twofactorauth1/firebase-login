(function(){

app.controller('SiteBuilderBlogPostDetailComponentController', ssbBlogPostDetailComponentController);

ssbBlogPostDetailComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude'];
/* @ngInject */
function ssbBlogPostDetailComponentController($scope, $attrs, $filter, $transclude) {

  console.info('ssb-blog-post-detail directive init...')

  var vm = this;

  vm.init = init;

  function init(element) {
  	vm.element = element;
  }

}


})();
