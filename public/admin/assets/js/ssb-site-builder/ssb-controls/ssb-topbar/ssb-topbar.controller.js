(function(){

app.controller('SiteBuilderTopbarController', ssbSiteBuilderTopbarController);

ssbSiteBuilderTopbarController.$inject = ['$scope', '$rootScope', '$timeout', '$attrs', '$filter', 'SimpleSiteBuilderService', 'SimpleSiteBuilderBlogService', '$modal', '$location', 'SweetAlert', 'toaster', '$q'];
/* @ngInject */
function ssbSiteBuilderTopbarController($scope, $rootScope, $timeout, $attrs, $filter, SimpleSiteBuilderService, SimpleSiteBuilderBlogService, $modal, $location, SweetAlert, toaster, $q) {

    console.info('site-build topbar directive init...')

    var vm = this;

    vm.init = init;
    vm.savePage = savePage;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.revertPage = revertPage;
    vm.publishPage = publishPage;
    vm.hideActiveToolTips = hideActiveToolTips;
    vm.closeBlogPanel = closeBlogPanel;
    vm.backBlogPanel = backBlogPanel;
    vm.savePost = savePost;

    //TODO: refactor, this function exists in multiple controllers :)
    function savePage() {
        vm.state.saveLoading = true;
        var isLegacyPage = !vm.state.page.ssb;
        console.log(isLegacyPage);
        var promise = null;

        if (!vm.uiState.hasSeenWarning && isLegacyPage) {

            SweetAlert.swal({
              title: "Are you sure?",
              text: "CAUTION: This editor is under active development. Pages saved in Site Builder will not render or be editable in the legacy Pages editor.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes — Use Site Builder editor.",
              cancelButtonText: "No — Use the legacy editor.",
              closeOnConfirm: true,
              closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {

                    vm.uiState.hasSeenWarning = true;

                    vm.state.pendingPageChanges = false;

                    //hide section panel
                    vm.uiState.showSectionPanel = false;

                    //reset section panel
                    vm.uiState.navigation.sectionPanel.reset();

                    promise = saveWebsite().then(function(){
                        return (
                            SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                                SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                                    console.log('page saved');
                                    if (!vm.state.publishLoading) {
                                        toaster.pop('success', 'Page Saved', 'The page was saved successfully.');
                                    }
                                    vm.state.saveLoading = false;
                                })
                            }).catch(function(err) {
                                vm.state.saveLoading = false;
                                toaster.pop('error', 'Error', 'The page was not saved. Please try again.');
                            })
                        )
                    })
                }
                else{
                    vm.state.saveLoading = false;
                }
            });

        } else {
            vm.state.pendingPageChanges = false;

            //hide section panel
            vm.uiState.showSectionPanel = false;

            //reset section panel
            vm.uiState.navigation.sectionPanel.reset();

            promise = saveWebsite().then(function(){
                return (
                    SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                        SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                            console.log('page saved');
                            if (!vm.state.publishLoading) {
                                toaster.pop('success', 'Page Saved', 'The page was saved successfully.');
                            }
                            vm.state.saveLoading = false;
                        })
                    }).catch(function(err) {
                        toaster.pop('error', 'Error', 'The page was not saved. Please try again.');
                        vm.state.saveLoading = false;
                    })
                )
            })
        }


        return promise;

    }

    function cancelPendingEdits() {
        vm.uiState.openSidebarPanel = '';
        vm.uiState.showSectionPanel = false;
        vm.uiState.openSidebarSectionPanel = { name: '', id: '' };
        vm.state.pendingPageChanges = false;
        vm.state.pendingWebsiteChanges = false;
        SimpleSiteBuilderService.website = angular.copy(vm.state.originalWebsite);
        SimpleSiteBuilderService.page = angular.copy(vm.state.originalPage);
        vm.hideActiveToolTips();
    }

    function saveWebsite() {
        vm.state.pendingWebsiteChanges = false;
        return (
            SimpleSiteBuilderService.saveWebsite(vm.state.website).then(function(response){
                console.log('website saved');
            }).finally(function() {
                vm.hideActiveToolTips();
            })
        )
    }

    function revertPage(versionId) {
        vm.state.saveLoading = true;
        SimpleSiteBuilderService.revertPage(vm.state.page._id, versionId, function (data) {
            SimpleSiteBuilderService.getPage(data._id).then(function (page) {
                vm.uiState.openSidebarPanel = '';
                vm.uiState.showSectionPanel = false;
                vm.uiState.openSidebarSectionPanel = { name: '', id: '' };
                vm.state.pendingPageChanges = false;
                vm.state.pendingWebsiteChanges = false;
                SimpleSiteBuilderService.website = angular.copy(vm.state.originalWebsite);
                vm.state.originalPage = page.data;
                SimpleSiteBuilderService.page = angular.copy(vm.state.originalPage);
                vm.state.saveLoading = false;
            }).finally(function() {
                vm.hideActiveToolTips();
            })
        });
    };

    function publishPage() {
        vm.state.saveLoading = true;
        vm.state.publishLoading = true;
        var save = vm.savePage();

        if (save.then) {
            save.then(function(response) {
                SimpleSiteBuilderService.publishPage(vm.state.page._id).then(function (data) {
                    SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                        vm.state.publishLoading = false;
                        vm.state.page.modified = angular.copy(data.data.modified);
                        vm.state.page.published = angular.copy(data.data.published);
                        vm.state.pendingPageChanges = false;
                        vm.state.pendingWebsiteChanges = false;
                        toaster.pop('success', 'Page Published', 'The page was published successfully.');
                    })
                }).catch(function(err) {
                    vm.state.publishLoading = false;
                    toaster.pop('error', 'Error', 'The page was not published. Please try again.');
                    console.error(JSON.stringify(err));
                }).finally(function() {
                    vm.hideActiveToolTips();
                })
            })
        }

    };

    function hideActiveToolTips() {
        angular.element('.tooltip').remove();
    }

    function closeBlogPanel() {
        vm.savePost().then(function() {
            $rootScope.$broadcast('$destroyFroalaInstances');
            $timeout(function() {
                vm.uiState.openBlogPanel = { name: '', id: '' };
                vm.uiState.openSidebarPanel = '';
            }, 500);
        });
    }

    function backBlogPanel() {
        vm.savePost().then(vm.uiState.navigation.blogPanel.back);
    }

    function savePost(post, suppressToaster) {
        var post = post || vm.state.post;

        if (!post || !isValidPost()) {
            return SimpleSiteBuilderService.returnInvalidPost();
        }

        var toast = {};
        vm.uiState.saveLoading = true;
        post.websiteId = vm.state.website._id;
        post.display_title = angular.element('<div>' + post.post_title + '</div>').text().trim();
        post.post_url = slugifyHandle(angular.element('<div>' + post.post_title + '</div>').text().trim());
        return SimpleSiteBuilderBlogService.savePost(post).then(function(savedPost) {
            console.log('post saved');
            vm.state.post = savedPost.data;
            vm.state.pendingBlogChanges = false;
            toast = { type: 'success', title: 'Post Saved', message: 'The post was saved successfully.' };
        }).catch(function(error) {
            toast = { type: 'error', title: 'Error', message: (error.data ? error.data.message : 'Error updating post. Please try again.') };
            vm.handleSaveErrors(error);
        }).finally(function() {
            vm.uiState.saveLoading = false;
            if (!suppressToaster) {
                toaster.pop(toast.type, toast.title, toast.message);
            }
        });
    }

    function isValidPost(){
        return vm.state.post && vm.state.post.post_title;
    }

    function slugifyHandle(title){
       return $filter('slugify')(title);
    }


    function init(element) {
    	vm.element = element;
        if (!vm.state.page) {
            vm.state.page = SimpleSiteBuilderService.page;
        }
    }

}

})();
