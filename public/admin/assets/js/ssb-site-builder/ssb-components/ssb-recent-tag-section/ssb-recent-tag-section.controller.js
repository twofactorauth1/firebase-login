(function(){

app.controller('SiteBuilderBolgRecentTagComponentController', SiteBuilderBolgRecentTagComponentController);

SiteBuilderBolgRecentTagComponentController.$inject = ['SimpleSiteBuilderBlogService', '$scope', '$timeout', '$location', '$filter'];
/* @ngInject */
function SiteBuilderBolgRecentTagComponentController(SimpleSiteBuilderBlogService, $scope, $timeout, $location, $filter) {

    console.info('ssb-blog-recent-tags directive init...')

    var vm = this;

    vm.init = init;
    vm.hasFeaturedPosts = false;

    vm.blog = SimpleSiteBuilderBlogService.blog || {};
    vm.blog_tags=[];
    vm.filteredPostView = false;


    $scope.$watchCollection('vm.blog.posts', function(newValue) {
        if (newValue) {
            $timeout(function () {
                $scope.$broadcast('$refreshSlickSlider');
            }, 2000)
            vm.blog_tags=getTags();
        }
    });
    function getTags(){
        var blog_tags = []
        if (vm.blog.posts.length > 0) {
            angular.forEach(vm.blog.posts, function(post, key) {
                if (post.post_tags && post.post_tags.length > 0) {
                    angular.forEach(post.post_tags, function(tag, key1) {
                        if (blog_tags.indexOf(tag) == -1) {
                            blog_tags.push(tag)
                        }
                    })
                }
            })
        }
        return blog_tags;
    }
    function init(element) {
    	vm.element = element;
        vm.blog_tags=getTags();
        if(vm.blog_tags.length<1){
            element.closest("div.ssb-page-section").css({'display': 'none'});
        }
    }

}


})();
