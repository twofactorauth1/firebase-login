// 'use strict'; <--- DO NOT USE! CKEDITOR FAILS (https://github.com/WebSpellChecker/ckeditor-plugin-scayt/issues/65)
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
app.directive("elem", function ($timeout) {
  return {
    require: '?ngModel',
    replace: true,
    transclude: true,
    scope: {
      title: '@ngModel',
      className: '@className'
    },
    template: '<div class="edit-wrap"><span class="editable-title">{{title | formatText}}</span><div class="editable element-wrap {{className}}" ng-bind-html="ngModel | unsafe"></div></div>',
    link: function (scope, element, attrs, ngModel) {

      scope.update = function (e) {
        $timeout(function () {
          scope.$apply(function () {
            ngModel.$setViewValue(e.editor.getData());
          });
        },0);
      };

      scope.setContent = function (e) {
        $timeout(function () {
          scope.$apply(function () {
            e.editor.setData(ngModel.$viewValue);
          });
        },0);
      };

      var elem = angular.element(element[0].querySelector('.editable'))[0];
      CKEDITOR.inline(elem, {
        on: {
          instanceReady: function (ev) {
            var editor = ev.editor;
            editor.setReadOnly(false);
            editor.setData(ngModel.$viewValue);
            editor.on('change', function (e) {
              scope.update(e);
            });
            editor.on('key', function (e) {
              scope.update(e);
            });
            editor.on('customUpdate', function (e) {
              scope.setContent(e);
            });
          }
        },
        sharedSpaces: {
          top: 'editor-toolbar'
        }
      });
    }
  };
});
