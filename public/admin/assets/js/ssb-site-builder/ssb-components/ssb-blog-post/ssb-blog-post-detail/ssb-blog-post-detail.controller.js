(function(){

app.controller('SiteBuilderBlogPostDetailComponentController', ssbBlogPostDetailComponentController);

ssbBlogPostDetailComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$location', 'SimpleSiteBuilderBlogService', '$injector'];
/* @ngInject */
function ssbBlogPostDetailComponentController($scope, $attrs, $filter, $transclude, $location, SimpleSiteBuilderBlogService, $injector) {

    console.info('ssb-blog-post-detail directive init...')
    var vm = this;

    vm.init = init;
    vm.initData = initData;
    vm.getFeaturedImageUrl = getFeaturedImageUrl;

    vm.encodeUrlText = encodeUrlText;
    vm.floatSocialShareLinks = floatSocialShareLinks;
    vm.showSocialShare = false;
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

    function encodeUrlText(url){
        return encodeURI(url);
    }

    function init(element) {
        vm.element = element;
        if(window.indigenous && window.indigenous && window.indigenous.blogSocialSharing){            
            vm.showSocialShare = true;            
        }
        if ($injector.has("AccountService")){
            var accountService = $injector.get("AccountService");    
            accountService.getAccount(function(account) {
                if(account && account.showhide && account.showhide.blogSocialSharing !== false){
                    vm.showSocialShare = true;
                }
            })
        }
        
        if (!vm.post) {
            vm.initData();
        }

    }
    function floatSocialShareLinks(){
        return $(window).width() > 600 && window.indigenous && window.indigenous.precache && window.indigenous.precache.siteData && (window.indigenous.precache.siteData.posts || window.indigenous.precache.siteData.post);
    }

}


})();
