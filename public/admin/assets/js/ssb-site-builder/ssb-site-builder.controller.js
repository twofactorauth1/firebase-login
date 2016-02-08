(function(){

app.controller('SiteBuilderController', ssbSiteBuilderController);

ssbSiteBuilderController.$inject = ['$scope', '$rootScope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$state', '$stateParams', '$modal', 'SweetAlert', '$window', '$timeout', '$location', 'toaster'];
/* @ngInject */
function ssbSiteBuilderController($scope, $rootScope, $attrs, $filter, SimpleSiteBuilderService, $state, $stateParams, $modal, SweetAlert, $window, $timeout, $location, toaster) {

    console.info('site-builder directive init...')

    var vm = this;

    vm.init = init;
    vm.state = {};

    vm.updateActiveSection = updateActiveSection;
    vm.updateActiveComponent = updateActiveComponent;
    vm.savePage = savePage;
    vm.saveWebsite = saveWebsite;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.openMediaModal = openMediaModal;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.insertMedia = insertMedia;
    vm.addFroalaImage = addFroalaImage;
    vm.imageEditor = {};
    vm.applyThemeToSite = SimpleSiteBuilderService.applyThemeToSite;
    vm.addSectionToPage = addSectionToPage;
    vm.legacyComponentMedia = legacyComponentMedia;
    vm.checkIfDirty = checkIfDirty;
    vm.resetDirty = resetDirty;


    vm.uiState = {
        loading: 0,
        activeSectionIndex: undefined,
        activeComponentIndex: undefined,
        show: {
            flyover: true,
            sidebar: true
        },
        accordion: {
            site: {},
            page: {},
            sections: {}
        },
        openSidebarPanel: '',
        openSidebarSectionPanel: { name: '', id: '' },
        showSectionPanel: false,
        componentControl: {}, //hook into component scope (contact-us)
        componentMedia: vm.legacyComponentMedia //hook into component scope (image-gallery)
    };


    vm.uiState.navigation = {
        back: function() {
            vm.uiState.navigation.index = 0;
            vm.uiState.navigation.indexClass = 'ssb-sidebar-position-0';
        },
        loadPage: function(pageId) {
            if (pageId && pageId !== vm.state.page._id) {
                SimpleSiteBuilderService.getPages();
                SimpleSiteBuilderService.getSite(vm.state.website._id);
                if(!vm.state.pendingWebsiteChanges && !vm.state.pendingPageChanges)
                    vm.uiState.loaded = false;
                $location.path('/website/site-builder/pages/' + pageId);
            } else {
                vm.uiState.navigation.index = 1;
                vm.uiState.navigation.indexClass = 'ssb-sidebar-position-1';
            }
        },
        goToPagesListPage: function() {
            $location.url('/website/site-builder/pages/');
        },
        index: 0,
        indexClass: 'ssb-sidebar-position-1',
        sectionPanel: {
            navigationHistory: [],
            loadPanel: function(obj, back) {

                if (!back) {
                    vm.uiState.navigation.sectionPanel.navigationHistory.push(obj);
                }

                vm.uiState.openSidebarSectionPanel = obj;
                console.log(vm.uiState.navigation.sectionPanel.navigationHistory);

            },
            back: function() {
                var hist = vm.uiState.navigation.sectionPanel.navigationHistory;
                var previousPanel;

                hist.pop();

                previousPanel = hist.length ? hist[hist.length - 1] : { name: '', id: ''};

                vm.uiState.navigation.sectionPanel.loadPanel(previousPanel, true);
            },
            reset: function() {
                vm.uiState.openSidebarSectionPanel = { name: '', id: '' };
                vm.uiState.navigation.sectionPanel.navigationHistory = [];
            }
        }
    };

    $scope.$watch(function() { return SimpleSiteBuilderService.website; }, function(website){
        vm.state.pendingWebsiteChanges = false;
        vm.state.website = website;
        vm.state.originalWebsite = null;
        $timeout(function() {
            vm.state.originalWebsite = angular.copy(website);
        }, 0);
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.page; }, function(page){
        vm.state.pendingPageChanges = false;
        vm.state.page = page;
        vm.state.originalPage = null;
        $timeout(function() {
            vm.state.originalPage = angular.copy(page);
        }, 0);
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.activeSectionIndex }, updateActiveSection, true);

    $scope.$watch(function() { return SimpleSiteBuilderService.activeComponentIndex }, updateActiveComponent, true);

    $scope.$watch(function() { return SimpleSiteBuilderService.loading }, updateLoading, true);

    $scope.$watch('vm.state.page', function(page) {
        if (page && vm.state.originalPage && !angular.equals(page, vm.state.originalPage)) {
            vm.state.pendingPageChanges = true;
            console.log("Page changed");
            setupBreakpoints();
        } else {
            vm.state.pendingPageChanges = false;
        }
    }, true);

    $scope.$watch('vm.state.website', function(website) {
        if (website && vm.state.originalWebsite && !angular.equals(website, vm.state.originalWebsite)) {
            vm.state.pendingWebsiteChanges = true;
            console.log("Website changed");
        } else {
            vm.state.pendingWebsiteChanges = false;
        }
    }, true);

    $scope.$watch(function() { return SimpleSiteBuilderService.pages }, function(pages) {
      // To track duplicate pages 
      vm.state.originalPages = angular.copy(pages);
      vm.state.pages = angular.copy(pages);
      
      //filter blog pages and coming soon
      if(pages){
        delete vm.state.pages["blog"];
        delete vm.state.pages["single-post"];
        delete vm.state.pages["coming-soon"];
      }      
      var parsed = angular.fromJson(vm.state.pages);
      var arr = [];
      _.each(parsed, function (page) {
          arr.push(page);
      });
      vm.state.arr_pages = arr;
    }, true);

    //TODO: optimize this, we dont need to watch since this won't change
    $scope.$watch(function() { return SimpleSiteBuilderService.themes }, function(themes) {
      vm.state.themes = themes;
    }, true);

    //TODO: optimize this, we dont need to watch since this won't change
    $scope.$watch(function() { return SimpleSiteBuilderService.templates }, function(templates) {
      vm.state.templates = templates;
    }, true);

    $scope.$watch(function() { return SimpleSiteBuilderService.legacyTemplates }, function(templates) {
      vm.state.legacyTemplates = templates;
    }, true);

    $scope.$watch(function() { return SimpleSiteBuilderService.platformSections }, function(sections) {
      vm.state.platformSections = sections;
    }, true);

    $scope.$watch(function() { return SimpleSiteBuilderService.userSections }, function(sections) {
      vm.state.userSections = sections;
    }, true);

    $rootScope.$on('$stateChangeStart',
        function (event) {
            $rootScope.app.layout.isMinimalAdminChrome =  false;
        }
    );

    function checkIfDirty() {
        return vm.state.pendingWebsiteChanges || vm.state.pendingPageChanges;
    }

    function resetDirty() {
        vm.state.pendingWebsiteChanges = false;
        vm.state.pendingPageChanges = false;
    }

    function saveWebsite() {
        vm.state.pendingWebsiteChanges = false;
        return (
            SimpleSiteBuilderService.saveWebsite(vm.state.website).then(function(response){
                console.log('website saved');
            })
        )
    }

    //TODO: refactor, this function exists in multiple controllers :)
    function savePage() {
        vm.state.saveLoading = true;
        var isLegacyPage = !vm.state.page.ssb;
        console.log(isLegacyPage);

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

                    saveWebsite().then(function(){
                        return (
                            SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                                SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                                    console.log('page saved');
                                    toaster.pop('success', 'Page Saved', 'The page was saved successfully.');
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

            saveWebsite().then(function(){
                return (
                    SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                        SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                            SimpleSiteBuilderService.getPages().then(function(){
                                console.log('page saved');
                                toaster.pop('success', 'Page Saved', 'The page was saved successfully.');
                                vm.state.saveLoading = false;
                            })
                        })
                    }).catch(function(err) {
                        toaster.pop('error', 'Error', 'The page was not saved. Please try again.');
                        vm.state.saveLoading = false;
                    })
                )
            })
        }

    }

    function cancelPendingEdits() {
      vm.state.pendingPageChanges = false;
      vm.state.pendingWebsiteChanges = false;
      vm.state.website = angular.copy(vm.state.originalWebsite);
      vm.state.page = angular.copy(vm.state.originalPage);
    }

    function updateActiveSection(index) {
        if (index !== undefined) {
            vm.uiState.accordion.sections = {};
            vm.uiState.activeSectionIndex = index;
            vm.uiState.accordion.sections.isOpen = true;
            vm.uiState.accordion.sections[index] = { components: {} };
            vm.uiState.accordion.sections[index].isOpen = true;

            //if there is only 1 component in a section, make it active
            if (vm.state.page.sections[index] && vm.state.page.sections[index].components && vm.state.page.sections[index].components.length === 1) {
                updateActiveComponent(0);
            } else {
                SimpleSiteBuilderService.setActiveComponent(undefined);
            }

        }

        //reset section sidebar panel navigation
        vm.uiState.navigation.sectionPanel.reset();
    }

    function updateActiveComponent(index) {
        vm.uiState.activeComponentIndex = index;

        if (index !== undefined) {
            if (vm.uiState.accordion.sections[vm.uiState.activeSectionIndex]) {
              if (!vm.uiState.accordion.sections[vm.uiState.activeSectionIndex].components[index]) {
                  vm.uiState.accordion.sections[vm.uiState.activeSectionIndex].components[index] = {};
              }
              vm.uiState.accordion.sections[vm.uiState.activeSectionIndex].components[index].isOpen = true;
            }
        }

    }

    function updateLoading(loadingObj) {
        console.info('vm.uiState.loading', loadingObj );
        vm.uiState.loading = loadingObj.value;

        if (!vm.uiState.loaded) {
            $timeout(function() {
                vm.uiState.loaded = true;
            }, 2000);
        }
    }

    function closeModal() {
        vm.modalInstance.close();
    }

    function openModal(modal, controller, index, size) {
      console.log('openModal >>> ', modal, controller, index);
      var _modal = {
        templateUrl: modal,
        keyboard: false,
        backdrop: 'static',
        size: 'md',
        scope: $scope,
        resolve: {
            parentVm: function () {
                return vm;
            }
        }
      };

      if (controller) {
        _modal.controller = controller + ' as vm';
      }

      if (size) {
        _modal.size = 'lg';
      }

      vm.modalInstance = $modal.open(_modal);

      vm.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });

    }

    function openMediaModal(modal, controller, index, size) {
        console.log('openModal >>> ', modal, controller, index);
        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'md',
            resolve: {
                vm: function() {
                    return vm;
                }
            }
        };

        if (controller) {
            _modal.controller = controller;

            _modal.resolve.showInsert = function () {
              return vm.showInsert;
            };

            _modal.resolve.insertMedia = function () {
              return vm.insertMedia;
            };
        }

        if (angular.isDefined(index) && index !== null && index >= 0) {
            // vm.setEditingComponent(index);
            _modal.resolve.clickedIndex = function () {
              return index;
            };
            if (vm.state.page) {
              _modal.resolve.pageHandle = function () {
                return $vm.state.page.handle;
              };
            }
        }

        if (size) {
            _modal.size = 'lg';
        }

        vm.modalInstance = $modal.open(_modal);

        vm.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });

    }

    function addSectionToPage(section, version) {
      SimpleSiteBuilderService.addSectionToPage(section, version, vm.modalInstance);
    }

    function insertMedia(asset) {
        vm.addFroalaImage(asset);
    };

    function addFroalaImage(asset) {
        vm.imageEditor.editor.image.insert(asset.url, !1, null, vm.imageEditor.img);
    };

    function setupBreakpoints() {
        $timeout(function() {
            console.log('setupBreakpoints')
            $window.eqjs.refreshNodes();
            $window.eqjs.query();
        }, 3000);
    };

    function legacyComponentMedia(componentId, index, update) {
        // $scope.imageChange = true;
        // $scope.showInsert = true;
        // $scope.updateImage = update;
        // $scope.componentImageIndex = index;
        // $scope.componentEditing = _.findWhere($scope.components, {
        //     _id: componentId
        // });
        // $scope.openModal('media-modal', 'MediaModalCtrl', null, 'lg');

        var component = _(vm.state.page.sections)
            .chain()
            .pluck('components')
            .flatten()
            .findWhere({_id: componentId})
            .value()

        SimpleSiteBuilderService.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg', vm, component, index, update).result.then(function(){
            // debugger;

            //TODO: somehow need to trigger this if component.type === 'thumbnail-slider'
            // $scope.thumbnailSlider.refreshSlider();
        })
    }

    // Hook froala insert up to our Media Manager
    window.clickandInsertImageButton = function (editor) {
      console.log('clickandInsertImageButton >>> ');
      vm.showInsert = true;
      vm.imageEditor.editor = editor;
      vm.imageEditor.img = editor.image.get();
      vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');
    };



    function init(element) {

        vm.element = element;

        angular.element("body").on("click", ".ssb-page-section a", function (e) {
          if (!angular.element(this).hasClass("clickable-link")) {
            e.preventDefault();
            e.stopPropagation();
          }
        });

        angular.element("body").on("click", ".ssb-page-section", function (e) {
          vm.uiState.openSidebarPanel = '';
          // vm.uiState.showSectionPanel = true;
        });

        setupBreakpoints();

        vm.uiState.isSidebarClosed = $rootScope.app.layout.isSidebarClosed;
        $rootScope.app.layout.isMinimalAdminChrome = true;

        vm.uiStateOriginal = angular.copy(vm.uiState);

    }


}

})();
