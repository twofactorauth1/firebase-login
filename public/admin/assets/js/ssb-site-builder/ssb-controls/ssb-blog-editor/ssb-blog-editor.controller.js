(function(){

app.controller('SiteBuilderBlogEditorController', ssbSiteBuilderBlogEditorController);

ssbSiteBuilderBlogEditorController.$inject = ['$scope', 'SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbSiteBuilderBlogEditorController($scope, SimpleSiteBuilderBlogService) {

    console.info('site-builder blog-editor directive init...')

    var vm = this;

    vm.init = init;
    vm.closeBlogPanel = closeBlogPanel;

    vm.blog = SimpleSiteBuilderBlogService.blog;

    function closeBlogPanel() {
        vm.uiState.openBlogPanel = { name: '', id: '' };
        vm.uiState.openSidebarPanel = '';
    }

    function init(element) {

        vm.element = element;

        if (!vm.blog.posts.length) {
            vm.blog.posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts');
        }

    }
}

})();
