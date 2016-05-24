(function(){

app.controller('SiteBuilderBlogPostListComponentController', ssbBlogPostListComponentController);

ssbBlogPostListComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude'];
/* @ngInject */
function ssbBlogPostListComponentController($scope, $attrs, $filter, $transclude) {

  console.info('ssb-blog-post-list directive init...')

  var vm = this;

  vm.init = init;

  function init(element) {
  	vm.element = element;
  }

}


})();
