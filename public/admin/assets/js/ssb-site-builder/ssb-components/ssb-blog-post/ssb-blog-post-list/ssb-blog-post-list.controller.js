(function(){

app.controller('SiteBuilderBlogPostListComponentController', ssbBlogPostListComponentController);

ssbBlogPostListComponentController.$inject = ['SimpleSiteBuilderBlogService', '$scope', '$timeout'];
/* @ngInject */
function ssbBlogPostListComponentController(SimpleSiteBuilderBlogService, $scope, $timeout) {

    console.info('ssb-blog-post-list directive init...')

    var vm = this;

    vm.init = init;
    vm.initData = initData;

    vm.blog = SimpleSiteBuilderBlogService.blog;

    function initData() {
        var posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts') || window.indigenous.precache.siteData.posts;
        if (posts) {
            vm.blog.posts = posts;
        }
    }

    $scope.$watchCollection('vm.blog.posts', function(newValue) {
        if(newValue)
            $timeout(function () {
                $scope.$broadcast('$refreshSlickSlider');
            });

    })

    function init(element) {

    	vm.element = element;

        if (!vm.blog.posts.length) {
            vm.initData();
        }

    }

}


})();
