(function(){

app.controller('SiteBuilderBlogPostCardComponentController', ssbBlogPostCardComponentController);

ssbBlogPostCardComponentController.$inject = ['$scope', '$attrs', '$filter', '$location', 'SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbBlogPostCardComponentController($scope, $attrs, $filter, $location, SimpleSiteBuilderBlogService) {

    console.info('ssb-blog-post-card directive init...')

    var vm = this;

    vm.init = init;
    vm.initData = initData;

    function initData() {
        var posts = SimpleSiteBuilderBlogService.loadDataFromPage('script#indigenous-precache-sitedata-posts');
        if(posts && posts.length)
           vm.post = posts[0];

    }

    function init(element) {
        vm.element = element;

        if (!vm.post) {
            vm.initData();
        }

    }


}


})();
