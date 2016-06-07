(function(){

app.controller('SiteBuilderBlogEditorController', ssbSiteBuilderBlogEditorController);

ssbSiteBuilderBlogEditorController.$inject = ['$scope', '$timeout', 'SimpleSiteBuilderBlogService'];
/* @ngInject */
function ssbSiteBuilderBlogEditorController($scope, $timeout, SimpleSiteBuilderBlogService) {

    console.info('site-builder blog-editor directive init...')

    var vm = this;

    vm.init = init;
    vm.closeBlogPanel = closeBlogPanel;

    vm.uiState.activePostFilter = 'all';
    vm.uiState.froalaEditorActive = false;

    vm.toggleFeatured = toggleFeatured;
    vm.togglePublished = togglePublished;
    vm.filter = filter;
    vm.activateFroalaToolbar = activateFroalaToolbar;


    $scope.$watch(function() { return vm.uiState.openBlogPanel.id }, function(id) {
        if (id === 'edit' && !vm.uiState.froalaEditorActive) {
            $timeout(vm.activateFroalaToolbar);
        }
    }, true);


    function filter(item) {

        var filter = false;

        //['','all','published','draft','featured']

        if (vm.uiState.activePostFilter === 'all' || vm.uiState.activePostFilter === '') {
            filter = true;
        }

        if (vm.uiState.activePostFilter === 'published') {
            filter = item.post_status.toLowerCase() === 'published';
        }

        if (vm.uiState.activePostFilter === 'draft') {
            filter = item.post_status.toLowerCase() === 'draft';
        }

        if (vm.uiState.activePostFilter === 'featured') {
            filter = item.featured;
        }

        return filter;

    }

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

    function activateFroalaToolbar() {
        $(vm.element).find('.ssb-blog-editor-post-title, .ssb-blog-editor-post-body')
            .on('froalaEditor.initialized', function(e, editor) {

              //topbar positioning
              // $('.fr-toolbar.fr-inline.fr-desktop:first').addClass('ssb-froala-first-editor');
              //scope.$emit('initializeEditor', { editor: editor });
              //set initial text
              // if (ngModel.$viewValue) {
              //   var html = ngModel.$viewValue.replace("<span>", "<span style=''>");
              //   editor.html.set(html);
              // }
              //compile special elements
              // scope.compileEditorElements(editor, true);

            }).froalaEditor($.FroalaEditor.config);

            vm.froalaEditorActive = true;
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
