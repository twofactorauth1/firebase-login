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
