'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('PagesCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "WebsiteService", function ($scope, $location, toaster, $filter, $modal, WebsiteService) {
    $scope.tableView = 'list';
    $scope.itemPerPage = 40;
    $scope.showPages = 15;
    $scope.showChangeURL = false;
    WebsiteService.getPages(function (pages) {
      console.log('pages >>> ', pages);
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
      var pagesArr = $scope.formatPages(pages);
      $scope.pages = pagesArr;
      $scope.orderByFn();
      $scope.displayPages = true;
    });

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

    $scope.formatPages = function (pages) {
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
      return pagesArr;
    };

    WebsiteService.getTemplates(function (templates) {
      $scope.templates = templates;
    });

    $scope.openModal = function (template) {
      $scope.modalInstance = $modal.open({
        templateUrl: template,
        scope: $scope
      });
      $scope.modalInstance.result.finally($scope.closeModal());
    };

    $scope.closeModal = function () {
      $scope.modalInstance.close();
      $scope.resetTemplateDetails();
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

    $scope.createpage = {};

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
      $scope.validateCreatePage(page, true);

      $scope.titleError = false;
      $scope.handleError = false;
      if (!$scope.createPageValidated) {
        $scope.titleError = true;
        $scope.handleError = true;
        return false;
      }

      if ($scope.createpage.showhomepage) {
        page.handle = 'index';
      }

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


      if (!hasHandle) {
        WebsiteService.createPageFromTemplate($scope.selectedTemplate._id, pageData, function (newpage) {
          toaster.pop('success', 'Page Created', 'The ' + newpage.title + ' page was created successfully.');
          $scope.minRequirements = true;
          $scope.closeModal();

          if (newpage.components) {
            newpage.components = newpage.components.length;
          } else {
            newpage.components = 0;
          }

          if (page.handle === "index") {
            $scope.createpage.homepage = false;
            $scope.createpage.showhomepage = false;
          }

          $scope.pages.unshift(newpage);
          $scope.displayedPages.unshift(newpage);
          page.title = "";
          page.handle = "";

          $scope.resetTemplateDetails();
        });
      } else {
        toaster.pop('error', "Page URL " + page.handle, "Already exists");
        $event.preventDefault();
        $event.stopPropagation();
      }
    };

    $scope.viewSingle = function (page) {
      window.location = '/admin/#/website/pages/?pagehandle=' + page.handle;
      // console.log('$location.path() ',$location.path());
      // $location.path('website/pages/?pagehandle=' + page.handle).replace();
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

  }]);
}(angular));
