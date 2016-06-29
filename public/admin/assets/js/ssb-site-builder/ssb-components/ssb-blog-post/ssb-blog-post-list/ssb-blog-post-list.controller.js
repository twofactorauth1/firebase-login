(function(){

app.controller('SiteBuilderBlogPostListComponentController', ssbBlogPostListComponentController);

ssbBlogPostListComponentController.$inject = ['SimpleSiteBuilderBlogService', '$scope', '$timeout'];
/* @ngInject */
function ssbBlogPostListComponentController(SimpleSiteBuilderBlogService, $scope, $timeout) {

    console.info('ssb-blog-post-list directive init...')

    var vm = this;

    vm.init = init;
    vm.initData = initData;
    vm.hasFeaturedPosts = false;

    vm.blog = SimpleSiteBuilderBlogService.blog;

    $scope.$watchCollection('vm.blog.posts', function(newValue) {
        if (newValue) {
            $timeout(function () {
                $scope.$broadcast('$refreshSlickSlider');
            }, 2000)
            checkHasFeaturedPosts();
        }
    });

    function initData() {
        var posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts') || window.indigenous.precache.siteData.posts;
        if (posts) {
            vm.blog.posts = posts;
            checkHasFeaturedPosts();
        }
    }

    function checkHasFeaturedPosts() {
        vm.hasFeaturedPosts = vm.blog.posts.filter(function(post){ return post.featured; }).length;
    }

    function init(element) {

    	vm.element = element;

        checkHasFeaturedPosts();

        if (!vm.blog.posts.length) {
            vm.initData();
        }

    }

}


})();
