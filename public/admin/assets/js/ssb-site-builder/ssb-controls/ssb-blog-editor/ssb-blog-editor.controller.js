(function(){

app.controller('SiteBuilderBlogEditorController', ssbSiteBuilderBlogEditorController);

ssbSiteBuilderBlogEditorController.$inject = ['$scope', '$rootScope', '$timeout', 'SimpleSiteBuilderBlogService', 'SweetAlert', 'toaster', 'SimpleSiteBuilderService', '$filter'];
/* @ngInject */
function ssbSiteBuilderBlogEditorController($scope, $rootScope, $timeout, SimpleSiteBuilderBlogService, SweetAlert, toaster, SimpleSiteBuilderService, $filter) {

    console.info('site-builder blog-editor directive init...')

    var vm = this;

    vm.init = init;
    vm.ssbEditor = true;
    vm.ssbBlogEditor = true;

    vm.closeBlogPanel = closeBlogPanel;

    vm.uiState.activePostFilter = 'all';
    vm.uiState.froalaEditorActive = false;
    vm.editableElementSelectors = '.ssb-blog-editor-post-title, .ssb-blog-editor-post-body';
    vm.editableElements = [];

    vm.toggleFeatured = toggleFeatured;
    vm.togglePublished = togglePublished;
    vm.filter = filter;
    vm.duplicatePost = duplicatePost;
    vm.previewPost = previewPost;
    vm.deletePost = deletePost;
    vm.editPost = editPost;
    vm.publishPost = publishPost;
    vm.retractPost = retractPost;
    vm.savePost = savePost;
    vm.postExists = postExists;
    vm.setFeaturedImage = setFeaturedImage;
    vm.removeFeaturedImage = removeFeaturedImage;
    vm.handleSaveErrors = handleSaveErrors;

    vm.defaultPost = {
        post_title: '',
        post_content: 'Tell your story...',
        post_author: getDefualtAuthor()
    };


    function getDefualtAuthor(){
        if(vm.state.account && vm.state.account.business)
            return vm.state.account.business.name;
    }

    $scope.$watch(function() { return vm.uiState.openBlogPanel.id }, function(id) {
        if (id === 'edit' && !vm.uiState.froalaEditorActive) {
            // $timeout(vm.activateFroalaToolbar);
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
        vm.savePost(post);
    }

    function togglePublished(post) {
        post.post_status = post.post_status !== 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
        vm.savePost(post);
    }

    function closeBlogPanel() {
        $rootScope.$broadcast('$destroyFroalaInstances');
        $timeout(function() {
            vm.uiState.openBlogPanel = { name: '', id: '' };
            vm.uiState.openSidebarPanel = '';
        }, 500);
    }

    function duplicatePost(post) {

        SimpleSiteBuilderBlogService.duplicatePost(post).then(function() {
            console.log('duplicated post');
            toaster.pop('success', 'Duplicate Post Created', 'The post was created successfully.');
        }).catch(function(error) {
            console.error('error duplicating post');
            toaster.pop('error', 'Error', 'Error creating duplicate post. Please try again.');
        });

    }

    function previewPost(post) {
        // TODO: open new window for preview
        // URL: '/preview/blog/' + post.post_url
    }

    function deletePost(post) {

        SweetAlert.swal({
            title: "Are you sure?",
            text: "Do you want to delete this post?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                SimpleSiteBuilderBlogService.deletePost(post).then(function() {
                    console.log('deleted post');
                    toaster.pop('success', 'Post Deleted', 'The post was deleted successfully.');
                }).catch(function(error) {
                    console.error('error deleting post');
                    toaster.pop('error', 'Error', 'Error deleting post. Please try again.');
                });
            }
        });

    }

    function editPost(post) {
        vm.state.post = post;
        vm.uiState.navigation.blogPanel.loadPanel({ name: 'Edit Post', id: 'edit' })
    }

    function publishPost(post) {
        post.post_status = 'PUBLISHED';
        vm.savePost(post);
    }

    function retractPost(post) {
        post.post_status = 'DRAFT';
        vm.savePost(post);
    }

    function savePost(post){
        post.websiteId = vm.state.website._id;
        post.display_title = angular.element('<div>' + post.post_title + '</div>').text().trim();
        post.post_url = slugifyHandle(angular.element('<div>' + post.post_title + '</div>').text().trim());
        SimpleSiteBuilderBlogService.savePost(post).then(function(savedPost) {
            console.log('post saved');
            vm.state.post = savedPost.data;
            toaster.pop('success', 'Post Saved', 'The post was saved successfully.');
        }).catch(function(error) {
            toaster.pop('error', 'Error', error.data ? error.data.message : "Error updating post. Please try again.");
            vm.handleSaveErrors(error);
        });
    }

    function postExists(){
        return vm.state.post && vm.state.post._id && vm.state.post.post_title;
    }

    function slugifyHandle(title){
       return $filter('slugify')(title);
    }

    function setFeaturedImage(post) {
        if(!post)
        {
            return;
            console.log("no post");
        }
        SimpleSiteBuilderService.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg').result.then(function(){
            if(SimpleSiteBuilderService.asset){
                vm.state.post.featured_image = SimpleSiteBuilderService.asset.url;
                SimpleSiteBuilderService.asset = null;
            }
        })
    }

    function removeFeaturedImage(post) {
        post.featured_image = null;
    }

    function handleSaveErrors(error) {
        if (error.data && error.data.message === 'A post with this title already exists') {
            angular.element('input.ssb-blog-editor-post-title').focus();
        }
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
