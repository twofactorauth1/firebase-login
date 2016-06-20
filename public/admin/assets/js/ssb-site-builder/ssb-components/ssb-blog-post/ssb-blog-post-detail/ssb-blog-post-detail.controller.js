(function(){

app.controller('SiteBuilderBlogPostDetailComponentController', ssbBlogPostDetailComponentController);

ssbBlogPostDetailComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$location', 'SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbBlogPostDetailComponentController($scope, $attrs, $filter, $transclude, $location, SimpleSiteBuilderBlogService) {

    console.info('ssb-blog-post-detail directive init...')

    var vm = this;

    vm.init = init;
    vm.initData = initData;

    function initData() {
        var posts = window.indigenous.precache.siteData.posts;
        var post = window.indigenous.precache.siteData.post;
        if (post) {
            vm.post = post;
        } else if (posts) {
            vm.post = posts[0];
        }
        // vm.post.post_content.replace('&lt;!-- more --&gt;', '');
    }

    function init(element) {
        vm.element = element;

        if (!vm.post) {
            vm.initData();
        }

    }

}


})();
