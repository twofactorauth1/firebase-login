(function(){

app.controller('SiteBuilderBlogPostCardComponentController', ssbBlogPostCardComponentController);

ssbBlogPostCardComponentController.$inject = ['$scope', '$attrs', '$filter', '$location', 'SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbBlogPostCardComponentController($scope, $attrs, $filter, $location, SimpleSiteBuilderBlogService) {

    console.info('ssb-blog-post-card directive init...')

    var vm = this;

    vm.init = init;
    vm.initData = initData;
    vm.JSONLD = {};
    vm.setJSONLD = setJSONLD;

    function initData() {
        var posts = SimpleSiteBuilderBlogService.loadDataFromPage('script#indigenous-precache-sitedata-posts');
        if(posts && posts.length)
           vm.post = posts[0];

    }

    function setJSONLD() {
        var JSONLD = {
            "@context": "http://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": $location.href
            },
            "headline": vm.post.post_title,
            "image": {
                "@type": "ImageObject",
                "url": vm.post.featured_image
                // "height": 800,
                // "width": 800
            },
            "datePublished": "2015-02-05T08:00:00+08:00",
            "dateModified": vm.post.modified.date,
            "author": {
                "@type": "Person",
                "name": vm.post.post_author
            },
            "publisher": {
                "@type": "Organization",
                "name": "Indigenous",
                "logo": {
                    "@type": "ImageObject",
                    "url": "//s3.amazonaws.com/indigenous-digital-assets/account_6/indigenouslogo_1424781316317.gif",
                    "width": 276,
                    "height": 57
                }
            },
            "description": vm.post.post_excerpt
        }
        vm.element.find('[type="application/ld+json"]').html(JSONLD);
    }

    function init(element) {
        vm.element = element;

        if (!vm.post) {
            vm.initData();
        }

        if(vm.post)
            vm.setJSONLD();

    }


}


})();
