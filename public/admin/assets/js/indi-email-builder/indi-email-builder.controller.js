(function () {

  app.controller('EmailBuilderController', indiEmailBuilderController);

  indiEmailBuilderController.$inject = ['$scope', '$rootScope', 'EmailBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal', '$timeout', '$document', '$window'];
  /* @ngInject */
  function indiEmailBuilderController($scope, $rootScope, EmailBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal, $timeout, $document, $window) {

    console.info('email-builder directive init...');

    var vm = this;

    vm.init = init;

    vm.state = vm.state || {};
    vm.uiState = vm.uiState || {};

    vm.state.email = null;
    vm.state.emailId = $stateParams.id;
    vm.dataLoaded = false;
    vm.account = null;
    vm.website = {settings: {}};
    vm.modalInstance = null;
    vm.editor = null;
    vm.componentTypes = [{
        title: 'Header',
        type: 'email-header',
        preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
        filter: 'email',
        description: 'Use this component for email header section.',
        enabled: true
      }, {
        title: 'Content 1 Column',
        type: 'email-1-col',
        preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
        filter: 'layout',
        description: 'Use this component for single column content.',
        enabled: true
      }, {
        title: 'Content 2 Column',
        type: 'email-2-col',
        preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
        filter: 'layout',
        description: 'Use this component for 2 column content.',
        enabled: true
      }, {
        title: 'Content 3 Column',
        type: 'email-3-col',
        preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
        filter: 'layout',
        description: 'Use this component for 3 column content.',
        enabled: true
      }, {
        title: 'Social Links',
        type: 'email-social',
        preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
        filter: 'social',
        description: 'Use this component for social links.',
        enabled: true
      }, {
        title: 'Horizontal Rule',
        type: 'email-hr',
        preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
        filter: 'layout',
        description: 'Use this component to insert a horizontal rule between components.',
        enabled: true
      }, {
        title: 'Footer',
        type: 'email-footer',
        preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog-teaser.png',
        filter: 'email',
        description: 'A footer for your email.',
        enabled: true
      }];

    vm.openSimpleModalFn = openSimpleModalFn;
    vm.openModalFn = openModalFn;
    vm.closeModalFn = closeModalFn;
    vm.addComponentFn = addComponentFn;
    vm.cloneComponentFn = cloneComponentFn;
    vm.componentClassFn = componentClassFn;
    vm.componentStyleFn = componentStyleFn;
    vm.saveFn = saveFn;
    vm.insertMediaFn = insertMediaFn;
    vm.moveComponentFn = moveComponentFn;
    vm.clickImageButton = clickImageButton;
    vm.deleteFn = deleteFn;
    vm.filterComponentsFn = filterComponentsFn;
    vm.sendOneTimeEmailFn = sendOneTimeEmailFn;

    vm.uiState.navigation = {
        back: function() {
            vm.uiState.navigation.index = 0;
        },
        index: 0,
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
        }
    };

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
        $rootScope.$broadcast('$destroyFroalaInstances');
        $rootScope.app.layout.isMinimalAdminChrome = false;
        $rootScope.app.layout.isMinimalAdminChromeLight = false;
        $rootScope.app.layout.isSidebarClosed = vm.uiState.isSidebarClosed;
    });

    $scope.$on('email.move.component', function (event, args) {
      vm.moveComponentFn(args.component, args.direction);
    });

    $scope.$on('email.duplicate.component', function (event, args) {
      vm.cloneComponentFn(args.component);
    });

    $scope.$on('email.remove.component', function (event, args) {
      vm.dataLoaded = false;

      vm.state.email.components.forEach(function (c, index) {
        if (c._id === args.component._id) {
          vm.state.email.components.splice(index, 1);
        }
      });
      $timeout(function () {
        var element = document.getElementById(vm.state.email.components[vm.state.email.components.length - 1]._id);
        if (element) {
          $document.scrollToElementAnimated(element, 175, 1000);
          $(window).trigger('resize');
        }
        vm.dataLoaded = true;
        toaster.pop('warning', 'component deleted');
      }, 500);
    });

    function openSimpleModalFn(modal, _size) {

        var _modal = {
            templateUrl: modal,
            keyboard: false,
            // backdrop: 'static',
            scope: $scope,
            size: _size || 'md',
        };

        vm.modalInstance = $modal.open(_modal);

        vm.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });

    }


    function openModalFn(modal, controller, index, size) {
      console.log('openModal >>> ', modal, controller, index, size);
      var _modal = {
        templateUrl: modal,
        keyboard: false,
        backdrop: 'static',
        size: 'md',
        scope: $scope,
        resolve: {
          components: function () {
            return vm.state.email && vm.state.email.components ? vm.state.email.components : [];
          }
        }
      };

      if (controller) {
        _modal.controller = controller;

        _modal.resolve.contactMap = function () {
          return {};
        };
        _modal.resolve.website = function () {
          return vm.website;
        };

        _modal.resolve.showInsert = function () {
          return true;
        };

        _modal.resolve.insertMedia = function () {
          return vm.insertMediaFn;
        };

        _modal.resolve.openParentModal = function () {
          return vm.openModalFn;
        };

        _modal.resolve.accountShowHide = function () {
          return vm.account.showhide;
        };
        _modal.resolve.isEmail = function () {
          return true;
        };

        _modal.resolve.isSingleSelect = function () {
          return true;
        };
      }

      if (angular.isDefined(index) && index !== null && index >= 0) {
        $scope.setEditingComponent(index);
        _modal.resolve.clickedIndex = function () {
          return index;
        };

        _modal.resolve.pageHandle = function () {
          return $scope.page ? $scope.page.handle : null;
        };
      }

      if (size) {
        _modal.size = size;
      }
      vm.modalInstance = $modal.open(_modal);
      vm.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });
    }


    function closeModalFn() {
      if (vm.modalInstance) {
        vm.modalInstance.close();
      }
    }

    function addComponentFn(addedType) {
      if (vm.dataLoaded) {
        vm.dataLoaded = false;
        var componentType = null;
        if (['email-footer', 'email-header'].indexOf(addedType.type) > -1) {
          componentType = _.findWhere(vm.state.email.components, {
            type: addedType.type
          });
          if (componentType) {
            toaster.pop('error', componentType.type + " component already exists");
            vm.dataLoaded = true;
            return;
          }
        }

        WebsiteService.getComponent(addedType, addedType.version || 1, function (newComponent) {
          if (newComponent) {
            vm.closeModalFn();
            vm.state.email.components.push(newComponent);
            $timeout(function () {
              var element = document.getElementById(newComponent._id);
              if (element) {
                $document.scrollToElementAnimated(element, 175, 1000);
                $(window).trigger('resize');
              }
              vm.dataLoaded = true;
              toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
            }, 500);
          }
        });
      }
    }

    function cloneComponentFn(component) {
      var clone = angular.copy(component);
      delete clone['_id'];
      delete clone['anchor'];
      var addedType = {type: clone.type, version: clone.version};

      if (vm.dataLoaded) {
        vm.dataLoaded = false;
        var componentType = null;
        if (['email', 'email-footer', 'email-header'].indexOf(addedType.type) > -1) {
          componentType = _.findWhere(vm.state.email.components, {
            type: addedType.type
          });
          if (componentType) {
            toaster.pop('error', componentType.type + " component can't be cloned");
            vm.dataLoaded = true;
            return;
          }
        }

        WebsiteService.getComponent(addedType, addedType.version || 1, function (newComponent) {
          if (newComponent) {
            _.extend(newComponent, clone);
            vm.state.email.components.push(newComponent);
            $timeout(function () {
              var element = document.getElementById(newComponent._id);
              if (element) {
                $document.scrollToElementAnimated(element, 175, 1000);
                $(window).trigger('resize');
              }
              vm.dataLoaded = true;
              toaster.pop('success', "Component cloned", "The " + newComponent.type + " component was cloned successfully.");
            }, 500);
          }
        });
      }
    }

    function componentClassFn(component, index) {
      var classString = 'container-fluid ';

      if (component.type === 'email-1-col') {
        // classString += 'col-sm-12 ';
      }

      if (component.type === 'email-2-col') {
        classString += ' col-md-6 ';
      }

      if (component.type === 'email-3-col') {
        classString += ' col-md-4 ';
      }

      if (component.type === 'email-4-col') {
        classString += ' col-md-3';
      }

      if (index !== undefined) {
        classString += ' email-component-index-' + index + ' ';
      }

      if (component.layoutModifiers) {

        if (component.layoutModifiers.columns) {
          if (component.layoutModifiers.columnsNum) {
            classString += ' email-component-layout-columns-' + component.layoutModifiers.columnsNum + ' ';
          }

          if (component.layoutModifiers.columnsSpacing) {
            classString += ' email-component-layout-columns-spacing-' + component.layoutModifiers.columnsSpacing + ' ';
          }
        }

      }

      return classString;

    }

    function componentStyleFn(component) {
      var styleString = ' ';

      if (component.spacing) {
        if (component.spacing.pt) {
          styleString += 'padding-top: ' + component.spacing.pt + 'px;';
        }

        if (component.spacing.pb) {
          styleString += 'padding-bottom: ' + component.spacing.pb + 'px;';
        }

        if (component.spacing.pl) {
          styleString += 'padding-left: ' + component.spacing.pl + 'px;';
        }

        if (component.spacing.pr) {
          styleString += 'padding-right: ' + component.spacing.pr + 'px;';
        }

        if (component.spacing.mt) {
          styleString += 'margin-top: ' + component.spacing.mt + 'px;';
        }

        if (component.spacing.mb) {
          styleString += 'margin-bottom: ' + component.spacing.mb + 'px;';
        }

        if (component.spacing.ml) {
          styleString += component.spacing.ml === 'auto' ? 'margin-left: ' + component.spacing.ml + ';float: none;' : 'margin-left: ' + component.spacing.ml + 'px;';
        }

        if (component.spacing.mr) {
          styleString += (component.spacing.mr === 'auto') ? 'margin-right: ' + component.spacing.mr + ';float: none;' : 'margin-right: ' + component.spacing.mr + 'px;';
        }

        if (component.spacing.mw) {
          styleString += (component.spacing.mw === '100%') ?
            'max-width: ' + component.spacing.mw + ';' :
            'max-width: ' + component.spacing.mw + 'px;margin:0 auto!important;';
        }

        if (component.spacing.lineHeight) {
          styleString += 'line-height: ' + component.spacing.lineHeight;
        }
      }

      if (component.txtcolor) {
        styleString += 'color: ' + component.txtcolor + ';';
      }

      if (component.visibility === false) {
        styleString += 'display: none!important;';
      }

      if (component.bg) {
        if (component.bg.color) {
          styleString += 'background-color: ' + component.bg.color + ';';
        }

        if (component.bg.img && component.bg.img.show && component.bg.img.url !== '') {
          styleString += 'background-image: url("' + component.bg.img.url + '");';
        }
      }

      if (component.src) {
        if (component.src && component.src !== '') {
          styleString += 'background-image: url("' + component.src + '");';
        }
      }



      if (component.layoutModifiers) {
        if (component.layoutModifiers.columns) {
          if (component.layoutModifiers.columnsMaxHeight) {
            styleString += ' max-height: ' + component.layoutModifiers.columnsMaxHeight + 'px';
          }
        }
      }

      if (component.border && component.border.show && component.border.color) {
        styleString += 'border-color: ' + component.border.color + ';';
        styleString += 'border-width: ' + component.border.width + 'px;';
        styleString += 'border-style: ' + component.border.style + ';';
        styleString += 'border-radius: ' + component.border.radius + '%;';
      }

      return styleString;
    }

    function saveFn() {
      vm.dataLoaded = false;
      EmailBuilderService.updateEmail(vm.state.email)
        .then(function (res) {
          vm.dataLoaded = true;
          toaster.pop('success', 'Email saved');
        });
    }

    $window.clickandInsertImageButton = function (editor) {
      console.log('clickandInsertImageButton >>> ');
      vm.clickImageButton(editor, false);
    };

    function clickImageButton(editor, edit) {
      $scope.insertMediaImage = true;
      $scope.showInsert = true;
      $scope.inlineInput = editor;
      $scope.isEditMode = edit;
      vm.openModalFn('media-modal', 'MediaModalCtrl', null, 'lg');
    }

    function insertMediaFn(asset) {
      if (vm.editor) {
        vm.editor.image.insert(asset.url, !1, null, vm.editor.img);
      } else {
        toaster.pop('error', 'Position cursor at the point of insertion');
      }
    }

    function moveComponentFn(component, direction) {
      var toIndex;
      var fromIndex = _.findIndex(vm.state.email.components, function (x) {
        return x._id === component._id;
      });

      if (direction === 'up') {
        toIndex = fromIndex - 1;
      }

      if (direction === 'down') {
        toIndex = fromIndex + 1;
      }

      vm.state.email.components.splice(toIndex, 0, vm.state.email.components.splice(fromIndex, 1)[0]);
    }

    function deleteFn() {
      vm.dataLoaded = false;
      WebsiteService.deleteEmail(vm.state.email, function () {
        vm.dataLoaded = true;
        $state.go('app.emails');
        toaster.pop('Warning', 'Email deleted.');
      });
    }

    function filterComponentsFn() {
        vm.enabledComponentTypes = _.where(vm.componentTypes, {
          enabled: true
        });

        vm.componentFilters = _.without(_.uniq(_.pluck(_.sortBy(vm.enabledComponentTypes, 'filter'), 'filter')), 'misc');

        // Iterates through the array of filters and replaces each one with an object containing an
        // upper and lowercase version
        _.each(vm.componentFilters, function (element, index) {
          componentLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
          vm.componentFilters[index] = {
            'capitalized': componentLabel,
            'lowercase': element
          };
          componentLabel = null;
        });

        // Manually add the All option to the begining of the list
        vm.componentFilters.unshift({
          'capitalized': 'All',
          'lowercase': 'all'
        });
    }

    function sendOneTimeEmailFn(address) {
        vm.saveLoading = true;
        EmailBuilderService.sendOneTimeEmail(address, vm.state.email).then(function() {
            vm.saveLoading = false;
        }).catch(function(e) {
            console.error('Error sending one-time email:', JSON.stringify(e));
            vm.saveLoading = false;
        });
    }

    function pageLinkClick(e) {
        if (!angular.element(this).hasClass("clickable-link")) {
            e.preventDefault();
            // e.stopPropagation();
        }
    }

    function emailSettingsClick(e) {
        vm.uiState.navigation.sectionPanel.reset();
        vm.uiState.showSectionPanel = false;
    }

    function init(element) {

        vm.element = element;

        vm.uiState.isSidebarClosed = $rootScope.app.layout.isSidebarClosed;
        $rootScope.app.layout.isSidebarClosed = true;
        $rootScope.app.layout.isMinimalAdminChrome = true;
        $rootScope.app.layout.isMinimalAdminChromeLight = true;

        angular.element("body").on("click", "[email-component-loader] a", pageLinkClick);

        angular.element("body").on("click", 'a[href="#email-settings"]', emailSettingsClick);

        vm.filterComponentsFn();

        AccountService.getAccount(function (data) {
            vm.account = data;
        });

        WebsiteService.getWebsite(function (data) {
            vm.website = data;
        });

        EmailBuilderService
            .getEmail(vm.state.emailId)
            .then(function (res) {
                if (!res.data._id) {
                    toaster.pop('error', 'Email not found');
                    $state.go('app.emails');
                }
                vm.state.email = res.data;
                $timeout(function () {
                    $('.editable').on('froalaEditor.focus', function (e, editor) {
                        vm.editor = editor;
                        console.info('Event froalaEditor.focus triggered');
                    });

                    vm.dataLoaded = true;

                }, 1000);
        }, function (err) {
            console.error(err);
            $state.go('app.emails');
        });

    }


  }

})();
