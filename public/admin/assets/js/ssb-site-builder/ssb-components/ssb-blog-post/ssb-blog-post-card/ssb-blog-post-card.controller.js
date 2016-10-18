(function(){

app.controller('SiteBuilderBlogPostCardComponentController', ssbBlogPostCardComponentController);

ssbBlogPostCardComponentController.$inject = ['$scope', '$attrs', '$filter', '$location', 'SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbBlogPostCardComponentController($scope, $attrs, $filter, $location, SimpleSiteBuilderBlogService) {

    console.info('ssb-blog-post-card directive init...')

    var vm = this;

    vm.init = init;
    vm.featureImageStyle = featureImageStyle;
    vm.getPublishedDate = getPublishedDate;
    vm.initData = initData;
    vm.getFeaturedImageUrl = getFeaturedImageUrl;

    function initData() {
        var posts = SimpleSiteBuilderBlogService.loadDataFromPage('script#indigenous-precache-sitedata-posts');
        if(posts && posts.length)
           vm.post = posts[0];

    }

    function featureImageStyle(url){
        var styleString = " ";
        if(url){
            styleString += 'background-image: url("' + url + '");';
        }
    }

    function getPublishedDate(dateValue){        
        if(dateValue){
            return Date.parse(dateValue);
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


}


})();
