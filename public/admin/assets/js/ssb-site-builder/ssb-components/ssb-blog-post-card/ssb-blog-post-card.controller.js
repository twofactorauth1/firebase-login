(function(){

app.controller('SiteBuilderBlogPostCardComponentController', ssbBlogPostCardComponentController);

ssbBlogPostCardComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude'];
/* @ngInject */
function ssbBlogPostCardComponentController($scope, $attrs, $filter, $transclude) {

  console.info('ssb-blog-post-card directive init...')

  var vm = this;

  vm.init = init;

  function init(element) {
  	vm.element = element;
  }

}


})();
