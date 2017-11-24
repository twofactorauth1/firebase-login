(function(){

app.controller('SiteBuilderController', ssbSiteBuilderController);

ssbSiteBuilderController.$inject = ['$scope', '$rootScope', '$attrs', '$filter', 'SimpleSiteBuilderService', 'SimpleSiteBuilderBlogService', '$state', '$stateParams', '$modal', 'SweetAlert', '$window', '$timeout', '$location', 'toaster','UtilService', '$sce'];
/* @ngInject */
function ssbSiteBuilderController($scope, $rootScope, $attrs, $filter, SimpleSiteBuilderService, SimpleSiteBuilderBlogService, $state, $stateParams, $modal, SweetAlert, $window, $timeout, $location, toaster,UtilService, $sce) {
     
    console.info('site-builder directive init...');

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
    vm.insertVideoMedia = insertVideoMedia;
    vm.addFroalaImage = addFroalaImage;
    vm.state.imageEditor = {};
    vm.applyThemeToSite = SimpleSiteBuilderService.applyThemeToSite;
    vm.addSectionToPage = addSectionToPage;
    vm.legacyComponentMedia = legacyComponentMedia;
    vm.checkIfDirty = checkIfDirty;
    vm.resetDirty = resetDirty;
    vm.pageChanged = pageChanged;
    vm.toggleSectionVisiblity = toggleSectionVisiblity;
    vm.isBlogPage = isBlogPage;
    vm.isBlogCopy = isBlogCopy;
    vm.isBlogEditMode = isBlogEditMode;
    vm.isBlogEditWritingMode = isBlogEditWritingMode;
    vm.saveAndLoadPage = saveAndLoadPage;
    vm.openPageSettingsModal = openPageSettingsModal;
    // vm.checkStateNavigation = checkStateNavigation;
    vm.checkPageNavigation = checkPageNavigation;
    vm.savePost = savePost;
    vm.updateColumnLayout = updateColumnLayout;
    vm.setDefaultSpacing = setDefaultSpacing;
    vm.resetDefaultSpacing = resetDefaultSpacing;
    vm.updatetestimonialWidth = updatetestimonialWidth;
    vm.onBorderChange = onBorderChange;
    vm.isNavHero = isNavHero;
    vm.isSortableDisabled = angular.element($window).width() < 768 ? true : false
    vm.toggleSidebarPanel = toggleSidebarPanel;
    vm.resizeWindow = resizeWindow;
    vm.isTextColumnNum = isTextColumnNum;
    vm.closeSidePanel = closeSidePanel;
    vm.showPageSection = showPageSection;
  
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
        componentMedia: vm.legacyComponentMedia, //hook into component scope (image-gallery)
        sidebarOrientation: 'vertical',

        sortableListPageContentConfig: {
            sort: false,
            filter: '.fr-wrapper',
            group: 'section',
            scroll: true,
            animation: 150,
            disabled: true,
            ghostClass: "sortable-ghost",  // Class name for the drop placeholder
            //chosenClass: "sortable-chosen",  // Class name for the chosen item
            onAdd: function (evt) {
                if(vm.uiState.draggedSection)
                    SimpleSiteBuilderService.getSection(vm.uiState.draggedSection, vm.uiState.draggedSection.version || 1).then(function(response) {
                        if (response) {
                            var formattedSection = SimpleSiteBuilderService.setTempUUIDForSection(response);
                            formattedSection = SimpleSiteBuilderService.checkAndSetGlobalHeader(formattedSection);
                            vm.state.page.sections[evt.newIndex] = formattedSection;
                        }
                    });
            },
            onEnd: function (evt) {
               console.log("Dragging End");
            }
        },

        sortableListAddContentConfig: {
            sort: false,
            // forceFallback: true,
            disabled: vm.isSortableDisabled,
            group: {
                name: 'section',
                pull: 'clone',
                model: 'vm.uiState.filteredSections'
            },
            animation: 150,
            ghostClass: "sortable-ghost",  // Class name for the drop placeholder
            chosenClass: "list-add-sortable-chosen",  // Class name for the chosen item
            scroll: true,
            onStart: function (evt) {
                vm.uiState.sortableListPageContentConfig.disabled = false;
                angular.element(".sortable-page-content").addClass("dragging");
                var _top = angular.element("ssb-topbar").offset().top;
                var _height = angular.element("ssb-topbar").height();
                var _winHeight = angular.element(window).height();
                var _heightDiff = _height + _top;
                angular.element(".sortable-page-content").height(_winHeight - _heightDiff);
            },
            onEnd: function (evt, e) {
                vm.uiState.activeSectionIndex = evt.newIndex;
                angular.element(".sortable-page-content").removeClass("dragging");
                angular.element(".sortable-page-content").css('height','auto');
                $timeout(function() {
                    vm.uiState.sortableListPageContentConfig.disabled = true;
                    vm.uiState.openSidebarPanel = '';
                    var scrollContainerEl = document.querySelector('.ssb-site-builder-container');
                    var activeSection = document.querySelector('.ssb-active-section');
                    if (activeSection) {
                      scrollContainerEl.scrollTop = activeSection.offsetTop;
                    }
                });
            },
            onSort: function (evt) {
                console.log("On Sort");
            },
            onMove: function (evt) {
                var sectionId = evt.dragged.attributes["sectionId"].value;
                vm.uiState.draggedSection = _.findWhere(vm.uiState.filteredSections, {
                    _id: sectionId
                });
            }
        },

        toggleSection: vm.toggleSectionVisiblity,

        openBlogPanel: {},

        isBlogPage: false,

        isBlogCopy: false,

        isBlogEditMode: false,

        isBlogEditWritingMode: false,

        saveAndLoadPage: vm.saveAndLoadPage,

        openPageSettingsModal: vm.openPageSettingsModal,

        checkIfBlogPage: vm.isBlogPage,

        checkIfBlogCopy: vm.isBlogCopy,

        isDuplicateGlobalHeader: false,

        updateColumnLayout: vm.updateColumnLayout,

        setDefaultSpacing: vm.setDefaultSpacing,

        resetDefaultSpacing: vm.resetDefaultSpacing,

        updatetestimonialWidth:vm.updatetestimonialWidth,

        onBorderChange:vm.onBorderChange,

        isNavHero: vm.isNavHero,

        toggleSidebarPanel: vm.toggleSidebarPanel,

        resizeWindow: vm.resizeWindow,

        isTextColumnNum: vm.isTextColumnNum,

        locationFinderOptions: SimpleSiteBuilderService.getLocationFinderRanges(),

        alignmentOptions : ['left', 'center', 'right'],

        closeSidePanel: vm.closeSidePanel,

        showPageSection: vm.showPageSection

    };
    UtilService.flyoverhide(vm.uiState);
    
    vm.uiState.navigation = {
        back: function() {
            vm.uiState.navigation.index = 0;
            vm.uiState.navigation.indexClass = 'ssb-sidebar-position-0';
        },
        loadPage: function(pageId) {
            if (pageId && pageId !== vm.state.page._id) {
                SimpleSiteBuilderService.getPages();
                if(!vm.state.pendingWebsiteChanges && !vm.state.pendingPageChanges){
                    vm.uiState.loaded = false;
                }
                $timeout(function() {
                    vm.state.saveAndLoading = false;
                }, 0);
                $location.path('/website/site-builder/pages/' + pageId);
            } else {
                vm.uiState.navigation.index = 1;
                vm.uiState.navigation.indexClass = 'ssb-sidebar-position-1';
                $timeout(function() {
                    vm.state.saveAndLoading = false;
                }, 0);
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

                previousPanel = hist[hist.length - 1];

                vm.uiState.navigation.sectionPanel.loadPanel(previousPanel, true);

                if(previousPanel && !previousPanel.id){
                    hideAllControls();
                    angular.element(".ssb-active-section").addClass("ssb-active-edit-control");
                }

            },
            reset: function() {
                vm.uiState.openSidebarSectionPanel = { name: '', id: '' };
                vm.uiState.navigation.sectionPanel.navigationHistory = [];
            }
        },
        componentPanel: {
            loadPanel: function(sectionIndex, componentIndex) {
                var component = vm.state.page.sections[sectionIndex].components[componentIndex];
                var name = $filter('cleanType')(component.type).toLowerCase().trim().replace(' ', '-');
                var sectionPanelLoadConfig = {
                    name: name,
                    id: component._id,
                    componentId: component._id
                };

                $timeout(function() {

                    SimpleSiteBuilderService.setActiveSection(sectionIndex);
                    SimpleSiteBuilderService.setActiveComponent(componentIndex);

                    vm.uiState.navigation.sectionPanel.loadPanel(sectionPanelLoadConfig);

                    if (sectionIndex !== undefined && componentIndex !== undefined) {
                        vm.uiState.showSectionPanel = true;
                        var el = angular.element("#component_"+ component._id);
                        hideAllControls();

                        $timeout(function() {
                            if(el.find("[data-edit]").length === 1){
                                el.find("[data-edit]").addClass("ssb-active-component");
                            }
                            else{
                                el.find(".ssb-edit-control-component-area").first().next("[data-edit]").addClass("ssb-active-component");
                            }
                        }, 100);

                    }

                });
            }
        },
        blogPanel: {
            navigationHistory: [],
            loadPanel: function(obj, back) {

                if (!back) {
                    vm.uiState.navigation.blogPanel.navigationHistory.push(obj);
                }

                vm.uiState.openBlogPanel = obj;
                console.log(vm.uiState.navigation.blogPanel.navigationHistory);

            },
            back: function() {
                var hist = vm.uiState.navigation.blogPanel.navigationHistory;
                var previousPanel;

                hist.pop();

                previousPanel = hist[hist.length - 1];

                vm.uiState.navigation.blogPanel.loadPanel(previousPanel, true);

            }
        }
    };

    vm.uiState.componentIcons = SimpleSiteBuilderService.manageComponentIcons;

    /**
     * event listeners
     */
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
        // vm.checkStateNavigation(event, toState, toParams, fromState, fromParams, options);
        $rootScope.$broadcast('$destroyFroalaInstances');
        $rootScope.app.layout.isMinimalAdminChrome = false;
        //$rootScope.app.layout.isSidebarClosed = vm.uiState.isSidebarClosed;
    });

    $rootScope.$on('$locationChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
        // vm.checkStateNavigation(event, toState, toParams, fromState, fromParams, options);
    });

    $rootScope.$on('$ssbUpdateUiState', function (event, uiStateObj) {
        console.log('uiStateObj', uiStateObj);
        angular.extend(vm.uiState, uiStateObj);
    });

    $scope.$on('$destroy', destroy);



    /**
     * watchers
     */
    var unbindWebsiteServiceWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.website; }, function(website){
        vm.state.pendingWebsiteChanges = false;
        if(website && website.themeOverrides && website.themeOverrides.styles && !angular.isDefined(website.themeOverrides.styles.primarySliderDotColor))
            website.themeOverrides.styles.primarySliderDotColor = '#FFF';
        if(website && website.themeOverrides && website.themeOverrides.styles && !angular.isDefined(website.themeOverrides.styles.primarySliderActiveDotColor))
            website.themeOverrides.styles.primarySliderActiveDotColor = '#000';
        if(website && website.themeOverrides && website.themeOverrides.styles && !angular.isDefined(website.themeOverrides.styles.primarySliderDotColorOpacity))
            website.themeOverrides.styles.primarySliderDotColorOpacity = 0.4;
        vm.state.website = website;    
        setCustomCss();
        vm.state.originalWebsite = null;
        $timeout(function() {
            vm.state.originalWebsite = angular.copy(website);
        }, 1000);
    });

    var unbindPageServiceWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.page; }, function(page){
        $rootScope.$broadcast('$destroyFroalaInstances');
        vm.state.pendingPageChanges = false;
        vm.state.page = page;
        setCustomCss();
        vm.state.originalPage = null;
        vm.uiState.isBlogPage = vm.isBlogPage(vm.state.page);
        vm.uiState.isBlogCopy = vm.isBlogCopy(vm.state.page);
        $timeout(function() {
            vm.state.originalPage = angular.copy(page);
        }, 1000);
    });

    var unbindActiveSectionWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.activeSectionIndex }, updateActiveSection, true);

    var unbindActiveComponentWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.activeComponentIndex }, updateActiveComponent, true);

    var unbindLoadingWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.loading }, updateLoading, true);

    var unbindPageStateWatcher = $scope.$watch('vm.state.page', _.debounce(function(page) {
        console.time('angular.equals for page');
        if (page && vm.state.originalPage && vm.pageChanged(page, vm.state.originalPage)) {
            console.timeEnd('angular.equals for page');
            vm.state.pendingPageChanges = true;
            console.log("Page changed");
            if (vm.uiState && vm.uiState.selectedPage) {
                vm.uiState.selectedPage = vm.state.page;
            }
            setupBreakpoints();
        } else {
            vm.state.pendingPageChanges = false;
        }
    }, 100), true);

    var unbindWebsiteStateWatcher = $scope.$watch('vm.state.website', function(website) {
        if (SimpleSiteBuilderService.websiteLoading && website && vm.state.originalWebsite && !angular.equals(website, vm.state.originalWebsite)) {
            vm.state.pendingWebsiteChanges = true;
            console.log("Website changed");
        } else {
            vm.state.pendingWebsiteChanges = false;
        }
    }, true);

    var unbindLinkListsWatcher = $scope.$watch('vm.state.website.linkLists', function(linkLists) {
        if(linkLists){
            sortPageList();
        }
    }, true);

    var unbindPagesWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.pages }, function(pages) {
      // To track duplicate pages
      vm.state.originalPages = angular.copy(pages);
      vm.state.pages = angular.copy(pages);

      //filter blog pages and signup
      if (pages) {
        vm.state.pages = _.reject(pages, function(page){ return page.handle === "blog" || page.handle === "single-post"
            || page.handle === "signup"
        });
      }
      if(vm.state.website) {
          sortPageList();
      }

    }, true);

    //TODO: optimize this, we dont need to watch since this won't change
    var unbindThemesWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.themes }, function(themes) {
      vm.state.themes = themes;
      unbindThemesWatcher();
    }, true);

    //TODO: optimize this, we dont need to watch since this won't change
    var unbindTemplatesWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.templates }, function(templates) {
      vm.state.templates = templates;
      unbindTemplatesWatcher();
    }, true);

    var unbindLegacyTemplatesWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.legacyTemplates }, function(templates) {
      vm.state.legacyTemplates = templates;
      unbindLegacyTemplatesWatcher();
    }, true);

    var unbindPlatformSectionWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.platformSections }, function(sections) {
      if(sections){
        vm.state.platformSections = sections;
        unbindPlatformSectionWatcher();
      }

    }, true);

    var unbindUserSectionWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.userSections }, function(sections) {
      vm.state.userSections = sections;
      unbindUserSectionWatcher();
    }, true);

    var unbindAccountWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.account }, function(account) {
        vm.state.account = account;
        setCustomCss();
        vm.uiState.hideSocialShare = false;
            if(account && account.showhide && account.showhide.blogSocialSharing === false){
                vm.uiState.hideSocialShare = true;
            }
        unbindAccountWatcher();
    }, true);

    var unbindOpenSidebarPanel = $scope.$watch(function() { return vm.uiState.openSidebarPanel }, function() {
        vm.uiState.isBlogEditMode = vm.isBlogEditMode();

        if (vm.uiState.isBlogEditMode) {
            angular.element('#intercom-container').hide();
        } else {
            angular.element('#intercom-container').show();
            vm.uiState.openBlogPanel = {};
        }

    }, true);

    var unbindOpenSidebarPanel = $scope.$watch(function() { return vm.uiState.openBlogPanel }, function() {
        vm.uiState.isBlogEditWritingMode = vm.isBlogEditWritingMode();
    }, true);

    $scope.$watch(function() { return SimpleSiteBuilderService.customFonts }, function(customFonts) {
      if(angular.isDefined(customFonts)){
        _.each(customFonts, function(font){
            font.name = font.filename.substring(0, font.filename.indexOf('.')).replace(/ /g, "_");
        })
        vm.state.customFonts = customFonts;
      }
    }, true);


    function checkIfDirty() {
        return vm.state.pendingWebsiteChanges || vm.state.pendingPageChanges || vm.state.pendingBlogChanges;
    }

    function resetDirty() {
        vm.state.pendingWebsiteChanges = false;
        vm.state.pendingPageChanges = false;
        vm.state.pendingBlogChanges = false;
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
                                vm.uiState.pageSaving = true;
                                SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                                    
                                    console.log('page saved');
                                    toaster.pop('success', 'Page Saved', 'The page was saved successfully.');
                                    vm.state.saveLoading = false;
                                    SimpleSiteBuilderService.saveOtherPageLinks();
                                    $timeout(function() {
                                        vm.uiState.pageSaving = false;
                                    }, 2000);
                                })
                            }).catch(function(err) {
                                vm.state.saveLoading = false;
                                vm.uiState.pageSaving = false;
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
                                SimpleSiteBuilderService.saveOtherPageLinks();
                            })
                        })
                    }).catch(function(err) {
                        toaster.pop('error', 'Error', 'The page was not saved. Please try again.');
                        vm.state.saveLoading = false;
                    })
                )
            })


            if (vm.state.post && vm.state.pendingBlogChanges) {
                vm.savePost(vm.state.post);
            }

        }

    }

    function cancelPendingEdits() {
        vm.pageSectionClick();
        vm.state.pendingPageChanges = false;
        vm.state.pendingWebsiteChanges = false;
        SimpleSiteBuilderService.website = angular.copy(vm.state.originalWebsite);
        SimpleSiteBuilderService.page = angular.copy(vm.state.originalPage);
    }

    function updateActiveSection(index) {
        if (index !== undefined) {
            vm.uiState.accordion.sections = {};
            vm.uiState.activeSectionIndex = index;
            vm.uiState.accordion.sections.isOpen = true;
            vm.uiState.accordion.sections[index] = { components: {} };
            vm.uiState.accordion.sections[index].isOpen = true;
            if(vm.state.page.sections[index])
                vm.uiState.isDuplicateGlobalHeader = SimpleSiteBuilderService.checkDuplicateGlobalHeader(vm.state.page.sections[index]);
        } else {
            vm.uiState.activeSectionIndex = undefined;
            vm.uiState.activeComponentIndex = undefined;
            vm.uiState.isDuplicateGlobalHeader = false;
        }

        $timeout(function() {
            $(window).trigger('resize');
        }, 100);

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

    $scope.$watch("vm.uiState.loaded", function(value){
        if(angular.isDefined(value)){
            if(value){
                $timeout(function() {
                    $rootScope.app.layout.editorLoaded = true; 
                    $scope.$broadcast('parallaxCall', {});
                }, 1000);
            }
            else{
                $rootScope.app.layout.editorLoaded = false;   
            }
        }
    })

    function closeModal() {
        vm.modalInstance.close();
    }

    function openModal(modal, controller, index, size) {
      console.log('openModal >>> ', modal, controller, index);
      var _modal = {
        templateUrl: modal,
        keyboard: true,
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
            keyboard: true,
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

            _modal.resolve.isSingleSelect = function () {
                return true;
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


    function openVideoMediaModal(modal, controller, index, size) {
        console.log('openModal >>> ', modal, controller, index);
        var _modal = {
            templateUrl: modal,
            keyboard: true,
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
              return vm.insertVideoMedia;
            };

            _modal.resolve.isSingleSelect = function () {
                return true;
            };
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
    }

    

    function addFroalaImage(asset) {

        $timeout(function() {
            SimpleSiteBuilderService.isImage(asset.url).then(function(response){
                if(response === false){
                   vm.state.imageEditor.editor.video.insertByMediaAsset(asset.url);
                }
                else{
                    if(vm.callBackImage)
                        vm.callBackOnImageInsert(asset.url, vm.callBackImage);
                    else
                        vm.state.imageEditor.editor.image.insertByMediaCallback(asset.url, vm.state.imageEditor.img);                    
                }
            }) 
        }, 0);

    };


    function insertVideoMedia(asset) {
        addFroalaVideo(asset);
    };

    function addFroalaVideo(asset) {

        $timeout(function() {
            vm.callBackOnVideoInsert(asset.url, vm.callBackVedio);
        }, 0);

    };

    function setupBreakpoints() {
        $timeout(function() {
            console.log('setupBreakpoints');
            $window.eqjs.refreshNodes();
            $window.eqjs.query();
        }, 3000);
    };

    function legacyComponentMedia(componentId, index, update, fields) {
        var component = _(vm.state.page.sections)
            .chain()
            .pluck('components')
            .flatten()
            .findWhere({_id: componentId})
            .value();

        SimpleSiteBuilderService.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg', vm, component, index, update, fields).result.then(function(){
           if(component.type === 'thumbnail-slider'){
                $scope.$broadcast('refreshThumbnailSlider');
           }
        })
    }

    // Hook froala insert up to our Media Manager
    window.clickandInsertImageButton = function (editor, image, callBack) {
      console.log('clickandInsertImageButton >>> ');
        vm.callBackOnImageInsert = callBack;
        vm.callBackImage = image;
        if(editor){
            vm.showInsert = true;
            vm.state.imageEditor.editor = editor;
            vm.state.imageEditor.img = image;
        }
        else{
            if(vm.state.imageEditor && vm.state.imageEditor.editor){
                vm.showInsert = true;
            }
            else{
                vm.showInsert = false;
            }
        }
      vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');
    };

    // Hook froala insert up to our Media Manager
    window.clickandInsertVideoButton = function (editor, video, callBack) {
      console.log('clickandInsertImageButton >>> ');
      vm.callBackOnVideoInsert = callBack;
      vm.callBackVedio = video;
      if(editor){
        vm.showInsert = true;
      }
      openVideoMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');
    };

    $scope.$on('focusEditor', function (event, args) {
      vm.state.imageEditor.editor = args.editor;
      vm.state.imageEditor.img = null;
    });
    $scope.$on('activeEditor', function (event, args) {
      if(args.editor)
       vm.state.imageEditor.editor = args.editor;
      if(args.editorImage)
       vm.state.imageEditor.img = args.editorImage;
    });

    function pageLinkClick(e) {
      if (!angular.element(this).hasClass("clickable-link")) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    function pageSectionClick(e) {
        // vm.uiState.openSidebarPanel = '';
    }

    function pageResize(e) {

        if ($('body').innerWidth() > 767) {
            vm.uiState.sidebarOrientation = 'vertical';
        } else {
            vm.uiState.sidebarOrientation = 'horizontal';
        }

    }

    function hideAllControls() {

        //hide editable-title's and borders
        angular.element('.ssb-edit-wrap, .editable-title, .editable-cover, [data-edit]', '.ssb-main').removeClass('ssb-on');

        //hide all edit-controls
        angular.element('.ssb-main').find('.ssb-active-edit-control').removeClass('ssb-active-edit-control');
        angular.element('.ssb-main').find('.ssb-on').removeClass('ssb-on');

        //components
        angular.element('.ssb-main').find('.ssb-active-component').removeClass('ssb-active-component');

        //btns
        angular.element('.ssb-main').find('.ssb-theme-btn-active-element').removeClass('ssb-theme-btn-active-element');
        angular.element('.ssb-main').find('.ssb-edit-control-component-btn').removeClass('on');

    }

    /**
     * Inspect changes beyond simple angular.equals
     * - if angular.equals detects a change, then:
     *      - get the specific change from the data (DeepDiff)
     *      - if that change is ONLY a [data-compile] difference, then:
     *          - ignore it as a change
     *          - apply to original data so future compares don't include this diff
     *          - decrement changes so we don't count it in number of changes
     *          - return changes > 0
     *      - else the change is legit, return true
     * - else the change is legit, return true
     *
     * TODO: handle undo in Froala
     */
    function pageChanged(originalPage, currentPage) {
        if (!angular.equals(originalPage, currentPage) && !vm.state.pendingPageChanges) {
            var originalPage = JSON.parse(angular.toJson(originalPage));
            var currentPage = JSON.parse(angular.toJson(currentPage));
            var jsondiff1 = DeepDiff.diff(originalPage, currentPage);
            var changes = jsondiff1.length;

            if (changes) {

                for (var i = 0; i < changes; i++) {

                    console.debug('tracked change');
                    console.debug(jsondiff1[i].lhs);
                    console.debug(jsondiff1[i].rhs);

                    var diff1 = jsondiff1[i].lhs;
                    var diff2 = jsondiff1[i].rhs;
                    var changedPath = jsondiff1[i].path;
                    if (dataIsCompiledAdded(diff1, diff2) || dataIsCompiledRemoved(diff1, diff2) || dataIsPublishedDate(diff1, diff2, changedPath) || dataIsSliderInitialized(diff1, diff2, changedPath) || isDataCompiledChanged(diff1, diff2) || isEmptyStyleAdded(diff1, diff2, changedPath)) {

                        console.debug('change to ignore detected @: ', jsondiff1[i].path);

                        $timeout(function() {

                            DeepDiff.applyChange(originalPage, currentPage, jsondiff1[i]);

                            vm.state.originalPage = originalPage;

                            console.debug('should be empty: ', DeepDiff.diff(originalPage, currentPage));

                            changes--;

                            return changes > 0;

                        });

                    } else {
                        console.log(diff1);
                        console.log(diff2);
                        return true;
                    }
                }
            } else {

                return changes > 0;

            }

        } else {

            return true

        }

    }

    /**
     * Detect changes to page data, determine if they should be ignored
     * - handles temp IDs for buttons inside Froala editor (button was added)
     */
    function dataIsCompiledAdded(diff1, diff2) {
            var updated = false;

            if (diff1 && diff2) {
                updated = angular.isDefined(diff1) &&
                        angular.isDefined(diff1.indexOf) &&
                        diff1.indexOf('data-compiled') === -1
                        angular.isDefined(diff2) &&
                        angular.isDefined(diff2.indexOf) &&
                        diff2.indexOf('data-compiled') !== -1;
            }

            if (updated && angular.isDefined(diff1) && angular.isDefined(diff2)) {
                updated = angular.equals(diff1, diff2)
            }

            return updated;
    };

    /**
     * Detect changes to page data, determine if they should be ignored
     * - handles temp IDs for buttons inside Froala editor (button was removed)
     */
    function dataIsCompiledRemoved(diff1, diff2) {
        return  diff1 &&
                diff2 &&
                angular.isDefined(diff1) &&
                angular.isDefined(diff1.indexOf) &&
                diff1.indexOf('data-compiled') !== -1 &&
                angular.isDefined(diff2) &&
                angular.isDefined(diff2.indexOf) &&
                diff2.indexOf('data-compiled') === -1
    };

    /**
     * Detect changes to page data, determine if they should be ignored
     * - handles page's published date updating after a successful publish action
     */
    function dataIsPublishedDate(diff1, diff2, path) {
        var ret = false;
        var isPublished = false;
        var isPublishedBy = false;
        if(path){
            if(path.indexOf("published") > -1){
                isPublished = true;
                if(path.indexOf("by") > -1){
                    isPublishedBy = true;
                }
            }
        }
        if (diff1 && isPublished) {
            if (diff1.length < 30 && diff1.indexOf(':') !== -1 && diff1.indexOf('-') !== -1) {
                if (moment(diff1).isValid()) {
                    ret = true;
                }
            }
            else if(diff1.date && !diff2){
                ret = true;
            }
            else if(isPublishedBy){
                ret = true;
            }
        }

        return ret;
    };

    function isDataCompiledChanged(diff1, diff2) {
        if(diff1 &&
                diff2 &&
                angular.isDefined(diff1) &&
                angular.isDefined(diff1.indexOf) &&
                diff1.indexOf('data-compiled') !== -1 &&
                angular.isDefined(diff2) &&
                angular.isDefined(diff2.indexOf) &&
                diff2.indexOf('data-compiled') !== -1)
            {
                var regex =  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g ;
                var compareString1 = diff1.replace(regex, "").replace(/ ng-scope/g, "").replace(/undefined/g, "");
                var compareString2 = diff2.replace(regex, "").replace(/ ng-scope/g, "").replace(/undefined/g, "");;

                return angular.equals(compareString1, compareString2);
            }
    };

    function dataIsSliderInitialized(diff1, diff2, path) {
        var ret = false;
        
        if(path){
            if(path.indexOf("slider") > -1){
                if(diff1 && diff1.sliderDotColorOpacity === null && !diff2){
                    ret = true;
                }
            }
        }
        return ret;
    };

    function isEmptyStyleAdded(diff1, diff2, path) {
        if(diff1 &&
                diff2 &&
                angular.isDefined(diff1) && angular.isDefined(diff2))
            {
                if(!_.isString(diff1)) {
                    diff1 = "" + diff1;
                }
                if(!_.isString(diff2)) {
                    diff2 = "" + diff2;
                }
                var compareString1 = diff1.replace(/ style=''/g, "");
                var compareString2 = diff2.replace(/ style=''/g, "");

                return angular.equals(compareString1, compareString2);
            }
    };

    // function checkStateNavigation(event, toState, toParams, fromState, fromParams, options) {

    //     SweetAlert.swal({
    //         title: "Are you sure?",
    //         text: "You have unsaved changes. Are you sure you want to leave Site Builder?",
    //         type: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "#DD6B55",
    //         confirmButtonText: "Yes, leave without saving.",
    //         cancelButtonText: "Cancel",
    //         closeOnConfirm: true,
    //         closeOnCancel: true
    //     },
    //     function (isConfirm) {
    //         if (!isConfirm) {
    //             event.preventDefault();
    //         }
    //     });

    // }

    function checkPageNavigation(event) {
        if (vm.state.pendingPageChanges || vm.state.pendingWebsiteChanges || vm.state.pendingBlogChanges) {
            return "You have unsaved changes. Are you sure you want to leave Site Builder?";
        } else {
            return undefined
        }
    }

    function sortPageList(){
        _.each(vm.state.website.linkLists, function (value, index) {
            if (value.handle === "head-menu") {
                var handlesArr = _(value.links).chain().pluck("linkTo")
                            .where({type: 'page'})
                            .pluck("data")
                            .value()
                var _sortOrder = _.invert(_.object(_.pairs(handlesArr)));
                vm.state.pages = _.sortBy(vm.state.pages, function(x) {
                    return _sortOrder[x.handle]
                });
            }
        });
    }

    function toggleSectionVisiblity(section, global, hide){
        if (global) {
            if(section.global === false) {
                SweetAlert.swal({
                    title: "Are you sure?",
                    text: "Turning off this setting will remove the section from all pages except for this one.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Remove from other pages",
                    cancelButtonText: "Cancel",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm) {
                    //Cancel
                    if (!isConfirm) {
                        section.global = true;
                    }
                });
            }
        } else if(section.global) {
            if(!section.hiddenOnPages){
                section.hiddenOnPages = {}
            }
            if(section.visibility === false)
            {
                section.hiddenOnPages[vm.state.page.handle] = true;
                hideAllControls();
            }
            else{
                delete section.hiddenOnPages[vm.state.page.handle];
            }
        }
        else if(section.visibility === false){
            hideAllControls();
        }
    }

    function isBlogPage(page) {
        return page.handle === 'blog-list' || page.handle === 'blog-post' || page.isBlogCopy;
    }

    function isBlogCopy(page) {
        return page.isBlogCopy;
    }

    function isNavHero(section){
        return section && section.title && section.title.toLowerCase() === "nav + hero";
    }

    function isBlogEditMode() {
        return angular.isDefined(vm.uiState.openBlogPanel.id) && vm.uiState.openSidebarPanel === 'blog';
    }

    function isBlogEditWritingMode() {
        return angular.isDefined(vm.uiState.openBlogPanel.id) && vm.uiState.openSidebarPanel === 'blog' && vm.uiState.openBlogPanel.id === 'edit';
    }

    function saveAndLoadPage(page) {
        vm.uiState.openSidebarPanel = '';
        vm.state.saveAndLoading = true;
        if (vm.state.pendingPageChanges || vm.state.pendingWebsiteChanges) {
            vm.state.saveLoading = true;            
            vm.state.pendingWebsiteChanges = false;
            vm.state.pendingPageChanges = false;
            saveWebsite().then(function(){
                return (
                    SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                        SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                            console.log('page saved');
                            toaster.pop('success', 'Page Saved', 'The page was saved successfully.');
                            vm.state.saveLoading = false;
                            SimpleSiteBuilderService.saveOtherPageLinks();
                            vm.uiState.navigation.loadPage(page._id);
                            SimpleSiteBuilderService.getPages();
                            $timeout(function() {
                                vm.state.saveAndLoading = false;
                            }, 0);                            
                        })
                    }).catch(function(err) {
                        toaster.pop('error', 'Error', 'The page was not saved. Please try again.');
                        vm.state.saveLoading = false;
                        $timeout(function() {
                            vm.state.saveAndLoading = false;
                        }, 0);
                    })
                )
            })
        } else {
            vm.uiState.navigation.loadPage(page._id);
            SimpleSiteBuilderService.getPages();
            $timeout(function() {
                vm.state.saveAndLoading = false;
            }, 0);
        }
    };

    function openPageSettingsModal(modal, controller, index, size, pageId) {
      console.log('openModal >>> ', modal, controller, index);
      var _modal = {
        templateUrl: modal,
        keyboard: true,
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

      _modal.resolve.pageId = function () {
        return pageId;
      };

      vm.modalInstance = $modal.open(_modal);

      vm.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });

    }

    function savePost(post) {
        return SimpleSiteBuilderBlogService.savePost(post).then(function(savedPost) {
            console.log('post saved');
            vm.state.pendingBlogChanges = false;
        }).error(function(err) {
            console.error('post save error:', err);
        })
    }





    function destroy() {

        console.debug('destroyed main SiteBuilder controller');

        angular.element("body").off("click", ".ssb-page-section a", pageLinkClick);

        angular.element("body").off("click", ".ssb-page-section", pageSectionClick);

        angular.element('.ssb-main').off('eqResize', pageResize);

        angular.element($window).off('beforeunload', vm.checkPageNavigation);

        unbindWebsiteServiceWatcher();
        unbindPageServiceWatcher();
        unbindActiveSectionWatcher();
        unbindActiveComponentWatcher();
        unbindLoadingWatcher();
        unbindPageStateWatcher();
        unbindWebsiteStateWatcher();
        unbindLinkListsWatcher();
        unbindPagesWatcher();
        unbindThemesWatcher();
        unbindTemplatesWatcher();
        unbindLegacyTemplatesWatcher();
        unbindPlatformSectionWatcher();
        unbindUserSectionWatcher();
        unbindAccountWatcher();
        unbindOpenSidebarPanel();
        unbindOpenSidebarPanel();

    }

    function updateColumnLayout(section){
        if(section && section.layoutModifiers && section.layoutModifiers.columns){
            var columns = parseInt(section.layoutModifiers.columns.columnsNum);
            var rows = section.layoutModifiers.columns.rowsNum ? parseInt(section.layoutModifiers.columns.rowsNum) : 1;
            columns = columns * rows;
            if(section.layoutModifiers.columns.ignoreColumns && section.layoutModifiers.columns.ignoreColumns.length){
                columns = columns + section.layoutModifiers.columns.ignoreColumns.length;
            }

            var columnLength = section.components.length;
            if(columnLength){
                if(section.components.length < columns){
                    var _diff =  columns - section.components.length;
                    var component = section.components[0];

                    SimpleSiteBuilderService.getTempComponent(component).then(function(data){
                        while(_diff !== 0){
                            data._id = SimpleSiteBuilderService.getTempUUID();
                            data.anchor = data._id;
                            var _newComponent = angular.copy(data);
                            if(section.layoutModifiers.columns.ignoreColumns && section.layoutModifiers.columns.ignoreColumns.indexOf("last") > -1){
                                section.components.splice(section.components.length - 1, 0, _newComponent);
                            }
                            else{
                                section.components.push(_newComponent);
                            }
                            _diff--;
                        }
                    })
                }
                
                // Remove empty components
                else if(section.components.length > columns){
                    var _diff =  section.components.length - columns;
                    
                    while(_diff !== 0){
                        if(section.layoutModifiers.columns.ignoreColumns && section.layoutModifiers.columns.ignoreColumns.indexOf("last") > -1){
                            section.components.splice(section.components.length - 2, 1);
                        }
                        else{
                            section.components.splice(section.components.length - 1, 1);
                        }
                        _diff--;
                    }
                }
            }
        }
    }

    function setDefaultSpacing(section, value){
        if(!section.spacing){
            section.spacing = {};
        }
        section.spacing.default = value ? false : true;
    }


    function resetDefaultSpacing(section){
        if(section.spacing){
            section.spacing.mt = "";
            section.spacing.ml = "";
            section.spacing.mb = "";
            section.spacing.mr = "";

            section.spacing.mtxs = "";
            section.spacing.mlxs = "";
            section.spacing.mbxs = "";
            section.spacing.mrxs = "";

            section.spacing.mtsm = "";
            section.spacing.mlsm = "";
            section.spacing.mbsm = "";
            section.spacing.mrsm = "";

            section.spacing.mtmd = "";
            section.spacing.mlmd = "";
            section.spacing.mbmd = "";
            section.spacing.mrmd = "";

            section.spacing.pt = "";
            section.spacing.pl = "";
            section.spacing.pb = "";
            section.spacing.pr = "";

            section.spacing.ptxs = "";
            section.spacing.plxs = "";
            section.spacing.pbxs = "";
            section.spacing.prxs = "";

            section.spacing.ptsm = "";
            section.spacing.plsm = "";
            section.spacing.pbsm = "";
            section.spacing.prsm = "";

            section.spacing.ptmd = "";
            section.spacing.plmd = "";
            section.spacing.pbmd = "";
            section.spacing.prmd = "";
        }
    }

    function updatetestimonialWidth(section){

        if(section.components && section.components.length>0 &&
           section.components[0].type === 'testimonials' &&
           section.components[0].version == 2){
            $timeout(function() {
                if (section.spacing &&
                section.spacing.mw &&
                section.components[0].customWidth &&
                section.spacing.mw != '100%' &&
                section.components[0].customWidth != '100%' &&
                section.spacing.mw < section.components[0].customWidth){
                  $scope.$apply(function() {
                      section.components[0].customWidth = section.spacing.mw;
                  })
                }
                $scope.$broadcast('updatetestimonialHeight.component', {})
            }, 1000);
        }
        else if(section && section.type === 'testimonials' &&
           section.version == 2){
            $timeout(function() {
                $scope.$broadcast('updatetestimonialHeight.component', {})
            }, 500);
        }
    }
    function onBorderChange(section){
        return {
                floor: 0,
                ceil: 100,
                onEnd: function() {
                    updatetestimonialWidth(section);
                }
            };
    }
    $scope.$on('$refreshAccountSettings', function(event, account) {
        if(account && account._id){
            vm.state.account = account;
            if(account && account.showhide && account.showhide.blogSocialSharing === false){
                vm.uiState.hideSocialShare = true;
            }
        }
    });


    function toggleSidebarPanel(type){
       
    
        if(!vm.state.saveAndLoading)
            vm.uiState.openSidebarPanel = type;
    }

    function closeSidePanel($event){
        if($event.target.nodeName != "BUTTON")
            vm.uiState.openSidebarPanel=''
    }

    function resizeWindow(){
        $timeout(function() {
            $(window).trigger('resize');
        }, 500);
    }


    function isTextColumnNum(component){
        return component && component.layoutModifiers && component.layoutModifiers.columns && angular.isDefined(component.layoutModifiers.columns.columnsNum);        
    }

    function showPageSection(section){
        var _showSection = false;
        if(section)
        {
            _showSection = section.visibility !== false;
            if(section.global && section.hiddenOnPages){
                var _pageHandle;
                if(vm.state){
                    _pageHandle = vm.state.page.handle;
                }
                else{
                    _pageHandle = $scope.$root.pageHandle;
                }
                _showSection = !section.hiddenOnPages[_pageHandle];
                section.visibility =  _showSection;
            }
        }
        return _showSection;
    }
    
    function setCustomCss(){
        var css = "";
        if(vm.state && vm.state.page && vm.state.account && vm.state.website){
            var customCss = [];

            if(vm.state.account.showhide && vm.state.account.showhide.customCss && vm.state.website.resources && vm.state.website.resources.customCss && website.resources.toggles && website.resources.toggles.customCss){
                if(vm.state.website.resources.customCss.global && vm.state.website.resources.customCss.global.original){
                    customCss.push(vm.state.website.resources.customCss.global.original);
                }
            
                if(vm.state.page && vm.state.page.handle && vm.state.website.resources.customCss[vm.state.page.handle] && vm.state.website.resources.customCss[vm.state.page.handle].original){
                    customCss.push(vm.state.website.resources.customCss[vm.state.page.handle].original);
                }
            }
            if(customCss.length){
                css = $sce.trustAsHtml(customCss.join('\n\n'));
            }
        }
        vm.state.customCss = css;
    }

    function init(element) {

        vm.element = element;

        angular.element("body").on("click", ".ssb-page-section a", pageLinkClick);

        angular.element("body").on("click", ".ssb-page-section", pageSectionClick);

        angular.element('.ssb-main').on('eqResize', pageResize);

        // angular.element($window).on('beforeunload', vm.checkPageNavigation);

        setupBreakpoints();
        $rootScope.app.layout.isSidebarClosed = true;

        $rootScope.app.layout.isMinimalAdminChrome = true;

        vm.uiStateOriginal = angular.copy(vm.uiState);

        vm.state.permissions = SimpleSiteBuilderService.permissions;

    }


}

})();
