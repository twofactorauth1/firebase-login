'use strict';
/*global mainApp*/
mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', '$window', '$location', '$document', '$timeout', function ($scope, pagesService, $window, $location, $document, $timeout) {
  $scope.isEditing = false;
  $scope.blog_post = null;
  console.log('layout crtl');
  function checkIntercom(data) {
    if (data.hideIntercom) {
      $scope.$parent.hideIntercom = true;
    }
  }
  $scope.addUnderNavSetting = function (masthead_id, fn) {
    $scope.allowUndernav = false;
    $scope.components.forEach(function (value, index) {
      if (value && value.type === 'masthead' && value._id == masthead_id) {
        if (index != 0 && $scope.components[index - 1].type == "navigation") {
          $scope.allowUndernav = true;
        } else
          $scope.allowUndernav = false;
      }
    })
    fn($scope.allowUndernav);
  };

  $scope.defaultSpacings = {
    'pt': 0,
    'pb': 0,
    'pl': 0,
    'pr': 0,
    'mt': 0,
    'mb': 0,
    'mr': 'auto',
    'ml': 'auto',
    'mw': '100%',
    'usePage': false
  };
  pagesService($scope.websiteId, function (err, data) {
    console.log('pagesService ', data);
    if (err) {
      console.warn('no page found', $location.$$path);
      if($location.$$path === '/login') {
          $window.location.href = '/login';
      } else {
          $window.location.href = '/404';
      }

    } else {
      $scope.page = data;
      $scope.components = data.components;
      if(data.handle=== 'single-post'){
        var post_component = _.findWhere($scope.page.components, {
          type: 'single-post'
        });
        if(post_component){
          $scope.blog_post = post_component;
        }
      }
      
      checkIntercom(data);
      angular.element(document).ready(function () {
        setTimeout(function () {
          var locId = $location.$$hash;
          if (locId) {
            var element = document.getElementById(locId);
            if (element) {
              $document.scrollToElementAnimated(element, 0, 1000);
            }
          }
        }, 0);
      })
    }
  });
}]);
