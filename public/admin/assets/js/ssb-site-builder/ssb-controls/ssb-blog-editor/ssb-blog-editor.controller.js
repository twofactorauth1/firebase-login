(function(){

app.controller('SiteBuilderBlogEditorController', ssbSiteBuilderBlogEditorController);

ssbSiteBuilderBlogEditorController.$inject = ['$scope', 'SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbSiteBuilderBlogEditorController($scope, SimpleSiteBuilderBlogService) {

    console.info('site-builder blog-editor directive init...')

    var vm = this;

    vm.init = init;
    vm.closeBlogPanel = closeBlogPanel;

    vm.uiState.activePostFilter = 'all';

    vm.toggleFeatured = toggleFeatured;
    vm.togglePublished = togglePublished;


    function toggleFeatured(post) {
        post.featured = !post.featured;
        SimpleSiteBuilderBlogService.savePost(post).then(function() {
            console.log('saved post');
        }).catch(function(error) {
            console.error('error saving post');
        });
    }

    function togglePublished(post) {
        post.post_status = 'PUBLISHED';
        SimpleSiteBuilderBlogService.savePost(post).then(function() {
            console.log('saved post');
        }).catch(function(error) {
            console.error('error saving post');
        });
    }

    function closeBlogPanel() {
        vm.uiState.openBlogPanel = { name: '', id: '' };
        vm.uiState.openSidebarPanel = '';
    }

    function init(element) {

        vm.element = element;

        if (!vm.state.blog) {
            vm.state.blog = SimpleSiteBuilderBlogService.blog;
        }

        if (!vm.state.blog.posts.length) {
            vm.state.blog.posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts');
        }

    }
}

})();
