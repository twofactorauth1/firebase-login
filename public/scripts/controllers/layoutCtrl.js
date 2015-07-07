'use strict';

mainApp.controller('LayoutCtrl', ['$scope', '$timeout', 'pagesService', 'websiteService', 'postsService', 'userService', 'accountService', 'ENV', '$window', '$location', '$route', '$routeParams', '$filter', '$document', '$anchorScroll', '$sce', 'postService', 'paymentService', 'productService', 'courseService', 'ipCookie', '$q', 'customerService', 'pageService', 'analyticsService', 'leafletData', 'cartService',
  function ($scope, $timeout, pagesService, websiteService, postsService, userService, accountService, ENV, $window, $location, $route, $routeParams, $filter, $document, $anchorScroll, $sce, PostService, PaymentService, ProductService, CourseService, ipCookie, $q, customerService, pageService, analyticsService, leafletData, cartService) {
    $scope.isEditing = false;
    pagesService(function (err, data) {
      $scope.page = data;
      $scope.components = data.components;
      	setTimeout(function () {
            var locId = $location.$$hash;
            if (locId) {
              var element = document.getElementById(locId);
              if (element)
                $document.scrollToElementAnimated(element);
            }
        }, 1000);
    });
  }
]);
