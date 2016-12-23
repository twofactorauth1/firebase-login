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
    vm.floatSocialShareLinks = floatSocialShareLinks;

    function initData() {
        window.indigenous.precache = window.indigenous.precache || {};
        window.indigenous.precache.siteData = window.indigenous.precache.siteData || {};
        var posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts') || window.indigenous.precache.siteData.posts;
        var post = window.indigenous.precache.siteData.post;
        
        if (post) {
            vm.post = post;
        } else if (posts) {
            vm.post = posts[0];
        }
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

    function floatSocialShareLinks(){
        return $(window).width() > 600 && window.indigenous && window.indigenous.precache && window.indigenous.precache.siteData && window.indigenous.precache.siteData.post;
    }

}


})();
