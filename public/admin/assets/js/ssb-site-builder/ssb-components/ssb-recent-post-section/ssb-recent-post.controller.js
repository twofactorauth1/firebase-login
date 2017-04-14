(function(){

app.controller('SiteBuilderBolgRecentPostComponentController', ssbBlogRecentPostComponentController);

ssbBlogRecentPostComponentController.$inject = ['SimpleSiteBuilderBlogService', '$scope', '$timeout', '$location', '$filter'];
/* @ngInject */
function ssbBlogRecentPostComponentController(SimpleSiteBuilderBlogService, $scope, $timeout, $location, $filter) {

    console.info('ssb-blog-recent-post-list directive init...')

    var vm = this;

    vm.init = init;
    vm.initData = initData;
    vm.hasFeaturedPosts = false;

    var path = $location.$$url.replace('/page/', '');

    if(path){
        path = decodeURI(path);
    }

    vm.blog = SimpleSiteBuilderBlogService.blog || {};

    vm.sortBlogPosts = sortBlogPosts;

    vm.filteredPostView = false;

    if (path.indexOf("tag/") > -1) {
        vm.blog.currentTag = path.replace('/tag/', '');
        vm.filteredPostView = true;
    }

    if (path.indexOf("author/") > -1) {
        vm.blog.currentAuthor = path.replace('/author/', '');
        vm.filteredPostView = true;
    }

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
            if(vm.filteredPostView){
                if(vm.blog.currentAuthor){
                    posts =  posts.filter(function(post){
                        // console.log(post)
                        return post.post_author === vm.blog.currentAuthor
                    })
                }
                if(vm.blog.currentTag){
                    posts = posts.filter(function(post){
                        if (post.post_tags) {
                            return _.some(post.post_tags, function(tag) {
                                return tag.toLowerCase() === vm.blog.currentTag.toLowerCase()
                            })
                        }
                    })
                }
            }
            if(vm.blog.posts.length>5)
               vm.blog.posts=   vm.blog.posts.slice(0, 5)
            checkHasFeaturedPosts();
        }
    }

    function checkHasFeaturedPosts() {
        vm.hasFeaturedPosts = vm.blog.posts.filter(function(post){ return post.featured; }).length;
    }

    function sortBlogPosts(blogpost){
        return Date.parse($filter('date')(blogpost.modified.date|| blogpost.created.date, "MM/dd/yyyy"));
    }

    function init(element) {
    	vm.element = element;
        checkHasFeaturedPosts();

        if (!vm.blog.posts.length) {
            vm.initData();
        }else{
            if(vm.blog.posts.length>5){
               vm.blog.posts=   vm.blog.posts.slice(0, 5)
            }else if(vm.blog.posts.length<1){
                element.closest("div.ssb-page-section").css({'display': 'none'});
            }

        }

    }

}


})();
