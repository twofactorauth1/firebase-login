(function(){

app.controller('SiteBuilderController', ssbSiteBuilderController);

ssbSiteBuilderController.$inject = ['$scope', '$rootScope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams', '$modal'];
/* @ngInject */
function ssbSiteBuilderController($scope, $rootScope, $attrs, $filter, SimpleSiteBuilderService, $stateParams, $modal) {

    console.info('site-builder directive init...')

    var vm = this;

    vm.init = init;
    vm.state = {};
    vm.uiState = {
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
        }
    };
    vm.toggleSidebarFlyover = toggleSidebarFlyover;
    vm.updateActiveSection = updateActiveSection;
    vm.updateActiveComponent = updateActiveComponent;
    vm.savePage = savePage;
    vm.saveWebsite = saveWebsite;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.openMediaModal = openMediaModal;
    vm.insertMedia = insertMedia;
    vm.addFroalaImage = addFroalaImage;
    vm.imageEditor = {};
    $scope.$watch(function() { return SimpleSiteBuilderService.website; }, function(website){
        vm.state.originalWebsite = angular.copy(website);
        vm.state.pendingChanges = false;
        // vm.uiState = vm.uiStateOriginal;
        vm.state.website = website;
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.pages; }, function(pages){
        vm.state.pages = pages;
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.page; }, function(page){
        vm.state.originalPage = angular.copy(page);
        vm.state.pendingChanges = false;
        // vm.uiState = vm.uiStateOriginal;
        vm.state.page = page;
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.activeSectionIndex }, updateActiveSection);
    
    $scope.$watch(function() { return SimpleSiteBuilderService.activeComponentIndex }, updateActiveComponent);

    $scope.$watch('vm.state.page', function(page) {
        if (!angular.equals(page, vm.state.originalPage)) {
            vm.state.pendingChanges = true;
        } else {
            vm.state.pendingChanges = false;
        }
    }, true);

    $scope.$watch('vm.state.website', function(website) {
        if (!angular.equals(website, vm.state.originalWebsite)) {
            vm.state.pendingChanges = true;
        } else {
            vm.state.pendingChanges = false;
        }
    }, true);

    $rootScope.$on('$stateChangeStart',
        function (event) {
            $rootScope.app.layout.isSidebarClosed = vm.uiState.isSidebarClosed;
        }
    );

    function saveWebsite() {
        vm.state.pendingChanges = false;
        return (
            SimpleSiteBuilderService.saveWebsite(vm.state.website).then(function(response){
                console.log('website saved');
            })
        )
    }

    function savePage() {
        vm.state.pendingChanges = false;

        saveWebsite();

        return (
            SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                console.log('page saved');
            })
        )
    }

    function cancelPendingEdits() {
        alert('TODO: reset pending changes.');
        vm.state.pendingChanges = false;
        return true;
    }

    function toggleSidebarFlyover() {
        vm.uiState.show.flyover = !vm.uiState.show.flyover;
    	vm.uiState.show.sidebar = !vm.uiState.show.sidebar;
    }

    function updateActiveSection(index) {
        if (index !== undefined) {
            vm.uiState.accordion.sections = {};
            vm.uiState.activeSectionIndex = index;
            vm.uiState.accordion.sections.isOpen = true;
            vm.uiState.accordion.sections[index] = { components: {} };
            vm.uiState.accordion.sections[index].isOpen = true;
            // updateActiveComponent(0);
        }
    }

    function updateActiveComponent(index) {
        if (index !== undefined) {
            vm.uiState.activeComponentIndex = index;
            if (!vm.uiState.accordion.sections[vm.uiState.activeSectionIndex].components[index]) {
                vm.uiState.accordion.sections[vm.uiState.activeSectionIndex].components[index] = {};
            }
            vm.uiState.accordion.sections[vm.uiState.activeSectionIndex].components[index].isOpen = true;
        }
    }

    function openMediaModal(modal, controller, index, size) {
        console.log('openModal >>> ', modal, controller, index);
        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'md',
            resolve: {}
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
            $scope.setEditingComponent(index);
            _modal.resolve.clickedIndex = function () {
              return index;
            };
            if ($scope.page) {
              _modal.resolve.pageHandle = function () {
                return $scope.page.handle;
              };
            }
        }

        if (size) {
            _modal.size = 'lg';
        }

        $scope.modalInstance = $modal.open(_modal);
        
        $scope.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });

    }

    function init(element) {
        vm.element = element;
        vm.uiState.isSidebarClosed = $rootScope.app.layout.isSidebarClosed;
        $rootScope.app.layout.isSidebarClosed = true;

        vm.uiStateOriginal = angular.copy(vm.uiState);

        SimpleSiteBuilderService.getPages();

    }

    function insertMedia(asset) {
        vm.addFroalaImage(asset);
    };

    function addFroalaImage(asset) {      
      vm.imageEditor.editor.image.insert(asset.url, !1, null, vm.imageEditor.img);
    };

    // Hook froala insert up to our Media Manager
    window.clickandInsertImageButton = function (editor) {
      console.log('clickandInsertImageButton >>> ');
      vm.showInsert = true;
      vm.imageEditor.editor = editor;
      vm.imageEditor.img = editor.image.get();
      vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');
    };


}

})();