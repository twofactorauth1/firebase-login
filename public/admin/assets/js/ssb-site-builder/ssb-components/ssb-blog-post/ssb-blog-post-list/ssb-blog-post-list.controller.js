(function(){

app.controller('SiteBuilderBlogPostListComponentController', ssbBlogPostListComponentController);

ssbBlogPostListComponentController.$inject = ['SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbBlogPostListComponentController(SimpleSiteBuilderBlogService) {

    console.info('ssb-blog-post-list directive init...')

    var vm = this;

    vm.init = init;
    vm.initData = initData;

    vm.blog = SimpleSiteBuilderBlogService.blog;

    function initData() {
        var posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts') || window.indigenous.precache.posts;
        if (posts) {
            vm.blog.posts = posts;
        }
    }

    function init(element) {

    	vm.element = element;

        if (!vm.blog.posts.length) {
            vm.initData();
        }

    }

}


})();
