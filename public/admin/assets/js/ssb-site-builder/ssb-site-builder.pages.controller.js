'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('SSBPagesCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "WebsiteService", "pageConstant", "$timeout", function ($scope, $location, toaster, $filter, $modal, WebsiteService, pageConstant, $timeout) {
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

    WebsiteService.getTemplates(function (templates) {
      $scope.templates = templates;
    });

    $scope.openModal = function (template, ssb) {
      if (ssb) {
        $scope.mockSSBTemplate = {
            "_id" : "9eaf57ad-40ca-454d-83af-a373cb176327",
            "accountId" : 1191,
            "websiteId" : "919e1956-5bc5-4db4-995d-b9fc74c58a2d",
            "handle" : "young-soul-template",
            "title" : "young-soul-template",
            "name": "Young Soul - Landing",
            "description": "Young Soul landing page template",
            "seo" : null,
            "visibility" : {
                "visible" : true,
                "asOf" : null,
                "displayOn" : null
            },
            "components" : [],
            "screenshot" : "//indigenous-screenshots.s3.amazonaws.com/account_1191/1448321002686.png",
            "templateId" : "c0e1790e-ca31-40b3-accb-2554b49c51f7",
            "secure" : false,
            "type" : "page",
            "email_type" : null,
            "version" : 62,
            "latest" : true,
            "created" : {
                "by" : 880,
                "date" : "2015-11-19T16:41:38.915Z"
            },
            "modified" : {
                "by" : 880,
                "date" : "2015-11-23T23:23:21.914Z"
            },
            "mainmenu" : null,
            "sections" : [
                {
                    "_id" : "76ef64ca-ed35-49db-8ebb-412343219999",
                    "anchor" : "76ef64ca-ed35-49db-8ebb-412343219999",
                    "name" : "Header",
                    "type" : "ssb-page-section",
                    "subtype" : "platform",
                    "layout" : "header",
                    "canAddComponents" : false,
                    "version" : 1,
                    "txtcolor" : "#000000",
                    "bg" : {
                        "img" : {
                            "url" : "",
                            "width" : null,
                            "height" : null,
                            "parallax" : false,
                            "blur" : false,
                            "overlay" : false,
                            "show" : false
                        },
                        "color" : "#9acccb"
                    },
                    "visibility" : true,
                    "components" : [
                        {
                            "_id" : "c239d2be-ac45-4fd9-aed2-26196e870d5b",
                            "anchor" : "c239d2be-ac45-4fd9-aed2-26196e870d5b",
                            "type" : "navigation",
                            "version" : 2,
                            "txtcolor" : "#000000",
                            "activetxtcolor" : null,
                            "logo" : "<span style=\"font-size: 96px;\"><strong><span style=\"color: #000000;\">MONI KING</span></strong></span>",
                            "nav" : {
                                "bg" : "#9acccb",
                                "hoverbg" : null,
                                "hover" : null
                            },
                            "bg" : {
                                "img" : {
                                    "url" : "",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : false,
                                    "blur" : false,
                                    "overlay" : false,
                                    "show" : false
                                },
                                "color" : null
                            },
                            "customnav" : true,
                            "linkLists" : [
                                {
                                    "name" : "Head Menu",
                                    "handle" : "head-menu",
                                    "links" : [
                                        {
                                            "label" : "Home",
                                            "type" : "link",
                                            "linkTo" : {
                                                "data" : "index",
                                                "type" : "page",
                                                "page" : null
                                            }
                                        },
                                        {
                                            "label" : "About",
                                            "type" : "link",
                                            "linkTo" : {
                                                "data" : "index",
                                                "type" : "page",
                                                "page" : null
                                            }
                                        },
                                        {
                                            "label" : "Media",
                                            "type" : "link",
                                            "linkTo" : {
                                                "data" : "index",
                                                "type" : "page",
                                                "page" : null
                                            }
                                        },
                                        {
                                            "label" : "Contact",
                                            "type" : "link",
                                            "linkTo" : {
                                                "data" : "index",
                                                "type" : "page",
                                                "page" : null
                                            }
                                        }
                                    ]
                                }
                            ],
                            "visibility" : true,
                            "shownavbox" : false,
                            "spacing" : {
                                "mt" : "0",
                                "ml" : "0",
                                "pt" : "0",
                                "pl" : "0",
                                "pr" : "0",
                                "pb" : "0",
                                "mr" : "0",
                                "mb" : "0"
                            }
                        },
                        {
                            "_id" : "0207f7a8-680c-45f4-a9cc-011dbdc63e29",
                            "anchor" : "0207f7a8-680c-45f4-a9cc-011dbdc63e29",
                            "type" : "social-link",
                            "version" : 1,
                            "txtcolor" : null,
                            "networks" : [
                                {
                                    "name" : "facebook",
                                    "url" : "http://www.facebook.com",
                                    "icon" : "facebook"
                                },
                                {
                                    "name" : "twitter",
                                    "url" : "http://www.twitter.com",
                                    "icon" : "twitter"
                                },
                                {
                                    "name" : "google-plus",
                                    "url" : "http://plus.google.com",
                                    "icon" : "google-plus"
                                },
                                {
                                    "name" : "youtube",
                                    "url" : "https://www.youtube.com/stff",
                                    "icon" : "youtube"
                                }
                            ],
                            "bg" : {
                                "img" : {
                                    "url" : "",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : false,
                                    "blur" : false,
                                    "overlay" : false,
                                    "show" : false
                                },
                                "color" : ""
                            },
                            "visibility" : true,
                            "spacing" : {
                                "mt" : "0",
                                "ml" : "0",
                                "pt" : "0",
                                "pl" : "0",
                                "pr" : "0",
                                "pb" : "0",
                                "mr" : "0",
                                "mb" : "0"
                            }
                        }
                    ],
                    "spacing" : {
                        "mt" : "0",
                        "ml" : "0",
                        "pt" : "0",
                        "pl" : "0",
                        "pr" : "0",
                        "pb" : "0",
                        "mr" : "0",
                        "mb" : "0"
                    }
                },
                {
                    "_id" : "76ef64ca-ed11-49db-8ebb-412343214123",
                    "anchor" : "76ef64ca-ed11-49db-8ebb-412343214123",
                    "name" : "Hero",
                    "type" : "ssb-page-section",
                    "subtype" : "platform",
                    "layout" : "hero",
                    "canAddComponents" : false,
                    "version" : 1,
                    "txtcolor" : "#FFFFFF",
                    "bg" : {
                        "img" : {
                            "url" : "//s3.amazonaws.com/indigenous-digital-assets/account_1191/graph_paper_1447199316134.gif",
                            "width" : null,
                            "height" : null,
                            "parallax" : false,
                            "blur" : false,
                            "overlay" : false,
                            "show" : true
                        },
                        "color" : "#4bb0cb"
                    },
                    "visibility" : true,
                    "components" : [
                        {
                            "_id" : "31d45d75-e63c-40bf-8c83-10102edda912",
                            "anchor" : "31d45d75-e63c-40bf-8c83-10102edda912",
                            "type" : "ssb-text",
                            "version" : 1,
                            "txtcolor" : "",
                            "text" : "",
                            "bg" : {
                                "img" : {
                                    "url" : "",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : false,
                                    "blur" : false,
                                    "overlay" : false,
                                    "show" : false
                                },
                                "color" : ""
                            },
                            "visibility" : true,
                            "spacing" : {
                                "mt" : 0,
                                "pt" : 0,
                                "pl" : 0,
                                "pr" : 0,
                                "pb" : 0,
                                "ml" : 0,
                                "mr" : 0,
                                "mb" : 0
                            }
                        },
                        {
                            "_id" : "31d45d75-e63c-40bf-8c83-10102edda111",
                            "anchor" : "31d45d75-e63c-40bf-8c83-10102edda111",
                            "type" : "ssb-image",
                            "version" : 1,
                            "src" : "//s3.amazonaws.com/indigenous-digital-assets/account_1191/moni-king-hero_1448037647207.png",
                            "alttext" : "Hero",
                            "bg" : {
                                "img" : {
                                    "url" : "",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : false,
                                    "blur" : false,
                                    "overlay" : false,
                                    "show" : false
                                },
                                "color" : ""
                            },
                            "visibility" : true,
                            "spacing" : {
                                "mt" : 0,
                                "pt" : 0,
                                "pl" : 0,
                                "pr" : 0,
                                "pb" : 0,
                                "ml" : 0,
                                "mr" : 0,
                                "mb" : 0
                            }
                        }
                    ]
                },
                {
                    "layout" : "2-col",
                    "bg" : {
                        "img" : {
                            "url" : "",
                            "width" : null,
                            "height" : null,
                            "parallax" : false,
                            "blur" : false,
                            "overlay" : false,
                            "show" : false
                        }
                    },
                    "visibility" : true,
                    "spacing" : {
                        "mt" : "0",
                        "ml" : "0",
                        "mr" : "0",
                        "mb" : "0",
                        "pt" : "0",
                        "pb" : "0",
                        "pl" : "0",
                        "pr" : "0"
                    },
                    "components" : [
                        {
                            "_id" : "ec7ffc1a-4a65-4988-8207-b11521ba4d51",
                            "anchor" : "ec7ffc1a-4a65-4988-8207-b11521ba4d51",
                            "type" : "video",
                            "version" : 1,
                            "title" : "<h1>Video Title</h1>",
                            "subtitle" : "<h4>Lorem ipsum dolor sit amet, consectetur adipisicing elit. </h4>",
                            "videoType" : "youtube",
                            "video" : "https://www.youtube.com/watch?v=TdrL3QxjyVw",
                            "videoMp4" : "",
                            "videoWebm" : "",
                            "videoAutoPlay" : false,
                            "videoControls" : true,
                            "videoBranding" : true,
                            "videoWidth" : 780,
                            "videoHeight" : 320,
                            "videoImage" : "",
                            "txtcolor" : "#000000",
                            "bg" : {
                                "img" : {
                                    "url" : "",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : false,
                                    "blur" : false,
                                    "overlay" : false,
                                    "show" : false
                                },
                                "color" : null
                            },
                            "btn" : {
                                "text" : "Learn More",
                                "url" : "#features",
                                "icon" : "fa fa-rocket"
                            },
                            "visibility" : true,
                            "text" : "<span style=\"font-size: 24px;\">FEATURED VIDEO</span>",
                            "spacing" : {
                                "mt" : "10",
                                "ml" : "10",
                                "pt" : "20",
                                "pl" : "20",
                                "pr" : "20",
                                "pb" : "20",
                                "mr" : "10",
                                "mb" : "10"
                            }
                        },
                        {
                            "_id" : "89252be8-088d-494e-b1de-c7158cd9b40f",
                            "anchor" : "89252be8-088d-494e-b1de-c7158cd9b40f",
                            "type" : "simple-form",
                            "version" : 1,
                            "maintitle" : "<span style=\"font-size: 24px;\"><span style=\"color: #000000;\">GET UPDATES ON TOUR DATES &amp; NEW RELEASES</span></span><br>",
                            "subtitle" : "",
                            "text" : "<p>Ullam molestiae est, recusandae ratione rem sit, praesentium laborum corporis. Molestiae quidem libero minima earum error minus voluptatum eligendi cum culpa impedit, dicta tenetur quis similique magni rerum doloribus excepturi aspernatur saepe dignissimos ad est aliquid? Voluptas inventore dignissimos possimus perspiciatis enim.</p>",
                            "imgurl" : "<img data-cke-saved-src=\"http://api.randomuser.me/portraits/med/women/51.jpg\" src=\"http://api.randomuser.me/portraits/med/women/51.jpg\">​​",
                            "fields" : [
                                {
                                    "display" : "First Name",
                                    "value" : false,
                                    "name" : "first"
                                },
                                {
                                    "display" : "Last Name",
                                    "value" : false,
                                    "name" : "last"
                                },
                                {
                                    "display" : "Phone Number",
                                    "value" : false,
                                    "name" : "phone"
                                },
                                {
                                    "display" : "Phone Extension",
                                    "value" : false,
                                    "name" : "extension"
                                }
                            ],
                            "from_email" : null,
                            "contact_type" : "ld",
                            "sendEmail" : "true",
                            "emailId" : "",
                            "campaignId" : "",
                            "facebookConversionCode" : "",
                            "txtcolor" : null,
                            "bg" : {
                                "img" : {
                                    "url" : "",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : false,
                                    "blur" : false,
                                    "overlay" : false,
                                    "show" : false
                                },
                                "color" : null
                            },
                            "visibility" : true,
                            "submitBtn" : "SUBMIT",
                            "btn" : {
                                "color" : "#ffffff",
                                "bgcolor" : "#000000"
                            },
                            "spacing" : {
                                "mt" : "10",
                                "ml" : "10",
                                "pt" : "20",
                                "pl" : "20",
                                "pr" : "20",
                                "pb" : "20",
                                "mr" : "10",
                                "mb" : "10"
                            }
                        }
                    ],
                    "name" : "Video + Form"
                },
                {
                    "layout" : "1-col",
                    "txtcolor" : "#000000",
                    "bg" : {
                        "img" : {
                            "url" : "",
                            "width" : null,
                            "height" : null,
                            "parallax" : false,
                            "blur" : false,
                            "overlay" : false,
                            "show" : false
                        },
                        "color" : "#9acccb"
                    },
                    "visibility" : true,
                    "spacing" : {
                        "mt" : "0",
                        "ml" : "0",
                        "mr" : "0",
                        "mb" : "0",
                        "pt" : "0",
                        "pb" : "0",
                        "pl" : "0",
                        "pr" : "0"
                    },
                    "components" : [
                        {
                            "_id" : "438b118f-9ade-4d28-9e10-887fcf446b36",
                            "anchor" : "438b118f-9ade-4d28-9e10-887fcf446b36",
                            "type" : "text-only",
                            "version" : 1,
                            "txtcolor" : null,
                            "text" : "<div style=\"text-align: center;\"><span style=\"color: #FFFFFF;\"><span style=\"font-size: 24px;\">&copy; 2015 Template by <em>Indigenous Software</em>. All rights reserved.</span></span></div><div style=\"text-align: center;\"><span style=\"color: #000000;\"><span style=\"font-size: 24px;\"><a href=\"http://www.facebook.com\" target=\"_blank\">FACEBOOK</a></span><span style=\"font-size: 24px;\">&nbsp;</span><span style=\"font-size: 24px;\">|&nbsp;</span><span style=\"font-size: 24px;\"><a href=\"http://www.twitter.com\" target=\"_blank\">TWITTER</a></span><span style=\"font-size: 24px;\">&nbsp;|&nbsp;</span><span style=\"font-size: 24px;\"><a href=\"http://www.instagram.com\" target=\"_blank\">INSTAGRAM</a></span><span style=\"font-size: 24px;\">&nbsp;|&nbsp;</span><span style=\"font-size: 24px;\"><a href=\"http://www.soundcloud.com\" target=\"_blank\">SOUNDCLOUD</a></span></span></div>",
                            "bg" : {
                                "img" : {
                                    "url" : "",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : false,
                                    "blur" : false,
                                    "overlay" : false,
                                    "show" : false
                                },
                                "color" : null
                            },
                            "visibility" : true,
                            "spacing" : {
                                "mt" : "0",
                                "ml" : "0",
                                "pt" : "20",
                                "pl" : "0",
                                "pb" : "20",
                                "pr" : "0",
                                "mb" : "0",
                                "mr" : "0"
                            }
                        }
                    ],
                    "name" : "Footer"
                }
            ]
        }
      }// ./end mockSSBTemplate

      $scope.modalInstance = $modal.open({
        templateUrl: template,
        keyboard: false,
        backdrop: 'static',
        scope: $scope
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

      if (!hasHandle) {

        if ($scope.mockSSBTemplate.handle === $scope.selectedTemplate.handle) {

          $scope.mockSSBTemplate.title = $scope.createpage.title;
          $scope.mockSSBTemplate.handle = $scope.createpage.handle;

          WebsiteService.getWebsite(function(data) {
            WebsiteService.createPage(data._id, $scope.mockSSBTemplate, function(_newPage, error) {
              createPageCallback(_newPage, error);
            });
          });

        } else {

          WebsiteService.createPageFromTemplate($scope.selectedTemplate._id, pageData, function (_newPage, error) {
            createPageCallback(_newPage, error);
          });
        }

      } else {
        toaster.pop('error', "Page URL " + page.handle, "Already exists");
        $event.preventDefault();
        $event.stopPropagation();
        $scope.saveLoading = false;
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

    $scope.getPages();

  }]);
}(angular));
