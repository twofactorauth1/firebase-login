(function(){

app.controller('SiteBuilderBlogPostDetailComponentController', ssbBlogPostDetailComponentController);

ssbBlogPostDetailComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$location', 'SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbBlogPostDetailComponentController($scope, $attrs, $filter, $transclude, $location, SimpleSiteBuilderBlogService) {

    console.info('ssb-blog-post-detail directive init...')
    var vm = this;

    vm.init = init;
    vm.initData = initData;
    vm.getFeaturedImageUrl = getFeaturedImageUrl;

    function initData(account) {
        window.indigenous.precache = window.indigenous.precache || {};
        window.indigenous.precache.siteData = window.indigenous.precache.siteData || {};
        var posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts') || window.indigenous.precache.siteData.posts;
        var post = window.indigenous.precache.siteData.post;
        var includeSocial = window.indigenous.includeSocial;
        if (post) {
            vm.post = post;
        } else if (posts) {
            vm.post = posts[0];
        }
        // vm.post.post_content.replace('&lt;!-- more --&gt;', '');

        vm.includeSocial = includeSocial;
    }

    function getFeaturedImageUrl(url){
        if(url){
            return url.replace(/^(http|https):/i, "");
        }
    }

    function init(element) {
        vm.element = element;

        if (!vm.post) {
            vm.initData();
        }

    }

}


})();
