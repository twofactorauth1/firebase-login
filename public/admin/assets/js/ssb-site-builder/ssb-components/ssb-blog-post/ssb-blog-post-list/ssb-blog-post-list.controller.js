(function(){

app.controller('SiteBuilderBlogPostListComponentController', ssbBlogPostListComponentController);

ssbBlogPostListComponentController.$inject = ['SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbBlogPostListComponentController(SimpleSiteBuilderBlogService) {

  console.info('ssb-blog-post-list directive init...')

  var vm = this;

  vm.init = init;

  vm.blog = SimpleSiteBuilderBlogService.blog;


  function init(element) {

  	vm.element = element;

    if (!vm.blog.posts.length) {
        vm.blog.posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts');
    }

  }

}


})();
