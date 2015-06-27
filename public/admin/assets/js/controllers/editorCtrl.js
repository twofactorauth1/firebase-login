'use strict';
/**
 * controller for editor
 */
(function (angular) {
  app.controller('EditorCtrl', ["$scope", "$rootScope", "$interval", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", function ($scope, $rootScope, $interval, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant) {

    $scope.retrievePage = function (_handle) {
      WebsiteService.getSinglePage(_handle, function (data) {
        $scope.components = data.components;
        $scope.activateCKEditor();
      });
    };

    if ($location.$$search['pagehandle']) {
      console.log('Page: ', $location.$$search['pagehandle']);
      $scope.retrievePage($location.$$search['pagehandle']);
    }

    $scope.activateCKEditor = function () {
      console.log('activateCKEditor >>> ');
      $scope.isEditing = true;
      for (name in CKEDITOR.instances) {
        {
          var b = CKEDITOR.instances[name];
          b.updateElement();
          var d = b.getData(1);
          if (d)
            b.setData(d);
          b.fire("contentDom");
        }
      }
      CKEDITOR.disableAutoInline = true;
      var elements = angular.element('.editable');
      elements.each(function (index) {
        if (!angular.element(this).parent().hasClass('edit-wrap')) {
          var dataClass = angular.element(this).data('class').replace('.item.', ' ');
          angular.element(this).wrapAll('<div class="edit-wrap"></div>').parent().append('<span class="editable-title">' + toTitleCase(dataClass) + '</span>');
        }
        if (!$(this).hasClass('cke_editable_inline'))
          CKEDITOR.inline(this, {
            on: {
              instanceReady: function (ev) {
                var editor = ev.editor;
                editor.setReadOnly(false);
                if (index === 0)
                  $scope.activeEditor = editor;
                editor.on('change', function () {
                  $scope.isPageDirty = true;
                });
                editor.on('focus', function () {
                  $scope.activeEditor = editor;
                });
                editor.on('blur', function () {
                  $scope.activeEditor = null;
                });
              }
            },
            sharedSpaces: {
              top: 'editor-toolbar'
            }
          });
      });
      setTimeout(function () {
        $scope.$apply(function () {
          if (angular.element("div.meet-team-height").length) {
            var maxTeamHeight = Math.max.apply(null, angular.element("div.meet-team-height").map(function () {
              return this.offsetHeight;
            }).get());
            angular.element(".meet-team-height").css("min-height", maxTeamHeight);
          }
          for (var i = 1; i <= 3; i++) {
            if ($("div.feature-height-" + i).length) {
              var maxFeatureHeight = Math.max.apply(null, $("div.feature-height-" + i).map(function () {
                return $(this).height();
              }).get());
              $("div.feature-height-" + i + " .feature-single").css("min-height", maxFeatureHeight - 20);
            }
          }
          $scope.parentScope.resizeIframe();
        });
      }, 500)
    };

  }]);
})(angular);
