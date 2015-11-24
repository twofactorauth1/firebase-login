'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('SSBPagesCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "WebsiteService", "pageConstant", "$timeout", "SimpleSiteBuilderService", function ($scope, $location, toaster, $filter, $modal, WebsiteService, pageConstant, $timeout, SimpleSiteBuilderService) {


    var vm = this;

    vm.state = {};

    //TODO: optimize this, we dont need to watch since this won't change
    $scope.$watch(function() { return SimpleSiteBuilderService.themes }, function(themes) {
      vm.state.themes = themes;
    }, true);

    //TODO: optimize this, we dont need to watch since this won't change
    $scope.$watch(function() { return SimpleSiteBuilderService.templates }, function(templates) {
      vm.state.templates = templates;
    }, true);


    //TODO: use vm pattern...

    $scope.tableView = 'list';
    $scope.itemPerPage = 40;
    $scope.showPages = 15;
    $scope.showChangeURL = false;
    $scope.createpage = {};
    $scope.pageConstant = pageConstant;
    $scope.setHomePage = function () {
      if ($scope.createpage.homepage) {
        $scope.createpage.title = 'Home';
        $scope.createpage.handle = 'index';
      }
    };

    $scope.default_image_url = "/admin/assets/images/default-page.jpg";

    $scope.filterPages = function () {
      $scope.showFilter = !$scope.showFilter;
      $scope.filterScreenshots($scope.pages);
    };

    $scope.orderByFn = function () {
      $scope.pages = $filter('orderBy')($scope.pages, 'modified.date', true);
    };

    $scope.filterScreenshots = function (pages) {
      _.each(pages, function (page) {
        if (page) {
          page.hasScreenshot = false;
          if (page.screenshot) {
            if ($("#screenshot_" + page._id).attr("src") === $scope.default_image_url) {
              page.hasScreenshot = false;
            } else {
              page.hasScreenshot = true;
            }
          }
        }
      });
    };

    $scope.formatPages = function (pages, fn) {
      var pagesArr = [];
      _.each(pages, function (page) {
        if (page) {
          if (page.components) {
            page.components = page.components.length;
          } else {
            page.components = 0;
          }
          page.hasScreenshot = false;
          if (page.screenshot) {
            if ($("#screenshot_" + page._id).attr("src") === $scope.default_image_url) {
              page.hasScreenshot = false;
            }
            page.hasScreenshot = true;
          }
          if (page.type !== 'template' && page.handle !== 'blog' && page.handle !== 'single-post') {
            pagesArr.push(page);
          }
        }
      });

      if (fn) {
        fn(pagesArr);
      }
    };


    $scope.openModal = function (template) {
      $scope.modalInstance = $modal.open({
        templateUrl: template,
        keyboard: false,
        backdrop: 'static',
        scope: $scope,
        resolve: {
            vm: function() {
                return vm;
            }
        }
      });
      $scope.modalInstance.result.finally($scope.closeModal());
    };

    $scope.closeModal = function () {
      $scope.modalInstance.close();
      $scope.resetTemplateDetails();
      if(!$scope.createpage.showhomepage){
        $scope.createpage = {};
      }
      else{
        $scope.createpage.homepage = true;
        $scope.createpage.title = 'Home';
        $scope.createpage.handle = 'index';
      }
    };


    $scope.getters = {
      components: function (value) {
        return value.length;
      },
      created: function (value) {
        return value.created.date;
      },
      modified: function (value) {
        return value.modified.date;
      }
    };

    $scope.setTemplateDetails = function (templateDetails) {
      $scope.templateDetails = true;
      $scope.selectedTemplate = templateDetails;
    };

    $scope.resetTemplateDetails = function () {
      $scope.templateDetails = false;
      $scope.selectedTemplate = null;
      $scope.showChangeURL = false;
    };

    $scope.slugifyHandle = function (title) {
      if (title) {
        $scope.createpage.handle = $filter('slugify')(title);
      }
    };

    $scope.validateCreatePage = function (page, restrict) {
      $scope.createPageValidated = false;
      if (page) {
        if (page.handle === '') {
          $scope.handleError = true;
        } else {
          $scope.handleError = false;
          if (!restrict) {
            page.handle = $filter('slugify')(page.title);
          } else {
            page.handle = $filter('slugify')(page.handle);
          }
        }
        if (page.title === '') {
          $scope.titleError = true;
        } else {
          $scope.titleError = false;
        }
        if (page && page.title && page.title !== '' && page.handle && page.handle !== '') {
          $scope.createPageValidated = true;
        }
      }
    };

    $scope.createPageFromTemplate = function (page, $event) {
      $scope.saveLoading = true;
      $scope.validateCreatePage(page, true);

      $scope.titleError = false;
      $scope.handleError = false;
      if (!$scope.createPageValidated) {
        $scope.titleError = true;
        $scope.handleError = true;
        $scope.saveLoading = false;
        return false;
      }

      if ($scope.createpage.homepage)
        page.handle = 'index';

      var pageData = {
        title: page.title,
        handle: page.handle,
        mainmenu: page.mainmenu
      };


      var hasHandle = false;
      _.each($scope.pages, function (_page) {
        if (_page.handle === page.handle) {
          hasHandle = true;
        }
      });

      function createPageCallback(_newPage, error) {
        if(error && !_newPage) {
          toaster.pop('error', error.message);
          $event.preventDefault();
          $event.stopPropagation();
          $scope.saveLoading = false;
          return;
        }
        var newpage = angular.copy(_newPage);
        toaster.pop('success', 'Page Created', 'The ' + newpage.title + ' page was created successfully.');
        $scope.minRequirements = true;
        $scope.saveLoading = false;
        if(newpage.handle == 'index'){
          $scope.createpage.showhomepage = false;
        }
        $scope.closeModal();

        if (newpage.components) {
          newpage.components = newpage.components.length;
        } else if (newpage.sections) {
          newpage.sections = newpage.sections.length;
        }


        $scope.pages.unshift(newpage);
        $scope.displayedPages.unshift(newpage);
        page.title = "";
        page.handle = "";
        $scope.checkAndSetIndexPage($scope.pages);
        $scope.resetTemplateDetails();
      }


        if (page.ssb) {

          WebsiteService.getWebsite(function(data) {
            SimpleSiteBuilderService.createPage(page._id).then(function(data) {
              $scope.closeModal();
              $scope.viewSimpleSiteBuilderSingle(data.data);
            });
          });

        } else {

          if (!hasHandle) {

            WebsiteService.createPageFromTemplate($scope.selectedTemplate._id, pageData, function (_newPage, error) {
              createPageCallback(_newPage, error);
            });

          } else {
            toaster.pop('error', "Page URL " + page.handle, "Already exists");
            $event.preventDefault();
            $event.stopPropagation();
            $scope.saveLoading = false;
          }

        }
    };

    $scope.viewSingle = function (page) {
      $location.path('/website/pages/').search({pagehandle: page.handle});
    };

    $scope.viewSimpleSiteBuilderSingle = function (page) {
      $location.path('/website/site-builder/pages/' + page._id);
    };

    $scope.filterScreenshot = {};

    $scope.pageScreenshotOptions = [{
      name: 'Screenshot',
      value: true
    }, {
      name: 'No Screenshot',
      value: false
    }];

    /*
     * @triggerInput
     * - trigger the hidden input to trick smart table into activating filter
     */

    $scope.triggerInput = function (element) {
      angular.element(element).trigger('input');
    };

    $scope.clearFilter = function (event, input) {
      $scope.filterScreenshot = {};
      $scope.triggerInput(input);
    };

    $scope.toggleHandle = function (val) {
      $scope.showChangeURL = val;
    };

    var repeater;
    $scope.pages = [];

    $scope.checkAndSetIndexPage = function(pages)
    {
        var indexExists = _.find(pages, function (page) {
          return page.handle === 'index';
        });
        if (!indexExists) {
          $scope.createpage.showhomepage = true;
          $scope.createpage.homepage = true;
          $scope.createpage.title = 'Home';
          $scope.createpage.handle = 'index';
        } else {
          $scope.createpage.homepage = false;
        }
    }

    $scope.getPages = function () {
      // $timeout.cancel(repeater);
      WebsiteService.getPages(function (returnedPages) {
        var pages = angular.copy(returnedPages);
        if ($scope.pages.length === 0) {
          $scope.checkAndSetIndexPage(pages);
          $scope.formatPages(pages, function (pagesArr) {
            $scope.pages = pagesArr;
            $scope.orderByFn();
            $scope.displayPages = true;
          });
        }
        if (pages.length > $scope.pages.length && $scope.pages.length !== 0) {
          var intersection = _.filter(pages, function (obj) {
            return !_.find($scope.pages, function (item) {
              return item._id === obj._id;
            });
          });
          $scope.formatPages(intersection, function (pagesArr) {
            _.each(pagesArr, function (_pages) {
              $scope.pages.push(_pages);
            });
            $scope.orderByFn();
            $scope.displayPages = true;
          });

        }
        // repeater = $timeout($scope.getPages, 30000);
      });
    };

    (function init() {

      $scope.getPages();
      WebsiteService.getTemplates(function (templates) {
        $scope.legacyTemplates = templates;
      });

    })();

  }]);
}(angular));
